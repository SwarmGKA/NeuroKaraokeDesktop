import { createContext, useContext, useState, useCallback } from 'react'
import type { Playlist } from '../types/api'

interface PlaylistDetailContextType {
  currentPlaylist: Playlist | null
  playlistId: string | null
  loading: boolean
  error: string | null
  openPlaylist: (id: string) => Promise<void>
  closePlaylist: () => void
}

const PlaylistDetailContext = createContext<PlaylistDetailContextType | null>(null)

export function PlaylistDetailProvider({ children }: { children: React.ReactNode }) {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openPlaylist = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
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
