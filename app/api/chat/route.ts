const OLLAMA_BASE = process.env.OLLAMA_BASE_URL?.replace(/\/$/, '') || "http://localhost:11434"

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, model = "llama3.2" } = await req.json()
    
    console.log('=== Chat Request ===')
    console.log('Model:', model)
    console.log('Message count:', messages.length)
    console.log('Last message:', messages[messages.length - 1]?.content)
    console.log('OLLAMA_BASE:', OLLAMA_BASE)
    console.log('====================')

    // Use the model name as-is from the frontend (it already includes the tag)
    const modelName = model
    console.log('Using model:', modelName)

    // Validate messages format
    if (!Array.isArray(messages) || messages.some(m => !m.role || !m.content)) {
      throw new Error('Invalid messages format. Expected an array of { role, content } objects.');
    }

    try {
      console.log('Calling Ollama /api/chat endpoint directly')

      // Use Ollama's chat API directly
      const ollamaResp = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: messages.map((m: any) => ({
            role: m.role,
            content: m.content
          })),
          stream: true,
        }),
      })

      if (!ollamaResp.ok) {
        const text = await ollamaResp.text().catch(() => '')
        throw new Error(`Ollama error: ${ollamaResp.status} ${text}`)
      }

      // Parse Ollama's JSON lines stream and forward only the message content
      const reader = ollamaResp.body?.getReader()
      if (!reader) throw new Error('No response body from Ollama')

      const textDecoder = new TextDecoder()
      const textEncoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          let buffer = ''
          try {
            while (true) {
              const { value, done } = await reader.read()
              if (done) break
              buffer += textDecoder.decode(value, { stream: true })

              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed) continue
                try {
                  const obj = JSON.parse(trimmed)
                  if (obj?.message?.content) {
                    controller.enqueue(textEncoder.encode(obj.message.content))
                  }
                  if (obj?.done) {
                    controller.close()
                    return
                  }
                } catch (e) {
                  console.error('Failed to parse JSON line:', trimmed, e)
                }
              }
            }

            // process any remaining buffer
            if (buffer.trim()) {
              try {
                const obj = JSON.parse(buffer.trim())
                if (obj?.message?.content) {
                  controller.enqueue(textEncoder.encode(obj.message.content))
                }
              } catch (e) {
                console.error('Failed to parse final buffer:', buffer, e)
              }
            }

            controller.close()
          } catch (err) {
            console.error('Stream error:', err)
            controller.error(err)
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    } catch (streamError) {
      console.error('Ollama API error:', streamError)
      throw new Error(`Failed to stream response: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`)
    }
    
  } catch (error) {
    console.error("=== Chat API Error ===")
    console.error('Error details:', error)
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    console.error("======================")
    
    return new Response(
      JSON.stringify({
        error: `Failed to process chat request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    )
  }
}
