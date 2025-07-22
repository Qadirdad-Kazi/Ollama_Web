import { streamText, type Message } from "ai"
import { createOllama } from "ollama-ai-provider"

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
})

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
      const result = await streamText({
        model: ollama(modelName),
        messages: messages as Message[],
        system: "You are a helpful AI assistant. Provide clear, concise, and helpful responses.",
        temperature: 0.7,
        maxTokens: 2000,
      });

      console.log('Streaming response...')
      
      // Convert the result to a stream and return it directly
      const stream = await result.toDataStreamResponse();
      
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
