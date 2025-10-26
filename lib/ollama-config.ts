// Ollama configuration and connection utilities

export const OLLAMA_CONFIG = {
  LOCAL_URL: 'http://localhost:11434',
  // This will be populated from environment or detected at runtime
  REMOTE_URL: typeof window === 'undefined' 
    ? process.env.OLLAMA_BASE_URL 
    : null,
}

/**
 * Check if local Ollama is available
 * This runs in the browser and attempts to connect to localhost
 */
export async function isLocalOllamaAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
    
    const response = await fetch(`${OLLAMA_CONFIG.LOCAL_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Get the appropriate Ollama mode (local or remote)
 */
export async function getOllamaMode(): Promise<'local' | 'remote'> {
  const hasLocal = await isLocalOllamaAvailable()
  return hasLocal ? 'local' : 'remote'
}

/**
 * Check Ollama connection status
 */
export async function checkOllamaStatus() {
  const localAvailable = await isLocalOllamaAvailable()
  
  return {
    local: {
      available: localAvailable,
      url: OLLAMA_CONFIG.LOCAL_URL,
    },
    remote: {
      // Remote check happens through our API
      url: 'via API',
    },
    recommended: localAvailable ? 'local' : 'remote',
  }
}

