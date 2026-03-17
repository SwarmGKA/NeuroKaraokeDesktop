import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'search-history'
const MAX_HISTORY = 10

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  // 初始化时从存储加载历史
  useEffect(() => {
    loadHistory()
  }, [])

  // 加载搜索历史
  const loadHistory = async () => {
    try {
      const saved = await window.electronAPI.storeGet(STORAGE_KEY)
      if (Array.isArray(saved)) {
        setHistory(saved)
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error)
    }
  }

  // 添加搜索词到历史
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
      console.error('保存搜索历史失败:', error)
    }
  }, [history])

  // 删除单条历史
  const removeHistory = useCallback(async (query: string) => {
    const newHistory = history.filter(item => item !== query)
    setHistory(newHistory)
    try {
      await window.electronAPI.storeSet(STORAGE_KEY, newHistory)
    } catch (error) {
      console.error('删除搜索历史失败:', error)
    }
  }, [history])

  // 清空历史
  const clearHistory = useCallback(async () => {
    setHistory([])
    try {
      await window.electronAPI.storeSet(STORAGE_KEY, [])
    } catch (error) {
      console.error('清空搜索历史失败:', error)
    }
  }, [])

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  }
}
