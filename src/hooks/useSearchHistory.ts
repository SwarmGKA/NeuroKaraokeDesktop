import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'search-history'
const MAX_HISTORY = 10

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  // Load history from storage on init
  useEffect(() => {
    loadHistory()
  }, [])

  // Load search history
  const loadHistory = async () => {
    try {
      const saved = await window.electronAPI.storeGet(STORAGE_KEY)
      if (Array.isArray(saved)) {
        setHistory(saved)
      }
    } catch (error) {
      console.error('[SearchHistory] Failed to load:', error)
    }
  }

  // Add search term to history
  const addHistory = useCallback(async (query: string) => {
    if (!query.trim()) return

    const newHistory = [
      query.trim(),
      ...history.filter(item => item !== query.trim())
    ].slice(0, MAX_HISTORY)

    setHistory(newHistory)
    try {
      await window.electronAPI.storeSet(STORAGE_KEY, newHistory)
    } catch (error) {
      console.error('[SearchHistory] Failed to save:', error)
    }
  }, [history])

  // Remove single history item
  const removeHistory = useCallback(async (query: string) => {
    const newHistory = history.filter(item => item !== query)
    setHistory(newHistory)
    try {
      await window.electronAPI.storeSet(STORAGE_KEY, newHistory)
    } catch (error) {
      console.error('[SearchHistory] Failed to remove:', error)
    }
  }, [history])

  // Clear all history
  const clearHistory = useCallback(async () => {
    setHistory([])
    try {
      await window.electronAPI.storeSet(STORAGE_KEY, [])
    } catch (error) {
      console.error('[SearchHistory] Failed to clear:', error)
    }
  }, [])

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  }
}
