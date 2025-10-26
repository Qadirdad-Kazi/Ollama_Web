'use client'

import { useState, useEffect } from 'react'
import { isLocalOllamaAvailable } from '@/lib/ollama-config'

export type OllamaMode = 'local' | 'remote' | 'checking'

/**
 * Hook to detect and manage Ollama connection mode
 * Automatically detects if user has local Ollama running
 */
export function useOllamaMode() {
  const [mode, setMode] = useState<OllamaMode>('checking')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkMode()
  }, [])

  const checkMode = async () => {
    setIsChecking(true)
    const hasLocal = await isLocalOllamaAvailable()
    setMode(hasLocal ? 'local' : 'remote')
    setIsChecking(false)
  }

  const switchMode = (newMode: 'local' | 'remote') => {
    setMode(newMode)
  }

  return {
    mode,
    isChecking,
    checkMode,
    switchMode,
    isLocal: mode === 'local',
    isRemote: mode === 'remote',
  }
}

