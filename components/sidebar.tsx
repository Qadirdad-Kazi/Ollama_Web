"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Settings, User, X, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface SidebarProps {
  onClose: () => void
  onNewChat: () => void
}

export default function Sidebar({ onClose, onNewChat }: SidebarProps) {
  const router = useRouter()

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">AI Chat</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          <div className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">Your conversations will appear here</p>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          onClick={() => router.push("/settings")}
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Settings</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage models</p>
          </div>
          <Settings className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
