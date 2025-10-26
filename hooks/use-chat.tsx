import { useState, useRef, useCallback, useEffect } from "react"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

type UseChatOptions = {
  api?: string
  body?: Record<string, any>
  onResponse?: (res: Response) => void
  onFinish?: (message?: Message) => void
  onError?: (err: Error) => void
  mode?: 'local' | 'remote' // New: support local Ollama
}

export function useChat(options: UseChatOptions = {}) {
  const { api = "/api/chat", body = {}, onResponse, onFinish, onError, mode = 'remote' } = options

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

	// Track the current streaming request so it can be aborted on reset/new chat
	const controllerRef = useRef<AbortController | null>(null)

  const bodyRef = useRef(body)
  useEffect(() => {
    bodyRef.current = body
  }, [body])

  const handleInputChange = useCallback((e: any) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e?: any) => {
      if (e && typeof e.preventDefault === "function") e.preventDefault()
      if (!input.trim() || isLoading) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: input,
      }

      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput("")
      setIsLoading(true)
      setError(null)

      try {
        // Abort any in-flight request before starting a new one
        if (controllerRef.current) {
          controllerRef.current.abort()
        }
        controllerRef.current = new AbortController()
        
        // Use local Ollama directly if in local mode
        const endpoint = mode === 'local' ? 'http://localhost:11434/api/chat' : api
        const requestBody = mode === 'local' 
          ? {
              model: bodyRef.current?.model || 'llama3.2',
              messages: newMessages.map(m => ({ role: m.role, content: m.content })),
              stream: true,
            }
          : { messages: newMessages, model: bodyRef.current?.model }
        
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controllerRef.current.signal,
        })

        onResponse && onResponse(res)

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Server error: ${res.status} ${text}`)
        }

        // Create assistant placeholder message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "",
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Stream the response body (text/event-stream or plain chunks)
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        if (!reader) {
          throw new Error("No response body")
        }

        let done = false
        let buffer = ''
        
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = !!readerDone
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            
            // Local mode returns JSON lines, remote returns plain text
            if (mode === 'local') {
              buffer += chunk
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''
              
              for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed) continue
                try {
                  const obj = JSON.parse(trimmed)
                  if (obj?.message?.content) {
                    const content = obj.message.content
                    setMessages((prev) => {
                      const copy = [...prev]
                      const lastIndex = copy.map((m) => m.role).lastIndexOf("assistant")
                      if (lastIndex !== -1) {
                        copy[lastIndex] = { ...copy[lastIndex], content: copy[lastIndex].content + content }
                      } else {
                        copy.push({ id: `assistant-${Date.now()}`, role: "assistant", content })
                      }
                      return copy
                    })
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            } else {
              // Remote mode - plain text chunks
              setMessages((prev) => {
                const copy = [...prev]
                const lastIndex = copy.map((m) => m.role).lastIndexOf("assistant")
                if (lastIndex !== -1) {
                  copy[lastIndex] = { ...copy[lastIndex], content: copy[lastIndex].content + chunk }
                } else {
                  copy.push({ id: `assistant-${Date.now()}`, role: "assistant", content: chunk })
                }
                return copy
              })
            }
          }
        }

        onFinish && onFinish(undefined)
      } catch (err: any) {
        // Ignore abort errors - they're intentional (user canceled or reset chat)
        if (err.name === 'AbortError') {
          return
        }
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        onError && onError(e)
        setMessages((prev) => [
          ...prev,
          { id: `error-${Date.now()}`, role: "assistant", content: `Error: ${e.message}` },
        ])
      } finally {
        setIsLoading(false)
        controllerRef.current = null
      }
    },
    [api, input, isLoading, messages, onResponse, onFinish, onError, mode]
  )

  const resetChat = useCallback(() => {
    console.log('resetChat called - clearing all state')
    // Abort any active stream and clear state
    if (controllerRef.current) {
      controllerRef.current.abort()
      controllerRef.current = null
    }
    setMessages([])
    setInput("")
    setError(null)
    setIsLoading(false)
    console.log('resetChat completed - state should be cleared')
  }, [])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    error,
    resetChat,
  }
}

export default useChat
