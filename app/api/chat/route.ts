import { streamText, type UIMessage as Message } from "ai"
import { createOllama } from "ollama-ai-provider"

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
})
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL?.replace(/\/$/, '') || "http://localhost:11434"

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, model = "llama3.2" } = await req.json()
    
    console.log('=== Chat Request ===')
    console.log('Model:', model)
    console.log('Message count:', messages.length)
    console.log('Last message:', messages[messages.length - 1]?.content)
    console.log('OLLAMA_BASE_URL:', process.env.OLLAMA_BASE_URL)
    console.log('====================')

    const modelName = model.endsWith(':latest') ? model : `${model}:latest`
    console.log('Using model:', modelName)

    // Validate messages format
    if (!Array.isArray(messages) || messages.some(m => !m.role || !m.content)) {
      throw new Error('Invalid messages format. Expected an array of { role, content } objects.');
    }

    try {
      // Use the AI SDK stream; types may differ across versions so cast when necessary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await streamText({
        // Pass the provider shim; the SDK may accept different model shapes
        model: ollama(modelName) as any,
        messages: messages as any,
        system: "You are a helpful AI assistant. Provide clear, concise, and helpful responses.",
        temperature: 0.7,
      });

      console.log('Streaming response...')
      
      // Convert the result to a stream and return it directly
  // Some SDK versions expose toTextStreamResponse
  const stream = await (result.toDataStreamResponse?.() ?? result.toTextStreamResponse?.())
      
      // Create a new response with the stream and proper headers
      return new Response(stream.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
      
    } catch (streamError) {
      console.error('Stream error:', streamError);
        // If the AI SDK doesn't support the model (v1 spec), fall back to calling Ollama's /api/generate
        const msg = streamError instanceof Error ? streamError.message : String(streamError)
        if (msg.includes('Unsupported model version v1') || msg.includes('Unsupported model version')) {
          try {
            console.log('Falling back to Ollama /api/generate for model', modelName)

            // Build a simple prompt from the messages (coerce to any to avoid SDK type shapes)
            const systemPrefix = "You are a helpful AI assistant. Provide clear, concise, and helpful responses.";
            const promptParts: string[] = [systemPrefix]
            for (const m of messages as any[]) {
              if (m.role === 'system') promptParts.push(`System: ${m.content || m.data || ''}`)
              else if (m.role === 'user') promptParts.push(`User: ${m.content || m.data || ''}`)
              else promptParts.push(`Assistant: ${m.content || m.data || ''}`)
            }
            const prompt = promptParts.join('\n\n')

            const ollamaResp = await fetch(`${OLLAMA_BASE}/api/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
              },
            body: JSON.stringify({
              model: modelName,
              prompt,
              max_tokens: 2000,
              temperature: 0.7,
              stream: true,
            }),
            })

            if (!ollamaResp.ok) {
              const text = await ollamaResp.text().catch(() => '')
              throw new Error(`Ollama generate error: ${ollamaResp.status} ${text}`)
            }

            // Parse Ollama's JSON lines stream server-side and forward only the `response` text
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
                        if (obj && typeof obj.response === 'string') {
                          controller.enqueue(textEncoder.encode(obj.response))
                        }
                        if (obj && obj.done) {
                          controller.close()
                          return
                        }
                      } catch (e) {
                        // If not JSON, forward raw line
                        controller.enqueue(textEncoder.encode(trimmed))
                      }
                    }
                  }

                  // process any remaining buffer
                  if (buffer.trim()) {
                    try {
                      const obj = JSON.parse(buffer.trim())
                      if (obj && typeof obj.response === 'string') controller.enqueue(textEncoder.encode(obj.response))
                    } catch (e) {
                      controller.enqueue(textEncoder.encode(buffer))
                    }
                  }

                  controller.close()
                } catch (err) {
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
          } catch (ollamaErr) {
            console.error('Ollama fallback error:', ollamaErr)
            throw new Error(`Failed to stream response (Ollama fallback): ${ollamaErr instanceof Error ? ollamaErr.message : String(ollamaErr)}`)
          }
        }

        throw new Error(`Failed to stream response: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`);
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
