import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getAudioUrl, getThumbnailUrl } from './homeDataStore'
import type { Song, SongListItem, TrendingSong } from '../types/api'

// 已下载歌曲的数据结构
export interface DownloadedSong {
  id: string
  title: string
  filePath: string
  fileSize: number
  downloadedAt: string
  coverUrl?: string
  artists?: string
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
  // 打开文件所在位置
  showInFolder: (songId: string) => Promise<boolean>
}

// Context 类型
type DownloadStoreContextType = DownloadStoreState & DownloadStoreMethods

const DownloadStoreContext = createContext<DownloadStoreContextType | null>(null)

// Provider
export function DownloadStoreProvider({ children }: { children: React.ReactNode }) {
  const [downloads, setDownloads] = useState<DownloadedSong[]>([])
  const [downloadingMap, setDownloadingMap] = useState<Map<string, DownloadState>>(new Map())

  // 加载已下载列表
  const refreshDownloads = useCallback(async () => {
    try {
      // 检查 API 是否可用
      if (!window.electronAPI?.getDownloads) {
        console.warn('[DownloadStore] getDownloads API not available')
        return
      }
      const result = await window.electronAPI.getDownloads()
      setDownloads(result || [])
    } catch (error) {
      console.error('[DownloadStore] Failed to refresh downloads:', error)
    }
  }, [])

  // 初始化 - 延迟加载，不阻塞应用
  useEffect(() => {
    // 延迟初始化，确保 Electron API 已准备好
    const timer = setTimeout(() => {
      refreshDownloads()
    }, 100)
    return () => clearTimeout(timer)
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

    // 获取封面 URL
    let coverUrl: string | undefined
    if ('coverArt' in song && song.coverArt) {
      if (song.coverArt.cloudflareId) {
        coverUrl = getThumbnailUrl(song.coverArt.cloudflareId)
      } else if (song.coverArt.absolutePath) {
        const path = song.coverArt.absolutePath
        if (path.startsWith('http')) {
          coverUrl = path
        } else {
          coverUrl = `https://storage.neurokaraoke.com${path.startsWith('/') ? '' : '/'}${path}`
        }
      }
    }

    // 获取艺术家信息
    let artists: string | undefined
    if ('coverArtists' in song && song.coverArtists?.length) {
      artists = song.coverArtists.join(', ')
    } else if ('originalArtists' in song && song.originalArtists?.length) {
      artists = song.originalArtists.join(', ')
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
      const result = await window.electronAPI.downloadAudio(songId, audioUrl, song.title || 'Unknown', coverUrl, artists)

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

  // 打开文件所在位置
  const showInFolder = useCallback(async (songId: string): Promise<boolean> => {
    try {
      const result = await window.electronAPI.showInFolder(songId)
      return result.success
    } catch (error) {
      console.error('[DownloadStore] Show in folder failed:', error)
      return false
    }
  }, [])

  const value: DownloadStoreContextType = {
    downloads,
    downloadingMap,
    downloadSong,
    deleteDownload,
    isDownloaded,
    getDownloadState,
    refreshDownloads,
    showInFolder,
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
