import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Playlist, TrendingSong, RadioState, Artist, CoverArt } from '../types/api'

// 全局封面缓存（songId -> coverArt）
const coverArtCache = new Map<string, CoverArt>()

// 获取封面缓存
export function getCoverArtFromCache(songId: string | undefined): CoverArt | undefined {
  if (!songId) return undefined
  return coverArtCache.get(songId)
}

// 更新封面缓存
export function updateCoverArtCache(songs: TrendingSong[]) {
  songs.forEach(song => {
    if (song.id && song.coverArt) {
      coverArtCache.set(song.id, song.coverArt)
    }
  })
}

// 全局数据状态接口
interface HomeDataState {
  // 推荐歌单
  officialPlaylists: Playlist[]
  playlistsLoading: boolean
  playlistsError: string | null

  // 热门趋势
  trendingSongs: TrendingSong[]
  trendingLoading: boolean
  trendingError: string | null

  // 电台状态
  radioState: RadioState | null
  radioLoading: boolean
  radioError: string | null

  // 艺术家列表（用于搜索联想）
  artists: Artist[]
  artistsLoading: boolean
  artistsError: string | null

  // 整体加载状态
  isInitialized: boolean

  // 刷新方法
  refreshPlaylists: () => Promise<void>
  refreshTrending: () => Promise<void>
  refreshRadio: () => Promise<void>
  refreshArtists: () => Promise<void>
  refreshAll: () => Promise<void>
}

const HomeDataContext = createContext<HomeDataState | null>(null)

// 获取当前年份
const currentYear = new Date().getFullYear()

// Cloudflare CDN 图片 URL 生成
// 官方文档: https://images.neurokaraoke.com/{cloudflareId}/public
export function getThumbnailUrl(cloudflareId: string | undefined): string | undefined {
  if (!cloudflareId) return undefined
  return `https://images.neurokaraoke.com/${cloudflareId}/public`
}

// 图片 URL 别名
export function getImageUrl(cloudflareId: string | undefined): string | undefined {
  return getThumbnailUrl(cloudflareId)
}

// 音频 URL 生成
const STORAGE_URL = 'https://storage.neurokaraoke.com'

export function getAudioUrl(absolutePath: string | undefined): string | undefined {
  if (!absolutePath) return undefined
  if (absolutePath.startsWith('http')) return absolutePath
  return `${STORAGE_URL}${absolutePath.startsWith('/') ? '' : '/'}${absolutePath}`
}

