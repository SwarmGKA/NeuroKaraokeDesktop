import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Playlist, TrendingSong, RadioState, Artist } from '../types/api'

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

// Cloudflare CDN 缩略图 URL 生成
export function getThumbnailUrl(cloudflareId: string | undefined, width = 400): string | undefined {
  if (!cloudflareId) return undefined
  return `https://imagedelivery.net/${cloudflareId}/w-${width}`
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
      console.error('刷新推荐歌单失败:', err)
    } finally {
      setPlaylistsLoading(false)
    }
  }, [])

  // 刷新热门趋势
  const refreshTrending = useCallback(async () => {
    setTrendingLoading(true)
    setTrendingError(null)
    try {
      const result = await window.electronAPI.getTrendingSongs(7)
      setTrendingSongs(result || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取热门趋势失败'
      setTrendingError(errorMessage)
      console.error('刷新热门趋势失败:', err)
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
      console.error('刷新电台状态失败:', err)
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
      console.error('刷新艺术家列表失败:', err)
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
      console.log('[HomeData] 开始预加载数据...')
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
          console.log(`[HomeData] 预加载完成，耗时 ${(endTime - startTime).toFixed(0)}ms`)
        }
      } catch (err) {
        console.error('[HomeData] 预加载失败:', err)
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
          console.error('[HomeData] 加载艺术家列表失败:', err)
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
