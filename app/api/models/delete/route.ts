export async function DELETE(req: Request) {
  try {
    const { model } = await req.json()

    if (!model) {
      return Response.json({ error: "Model name is required" }, { status: 400 })
    }

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434"

    const response = await fetch(`${ollamaBaseUrl}/api/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: model }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to delete model: ${response.status}`)
    }

    return Response.json({ success: true, message: `Model ${model} deleted successfully` })
  } catch (error) {
    console.error("Delete Model API Error:", error)
    return Response.json({ error: error instanceof Error ? error.message : "Failed to delete model" }, { status: 500 })
  }
}
