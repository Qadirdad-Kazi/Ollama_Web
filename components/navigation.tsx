"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare, Settings, Bot } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Chat", icon: MessageSquare },
    { href: "/models", label: "Models", icon: Settings },
  ]

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold text-slate-800">MERN AI</span>
        </div>

        <div className="flex gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Button key={item.href} variant={isActive ? "default" : "ghost"} asChild>
                <Link href={item.href} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
