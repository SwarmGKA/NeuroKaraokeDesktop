import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getAudioUrl } from './homeDataStore'
import type { Song, SongListItem, TrendingSong } from '../types/api'

// 已下载歌曲的数据结构
export interface DownloadedSong {
  id: string
  title: string
  filePath: string
  fileSize: number
  downloadedAt: string
}

// 下载状态
export interface DownloadState {
  songId: string
  progress: number
  status: 'downloading' | 'completed' | 'error'
  error?: string
}

// Store 状态
interface DownloadStoreState {
  // 已下载列表
  downloads: DownloadedSong[]
  // 下载中状态
  downloadingMap: Map<string, DownloadState>
  // 加载状态
  isLoading: boolean
}

// Store 方法
interface DownloadStoreMethods {
  // 下载歌曲
  downloadSong: (song: Song | SongListItem | TrendingSong) => Promise<boolean>
  // 删除下载
  deleteDownload: (songId: string) => Promise<boolean>
  // 检查是否已下载
  isDownloaded: (songId: string | undefined) => boolean
  // 获取下载状态
  getDownloadState: (songId: string | undefined) => DownloadState | undefined
  // 刷新下载列表
  refreshDownloads: () => Promise<void>
}

// Context 类型
type DownloadStoreContextType = DownloadStoreState & DownloadStoreMethods

const DownloadStoreContext = createContext<DownloadStoreContextType | null>(null)

// Provider
export function DownloadStoreProvider({ children }: { children: React.ReactNode }) {
  const [downloads, setDownloads] = useState<DownloadedSong[]>([])
  const [downloadingMap, setDownloadingMap] = useState<Map<string, DownloadState>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  // 加载已下载列表
  const refreshDownloads = useCallback(async () => {
    try {
      const result = await window.electronAPI.getDownloads()
      setDownloads(result || [])
    } catch (error) {
      console.error('[DownloadStore] Failed to refresh downloads:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初始化
  useEffect(() => {
    refreshDownloads()
  }, [refreshDownloads])

  // 下载歌曲
  const downloadSong = useCallback(async (song: Song | SongListItem | TrendingSong): Promise<boolean> => {
    const songId = song.id
    if (!songId) {
      console.error('[DownloadStore] Song has no ID')
      return false
    }

    // 检查是否已下载
    if (downloads.some(d => d.id === songId)) {
      return true
    }

    // 检查是否正在下载
    if (downloadingMap.has(songId)) {
      return false
    }

    // 获取音频 URL
    let audioUrl: string | undefined
    if ('audioUrl' in song && song.audioUrl) {
      audioUrl = song.audioUrl
    } else if ('absolutePath' in song && song.absolutePath) {
      audioUrl = getAudioUrl(song.absolutePath)
    }

    if (!audioUrl) {
      console.error('[DownloadStore] No audio URL for song:', songId)
      return false
    }

    // 设置下载中状态
    setDownloadingMap(prev => {
      const next = new Map(prev)
      next.set(songId, { songId, progress: 0, status: 'downloading' })
      return next
    })

    try {
      // 订阅进度
      const unsubscribe = window.electronAPI.subscribeDownloadProgress(songId, (progress) => {
        setDownloadingMap(prev => {
          const next = new Map(prev)
          const state = next.get(songId)
          if (state) {
            next.set(songId, { ...state, progress })
          }
          return next
        })
      })

      // 开始下载
      const result = await window.electronAPI.downloadAudio(songId, audioUrl, song.title || 'Unknown')

      unsubscribe()

      if (result.success && result.song) {
        // 更新状态
        setDownloadingMap(prev => {
          const next = new Map(prev)
          next.delete(songId)
          return next
        })

        // 更新列表
        setDownloads(prev => [...prev, result.song!])
        return true
      } else {
        // 设置错误状态
        setDownloadingMap(prev => {
          const next = new Map(prev)
          next.set(songId, { songId, progress: 0, status: 'error', error: result.error })
          return next
        })

        // 3秒后清除错误状态
        setTimeout(() => {
          setDownloadingMap(prev => {
            const next = new Map(prev)
            next.delete(songId)
            return next
          })
        }, 3000)

        return false
      }
    } catch (error) {
      console.error('[DownloadStore] Download failed:', error)

      setDownloadingMap(prev => {
        const next = new Map(prev)
        next.set(songId, { songId, progress: 0, status: 'error', error: String(error) })
        return next
      })

      setTimeout(() => {
        setDownloadingMap(prev => {
          const next = new Map(prev)
          next.delete(songId)
          return next
        })
      }, 3000)

      return false
    }
  }, [downloads, downloadingMap])

  // 删除下载
  const deleteDownload = useCallback(async (songId: string): Promise<boolean> => {
    try {
      const result = await window.electronAPI.deleteDownload(songId)
      if (result.success) {
        setDownloads(prev => prev.filter(d => d.id !== songId))
        return true
      }
      return false
    } catch (error) {
      console.error('[DownloadStore] Delete failed:', error)
      return false
    }
  }, [])

  // 检查是否已下载
  const isDownloaded = useCallback((songId: string | undefined): boolean => {
    if (!songId) return false
    return downloads.some(d => d.id === songId)
  }, [downloads])

  // 获取下载状态
  const getDownloadState = useCallback((songId: string | undefined): DownloadState | undefined => {
    if (!songId) return undefined
    return downloadingMap.get(songId)
  }, [downloadingMap])

  const value: DownloadStoreContextType = {
    downloads,
    downloadingMap,
    isLoading,
    downloadSong,
    deleteDownload,
    isDownloaded,
    getDownloadState,
    refreshDownloads,
  }

  return React.createElement(DownloadStoreContext.Provider, { value }, children)
}

// Hook
export function useDownloadStore() {
  const context = useContext(DownloadStoreContext)
  if (!context) {
    throw new Error('useDownloadStore must be used within DownloadStoreProvider')
  }
  return context
}
