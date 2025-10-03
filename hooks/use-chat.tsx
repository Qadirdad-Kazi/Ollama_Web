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
}

export function useChat(options: UseChatOptions = {}) {
  const { api = "/api/chat", body = {}, onResponse, onFinish, onError } = options

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

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
        const res = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages, model: bodyRef.current?.model }),
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
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = !!readerDone
          if (value) {
            const chunk = decoder.decode(value)
            setMessages((prev) => {
              // append chunk to the last assistant message
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

        onFinish && onFinish(undefined)
      } catch (err: any) {
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        onError && onError(e)
        setMessages((prev) => [
          ...prev,
          { id: `error-${Date.now()}`, role: "assistant", content: `Error: ${e.message}` },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [api, input, isLoading, messages, onResponse, onFinish, onError]
  )

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    error,
  }
}

export default useChat
