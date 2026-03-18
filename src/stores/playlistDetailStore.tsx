import { createContext, useContext, useState, useCallback } from 'react'
import type { Playlist } from '../types/api'

interface PlaylistDetailContextType {
  currentPlaylist: Playlist | null
  playlistId: string | null
  loading: boolean
  error: string | null
  openPlaylist: (idOrPlaylist: string | Playlist) => Promise<void>
  closePlaylist: () => void
}

const PlaylistDetailContext = createContext<PlaylistDetailContextType | null>(null)

export function PlaylistDetailProvider({ children }: { children: React.ReactNode }) {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 支持传入 ID 或完整的 Playlist 对象
  // 如果传入 Playlist 对象，则直接使用，无需 API 调用
  const openPlaylist = useCallback(async (idOrPlaylist: string | Playlist) => {
    setError(null)

    if (typeof idOrPlaylist === 'object') {
      // 直接使用传入的歌单数据
      setCurrentPlaylist(idOrPlaylist)
      setPlaylistId(idOrPlaylist.id || null)
      setLoading(false)
    } else {
      // 需要从 API 获取数据
      const id = idOrPlaylist
      setLoading(true)
      setPlaylistId(id)

      try {
        const result = await window.electronAPI.getPlaylist(id)
        setCurrentPlaylist(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '获取歌单详情失败'
        setError(errorMessage)
        setCurrentPlaylist(null)
      } finally {
        setLoading(false)
      }
    }
  }, [])

  const closePlaylist = useCallback(() => {
    setCurrentPlaylist(null)
    setPlaylistId(null)
    setError(null)
  }, [])

  return (
    <PlaylistDetailContext.Provider
      value={{
        currentPlaylist,
        playlistId,
        loading,
        error,
        openPlaylist,
        closePlaylist,
      }}
    >
      {children}
    </PlaylistDetailContext.Provider>
  )
}

export function usePlaylistDetail() {
  const context = useContext(PlaylistDetailContext)
  if (!context) {
    throw new Error('usePlaylistDetail must be used within PlaylistDetailProvider')
  }
  return context
}
