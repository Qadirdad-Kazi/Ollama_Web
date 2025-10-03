"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Settings, Sparkles, ArrowUp } from "lucide-react"
import useChat from "@/hooks/use-chat"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "@/components/sidebar"
import MessageBubble from "@/components/message-bubble"
import TypingIndicator from "@/components/typing-indicator"

interface OllamaModel {
  name: string
  size: number
  digest: string
}

export default function ChatPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)

  const modelTag = selectedModel ? `(${selectedModel})` : ""
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, error } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
    },
    onResponse: (response) => {
      console.log('Chat response received:', response.status, response.statusText);
      if (!response.ok) {
        console.error('Chat response error:', response.status, response.statusText);
      }
    },
    onFinish: (message) => {
      console.log('Chat finished:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      // Add the error message to the chat
      setMessages([...messages, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error.message || 'An error occurred while processing your request.'}`,
      }]);
    },
  });
  
  // Debug: Log messages when they change
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);
  
  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Chat error state:', error);
    }
  }, [error]);

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models")
        if (response.ok) {
          const data = await response.json()
          setAvailableModels(data.models || [])
          if (data.models && data.models.length > 0 && !selectedModel) {
            setSelectedModel(data.models[0].name)
          }
        }
      } catch (error) {
        console.error("Failed to fetch models:", error)
      } finally {
        setModelsLoading(false)
      }
    }

    fetchModels()
  }, [])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    handleSubmit(e)
  }

  const handleNewChat = () => {
    setMessages([])
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    // Clear messages when switching models
    setMessages([])
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-80 border-r border-gray-200 dark:border-gray-700"
          >
            <Sidebar onClose={() => setSidebarOpen(false)} onNewChat={handleNewChat} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="mr-2">
                <MessageSquare className="w-4 h-4" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Made By Qadirdad-Kazi With ❤️ </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <Select value={selectedModel} onValueChange={handleModelChange} disabled={modelsLoading}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={modelsLoading ? "Loading models..." : "Select model"} />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-gray-500">{(model.size / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" onClick={() => router.push("/settings")}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="max-w-4xl mx-auto py-8">
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">How can I help you today?</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Currently using:{" "}
                  <span className="font-medium text-purple-600 dark:text-purple-400">{selectedModel}</span>
                </p>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    { icon: "💡", title: "Creative Writing", desc: "Help me write a story" },
                    { icon: "🔍", title: "Research", desc: "Explain complex topics" },
                    { icon: "💻", title: "Coding", desc: "Debug and write code" },
                    { icon: "🎯", title: "Planning", desc: "Organize my tasks" },
                  ].map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800"
                      onClick={() => {
                        const input = document.querySelector('input[name="message"]') as HTMLInputElement
                        if (input) {
                          input.value = suggestion.desc
                          input.focus()
                        }
                      }}
                    >
                      <div className="text-2xl mb-2">{suggestion.icon}</div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">{suggestion.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{suggestion.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <MessageBubble key={message.id} message={message} index={index} />
                ))}
                {isLoading && <TypingIndicator />}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleFormSubmit} className="relative">
              <div className="relative flex items-center">
                <Input
                  name="message"
                  value={input}
                  onChange={handleInputChange}
                  placeholder={`Message ${selectedModel}...`}
                  disabled={isLoading || availableModels.length === 0}
                  className="pr-12 py-6 text-base border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim() || availableModels.length === 0}
                  size="sm"
                  className="absolute right-2 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              {availableModels.length === 0
                ? "No models available. Please check your Ollama installation."
                : "AI can make mistakes. Consider checking important information."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
