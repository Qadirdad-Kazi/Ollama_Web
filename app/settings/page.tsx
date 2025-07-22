"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Download,
  Trash2,
  RefreshCw,
  Server,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

interface OllamaModel {
  name: string
  size: number
  digest: string
  modified_at: string
}

interface SystemInfo {
  version: string
  status: "connected" | "disconnected"
  baseUrl: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [models, setModels] = useState<OllamaModel[]>([])
  const [loading, setLoading] = useState(true)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [pullModel, setPullModel] = useState("")
  const [pulling, setPulling] = useState(false)
  const [pullProgress, setPullProgress] = useState("")

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/models")
      if (response.ok) {
        const data = await response.json()
        setModels(data.models || [])
        setSystemInfo({
          version: data.version || "Unknown",
          status: "connected",
          baseUrl: data.baseUrl || process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434",
        })
      } else {
        setSystemInfo({
          version: "Unknown",
          status: "disconnected",
          baseUrl: process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434",
        })
      }
    } catch (error) {
      console.error("Failed to fetch models:", error)
      setSystemInfo({
        version: "Unknown",
        status: "disconnected",
        baseUrl: process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePullModel = async () => {
    if (!pullModel.trim()) return

    try {
      setPulling(true)
      setPullProgress("Starting download...")

      const response = await fetch("/api/models/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: pullModel.trim() }),
      })

      if (response.ok) {
        setPullProgress("Model downloaded successfully!")
        setPullModel("")
        setTimeout(() => {
          fetchModels()
          setPullProgress("")
        }, 2000)
      } else {
        const error = await response.json()
        setPullProgress(`Error: ${error.error || "Failed to download model"}`)
      }
    } catch (error) {
      setPullProgress("Error: Failed to download model")
    } finally {
      setPulling(false)
    }
  }

  const handleDeleteModel = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete ${modelName}?`)) return

    try {
      const response = await fetch("/api/models/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName }),
      })

      if (response.ok) {
        fetchModels()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || "Failed to delete model"}`)
      }
    } catch (error) {
      alert("Error: Failed to delete model")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.push("/")} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your Ollama models and configuration</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${systemInfo?.status === "connected" ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <div>
                    <p className="text-sm font-medium">Connection Status</p>
                    <p className="text-xs text-gray-500 capitalize">{systemInfo?.status || "Unknown"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Base URL</p>
                  <p className="text-xs text-gray-500 font-mono">{systemInfo?.baseUrl}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-xs text-gray-500">{systemInfo?.version}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Change the application theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Pull New Model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="model-name">Model Name</Label>
                    <Input
                      id="model-name"
                      placeholder="e.g., llama3.2, codellama, mistral"
                      value={pullModel}
                      onChange={(e) => setPullModel(e.target.value)}
                      disabled={pulling}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handlePullModel} disabled={pulling || !pullModel.trim()}>
                      {pulling ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {pulling ? "Downloading..." : "Download"}
                    </Button>
                  </div>
                </div>
                {pullProgress && (
                  <div
                    className={`flex items-center gap-2 text-sm ${pullProgress.includes("Error") ? "text-red-600" : "text-green-600"}`}
                  >
                    {pullProgress.includes("Error") ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {pullProgress}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  <p>Popular models: llama3.2, codellama, mistral, phi3, gemma2</p>
                  <p>
                    Visit{" "}
                    <a
                      href="https://ollama.com/library"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                    >
                      ollama.com/library
                    </a>{" "}
                    for more models
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installed Models */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Installed Models ({models.length})
                </CardTitle>
                <Button variant="outline" onClick={fetchModels} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                </div>
              ) : models.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No models installed</p>
                  <p className="text-sm text-gray-500">Download a model above to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {models.map((model, index) => (
                    <motion.div
                      key={model.digest}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{model.name}</h3>
                          <Badge variant="secondary">{formatSize(model.size)}</Badge>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Modified: {new Date(model.modified_at).toLocaleDateString()}</p>
                          <p className="font-mono text-xs">Digest: {model.digest.substring(0, 16)}...</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteModel(model.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
