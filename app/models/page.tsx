"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Trash2, RefreshCw } from "lucide-react"

interface OllamaModel {
  name: string
  size: number
  digest: string
  modified_at: string
}

export default function ModelsPage() {
  const [models, setModels] = useState<OllamaModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/models")
      if (!response.ok) throw new Error("Failed to fetch models")
      const data = await response.json()
      setModels(data.models || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const formatSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Ollama Models</h1>
            <p className="text-slate-600">Manage your local Ollama AI models</p>
          </div>
          <Button onClick={fetchModels} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">Error: {error}</p>
              <p className="text-sm text-red-500 mt-1">Make sure Ollama is running on your system</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
          </div>
        ) : (
          <div className="grid gap-4">
            {models.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-slate-600 mb-4">No models found</p>
                  <p className="text-sm text-slate-500">
                    Install models using: <code className="bg-slate-100 px-2 py-1 rounded">ollama pull llama3.2</code>
                  </p>
                </CardContent>
              </Card>
            ) : (
              models.map((model) => (
                <Card key={model.digest} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{model.name}</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">
                          Modified: {new Date(model.modified_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{formatSize(model.size)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-600 font-mono">{model.digest.substring(0, 16)}...</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