export function HomeDataProvider({ children }: { children: React.ReactNode }) {
  // 推荐歌单状态
  const [officialPlaylists, setOfficialPlaylists] = useState<Playlist[]>([])
  const [playlistsLoading, setPlaylistsLoading] = useState(true)
  const [playlistsError, setPlaylistsError] = useState<string | null>(null)

  // 热门趋势状态
  const [trendingSongs, setTrendingSongs] = useState<TrendingSong[]>([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [trendingError, setTrendingError] = useState<string | null>(null)

  // 电台状态
  const [radioState, setRadioState] = useState<RadioState | null>(null)
  const [radioLoading, setRadioLoading] = useState(true)
  const [radioError, setRadioError] = useState<string | null>(null)

  // 艺术家列表
  const [artists, setArtists] = useState<Artist[]>([])
  const [artistsLoading, setArtistsLoading] = useState(false)
  const [artistsError, setArtistsError] = useState<string | null>(null)

  // 初始化完成标记
  const [isInitialized, setIsInitialized] = useState(false)

  // 刷新推荐歌单
  const refreshPlaylists = useCallback(async () => {
    setPlaylistsLoading(true)
    setPlaylistsError(null)
    try {
      const result = await window.electronAPI.getOfficialPlaylists(0, 20, currentYear)
      setOfficialPlaylists(result || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取推荐歌单失败'
      setPlaylistsError(errorMessage)
      console.error('[HomeData] Failed to refresh playlists:', err)
    } finally {
      setPlaylistsLoading(false)
    }
  }, [])

  // Refresh trending songs
  const refreshTrending = useCallback(async () => {
    setTrendingLoading(true)
    setTrendingError(null)
    try {
      const result = await window.electronAPI.getTrendingSongs(7)
      setTrendingSongs(result || [])
      // Update cover art cache
      if (result) {
        updateCoverArtCache(result)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh trending'
      setTrendingError(errorMessage)
      console.error('[HomeData] Failed to refresh trending:', err)
    } finally {
      setTrendingLoading(false)
    }
  }, [])

  // 刷新电台状态
  const refreshRadio = useCallback(async () => {
    setRadioLoading(true)
    setRadioError(null)
    try {
      const result = await window.electronAPI.getRadioCurrentState()
      setRadioState(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取电台状态失败'
      setRadioError(errorMessage)
      console.error('[HomeData] Failed to refresh radio:', err)
    } finally {
      setRadioLoading(false)
    }
  }, [])

  // 刷新艺术家列表
  const refreshArtists = useCallback(async () => {
    setArtistsLoading(true)
    setArtistsError(null)
    try {
      const result = await window.electronAPI.getAllArtists()
      setArtists(result || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取艺术家列表失败'
      setArtistsError(errorMessage)
      console.error('[HomeData] Failed to refresh artists:', err)
    } finally {
      setArtistsLoading(false)
    }
  }, [])

  // 刷新所有数据
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshPlaylists(),
      refreshTrending(),
      refreshRadio(),
    ])
    // artists 列表较大，延迟加载
    refreshArtists()
  }, [refreshPlaylists, refreshTrending, refreshRadio, refreshArtists])

  // 初始化：并行加载核心数据
  useEffect(() => {
    let mounted = true

    async function initHomeData() {
      console.log('[HomeData] Starting preload...')
      const startTime = performance.now()

      try {
        // 并行加载核心数据
        const [playlistsResult, trendingResult, radioResult] = await Promise.all([
          window.electronAPI.getOfficialPlaylists(0, 20, currentYear),
          window.electronAPI.getTrendingSongs(7),
          window.electronAPI.getRadioCurrentState(),
        ])

        if (mounted) {
          setOfficialPlaylists(playlistsResult || [])
          setTrendingSongs(trendingResult || [])
          setRadioState(radioResult)
          setPlaylistsLoading(false)
          setTrendingLoading(false)
          setRadioLoading(false)
          setIsInitialized(true)

          const endTime = performance.now()
          console.log(`[HomeData] Preload complete in ${(endTime - startTime).toFixed(0)}ms`)
        }
      } catch (err) {
        console.error('[HomeData] Preload failed:', err)
        if (mounted) {
          setPlaylistsLoading(false)
          setTrendingLoading(false)
          setRadioLoading(false)
          setIsInitialized(true)
        }
      }

      // 延迟加载艺术家列表（用于搜索联想）
      if (mounted) {
        try {
          const artistsResult = await window.electronAPI.getAllArtists()
          if (mounted) {
            setArtists(artistsResult || [])
            setArtistsLoading(false)
          }
        } catch (err) {
          console.error('[HomeData] Failed to load artists:', err)
          if (mounted) {
            setArtistsLoading(false)
          }
        }
      }
    }

    initHomeData()
    return () => { mounted = false }
  }, [])

  const value: HomeDataState = {
    officialPlaylists,
    playlistsLoading,
    playlistsError,
    trendingSongs,
    trendingLoading,
    trendingError,
    radioState,
    radioLoading,
    radioError,
    artists,
    artistsLoading,
    artistsError,
    isInitialized,
    refreshPlaylists,
    refreshTrending,
    refreshRadio,
    refreshArtists,
    refreshAll,
  }

  return React.createElement(HomeDataContext.Provider, { value }, children)
}

export function useHomeData() {
  const context = useContext(HomeDataContext)
  if (!context) {
    throw new Error('useHomeData must be used within HomeDataProvider')
  }
  return context
}
