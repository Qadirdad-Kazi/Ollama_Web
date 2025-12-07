export async function DELETE(req: Request) {
  try {
    const { model } = await req.json()

    if (!model) {
      return Response.json({ error: "Model name is required" }, { status: 400 })
    }

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434"

    // 1. Try to delete from registered models first
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const dataFile = path.join(process.cwd(), 'data', 'registered-models.json');

      let registeredModels = [];
      try {
        const fileContent = await fs.readFile(dataFile, 'utf-8');
        registeredModels = JSON.parse(fileContent);
      } catch (e) {
        // File doesn't exist
      }

      const newModels = registeredModels.filter((m: any) => m.name !== model);

      if (newModels.length < registeredModels.length) {
        // It was a registered model
        await fs.writeFile(dataFile, JSON.stringify(newModels, null, 2));
        return Response.json({ success: true, message: `Registered model ${model} deleted successfully` });
      }
    } catch (e) {
      console.error('Error checking registered models:', e);
    }

    // 2. If not found in registered models, try Ollama
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
