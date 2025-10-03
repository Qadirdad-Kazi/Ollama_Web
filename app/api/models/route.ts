interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export async function GET() {
  try {
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL?.replace(/\/$/, '') || "http://localhost:11434"
    
    // Get models
    console.log(`Fetching models from: ${ollamaBaseUrl}/api/tags`)
    const response = await fetch(`${ollamaBaseUrl}/api/tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Ollama API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Ollama API response:', JSON.stringify(data, null, 2))
    
    // Transform the response to match the expected format
    const models = (data.models || []).map((model: OllamaModel) => ({
      name: model.name, // Keep full model name including tag
      size: model.size,
      digest: model.digest,
      modified_at: model.modified_at,
      details: model.details
    }))

    // Get version info
    let version = "Unknown"
    try {
      const versionResponse = await fetch(`${ollamaBaseUrl}/api/version`)
      if (versionResponse.ok) {
        const versionData = await versionResponse.json()
        version = versionData.version || "Unknown"
      }
    } catch (e) {
      console.warn('Could not fetch Ollama version:', e)
    }

    return Response.json({
      models,
      version,
      baseUrl: ollamaBaseUrl,
      status: "connected",
    })
  } catch (error) {
    console.error("Models API Error:", error)
    return Response.json(
      {
        error: "Failed to connect to Ollama. Make sure Ollama is running.",
        models: [],
        status: "disconnected",
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      },
      { status: 500 },
    )
  }
}
