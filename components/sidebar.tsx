"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Settings, User, X, Sparkles, MessageSquare, Clock, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ChatHistory {
  id: string
  title: string
  messages: any[]
  createdAt: Date
  updatedAt: Date
}

interface SidebarProps {
  onClose: () => void
  onNewChat: () => void
  chatHistory: ChatHistory[]
  currentChatId: string
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
}

export default function Sidebar({ onClose, onNewChat, chatHistory, currentChatId, onSelectChat, onDeleteChat }: SidebarProps) {
  const router = useRouter()

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

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
          {chatHistory.length === 0 ? (
            <div className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Your conversations will appear here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg transition-colors group ${
                    currentChatId === chat.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      onClick={() => onSelectChat(chat.id)}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div 
                      onClick={() => onSelectChat(chat.id)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {chat.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(chat.updatedAt)}
                        </span>
                      </div>
                      {chat.messages.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(chat.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
