export async function POST(req: Request) {
  try {
    const { model } = await req.json()

    if (!model) {
      return Response.json({ error: "Model name is required" }, { status: 400 })
    }

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434"

    const response = await fetch(`${ollamaBaseUrl}/api/pull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: model }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to pull model: ${response.status}`)
    }

    return Response.json({ success: true, message: `Model ${model} downloaded successfully` })
  } catch (error) {
    console.error("Pull Model API Error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to download model" },
      { status: 500 },
    )
  }
}
