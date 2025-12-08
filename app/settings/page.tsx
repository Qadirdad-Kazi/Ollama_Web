"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Globe,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { SetupGuide } from "@/components/setup-guide"

interface OllamaModel {
  name: string
  size: number
  digest: string
  modified_at: string
  source?: 'remote' | 'local'
  baseUrl?: string
  status?: 'online' | 'offline'
  lastChecked?: string
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
  const [connectionMode, setConnectionMode] = useState<'remote' | 'local'>('remote')

  useEffect(() => {
    // Load preference
    const savedMode = localStorage.getItem('ollama_connection_mode') as 'remote' | 'local'
    if (savedMode) setConnectionMode(savedMode)
  }, [])

  const handleModeChange = (mode: 'remote' | 'local') => {
    setConnectionMode(mode)
    localStorage.setItem('ollama_connection_mode', mode)
    window.location.reload()
  }

  const fetchModels = async () => {
    try {
      setLoading(true)
      let data;
      let baseUrl = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434";

      if (connectionMode === 'local') {
        try {
          const response = await fetch("http://localhost:11434/api/tags")
          if (response.ok) {
            data = await response.json()
            setModels(data.models || [])
            setSystemInfo({
              version: "Local",
              status: "connected",
              baseUrl: "http://localhost:11434"
            })
            return; // Exit early for local mode
          }
        } catch (e: any) {
          console.error("Local fetch failed", e)
          setSystemInfo({
            version: "Unknown",
            status: "disconnected",
            baseUrl: "http://localhost:11434"
          })
          // If mixed content or network error, it might be the browser blocking it.
          // We can try to alert the user or just let the UI show "disconnected".
          if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
            // This is often CORS or Mixed Content
          }
        }
      }

      // Remote/Default Fallback
      if (!data) {
        const response = await fetch("/api/models")
        if (response.ok) {
          data = await response.json()
          setModels(data.models || [])
          setSystemInfo({
            version: data.version || "Unknown",
            status: "connected",
            baseUrl: data.baseUrl || baseUrl,
          })
        } else {
          setSystemInfo({
            version: "Unknown",
            status: "disconnected",
            baseUrl: baseUrl,
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch models:", error)
      setSystemInfo({
        version: "Unknown",
        status: "disconnected",
        baseUrl: "http://localhost:11434",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePullModel = async () => {
    if (!pullModel.trim()) return

    // In local mode, we can't easily pull via browser (Ollama API for pull is POST /api/pull)
    // But it's a streaming response which is hard to handle in this UI setup without extensive changes.
    // For now we'll warn or just fall back to server (which won't work for local).

    if (connectionMode === 'local') {
      alert("Model pulling is best done via terminal in Local Mode (ollama pull ...).")
      return;
    }

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

  const checkHealth = async () => {
    try {
      const response = await fetch("/api/models/check", { method: "POST" })
      if (response.ok) {
        fetchModels() // Reload models to get updated status
      }
    } catch (error) {
      console.error("Health check failed:", error)
    }
  }

  useEffect(() => {
    fetchModels().then(() => {
      // Run health check after initial load
      checkHealth()
    })
  }, [connectionMode])

  const formatSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your Ollama models and configuration</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <SetupGuide />
        </div>
      </div>

      <div className="grid gap-6">
        {/* Connection Mode Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Connection Mode
            </CardTitle>
            <CardDescription>
              Choose how the web app connects to Ollama.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant={connectionMode === 'remote' ? 'default' : 'outline'}
                onClick={() => handleModeChange('remote')}
                className="w-32"
              >
                Remote / Server
              </Button>
              <Button
                variant={connectionMode === 'local' ? 'default' : 'outline'}
                onClick={() => handleModeChange('local')}
                className="w-32"
              >
                Browser Local
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              {connectionMode === 'remote'
                ? "Default. The web app server talks to Ollama. Keeps your API keys secure. Requires ngrok for local models."
                : "Experimental. Your browser talks directly to localhost:11434. No ngrok needed! Requires 'OLLAMA_ORIGINS=\"*\"' setup locally."}
            </p>
            {connectionMode === 'local' && systemInfo?.status === 'disconnected' && (
              <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200 flex gap-2 items-start">
                  <span>⚠️</span>
                  <span>
                    <strong>Connection Failed:</strong> Could not connect to localhost:11434.
                    <br />
                    1. Is Ollama running?
                    <br />
                    2. Did you run <code>launchctl setenv OLLAMA_ORIGINS "*"</code>?
                    <br />
                    3. <strong>Browser Blocking:</strong> Your browser might be blocking "Mixed Content". Try using Chrome or the "Manual (Ngrok)" mode.
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Register External Model */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Register External Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Manually add a model hosted on another server or via ngrok.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reg-name-input">Model Name</Label>
                  <Input
                    id="reg-name-input"
                    placeholder="e.g. my-custom-model"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-url-input">Base URL</Label>
                  <Input
                    id="reg-url-input"
                    placeholder="e.g. https://my-api.ngrok.io"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="reg-key-input">API Key (Optional)</Label>
                  <Input
                    id="reg-key-input"
                    type="password"
                    placeholder="e.g. sk-..."
                  />
                </div>
              </div>
              <Button
                onClick={async () => {
                  const nameInput = document.getElementById('reg-name-input') as HTMLInputElement;
                  const urlInput = document.getElementById('reg-url-input') as HTMLInputElement;
                  const keyInput = document.getElementById('reg-key-input') as HTMLInputElement;
                  const name = nameInput.value.trim();
                  const url = urlInput.value.trim();
                  const apiKey = keyInput.value.trim();

                  if (!name || !url) {
                    alert('Please enter both name and URL');
                    return;
                  }

                  try {
                    const response = await fetch('/api/models/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        models: [{
                          name: name,
                          size: 0,
                          digest: 'manual-' + Date.now(),
                          modified_at: new Date().toISOString()
                        }],
                        url: url,
                        apiKey: apiKey
                      })
                    });

                    if (response.ok) {
                      nameInput.value = '';
                      urlInput.value = '';
                      keyInput.value = '';
                      fetchModels();
                      alert('Model registered successfully!');
                    } else {
                      alert('Failed to register model');
                    }
                  } catch (e) {
                    alert('Error registering model');
                  }
                }}
              >
                Register Model
              </Button>
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={checkHealth} disabled={loading}>
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  Check Status
                </Button>
                <Button variant="outline" onClick={fetchModels} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
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
                        {model.source === 'remote' && (
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                              <Globe className="w-3 h-3" />
                              <span>Remote: {model.baseUrl}</span>
                            </div>
                            {model.status && (
                              <div className={`flex items-center gap-2 text-xs ${model.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${model.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="capitalize">{model.status}</span>
                                {model.lastChecked && <span className="text-gray-400">({new Date(model.lastChecked).toLocaleTimeString()})</span>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {model.source === 'remote' && (
                        <Badge variant="outline" className="mr-2 border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                          Remote
                        </Badge>
                      )}
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
  )
}
