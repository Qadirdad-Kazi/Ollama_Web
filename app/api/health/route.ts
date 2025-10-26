// Health check endpoint for monitoring
export async function GET() {
  try {
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL?.replace(/\/$/, '') || "http://localhost:11434"
    
    // Check if Ollama is reachable
    const ollamaHealthy = await fetch(`${ollamaBaseUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
      .then(res => res.ok)
      .catch(() => false)

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        ollama: {
          status: ollamaHealthy ? 'connected' : 'disconnected',
          url: ollamaBaseUrl,
        },
      },
    })
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

