'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, Server, Laptop, RefreshCw } from 'lucide-react'
import { useOllamaMode } from '@/hooks/use-ollama-mode'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface OllamaStatusProps {
  onModeChange?: (mode: 'local' | 'remote') => void
}

export function OllamaStatus({ onModeChange }: OllamaStatusProps) {
  const { mode, isChecking, checkMode, switchMode, isLocal } = useOllamaMode()

  useEffect(() => {
    if (onModeChange && mode !== 'checking') {
      onModeChange(mode as 'local' | 'remote')
    }
  }, [mode, onModeChange])

  const handleToggleMode = async () => {
    const newMode = isLocal ? 'remote' : 'local'
    switchMode(newMode)
    if (onModeChange) {
      onModeChange(newMode)
    }
  }

  if (isChecking) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-2">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Checking...
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Detecting Ollama connection...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={isLocal ? "default" : "secondary"} 
              className="gap-2 cursor-pointer"
              onClick={handleToggleMode}
            >
              {isLocal ? (
                <>
                  <Laptop className="h-3 w-3" />
                  Local
                </>
              ) : (
                <>
                  <Server className="h-3 w-3" />
                  Remote
                </>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">
                {isLocal ? '🟢 Using Local Ollama' : '🌐 Using Remote Ollama'}
              </p>
              <p className="text-xs">
                {isLocal 
                  ? 'Connected to Ollama on your PC (localhost:11434)'
                  : 'Connected to hosted Ollama instance'
                }
              </p>
              <p className="text-xs text-muted-foreground pt-1">
                Click to switch mode
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={checkMode}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refresh connection status</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

