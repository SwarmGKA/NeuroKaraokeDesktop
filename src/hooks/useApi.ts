import { useState, useCallback } from 'react'
import type {
  Playlist,
  Song,
  Lyric,
  SongPoll,
  SongSearchRequest,
  SongSearchResponse,
  Artist,
  RadioState,
  TrendingSong,
  CoverDistribution,
  SongListItem,
} from '../types/api'

interface ApiHookResult<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// 播放列表相关 Hook
export function usePlaylists() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [officialPlaylists, setOfficialPlaylists] = useState<Playlist[]>([])
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPlaylist = useCallback(async (id: string): Promise<ApiHookResult<Playlist>> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getPlaylist(id)
      setPlaylist(result)
      return { data: result, loading: false, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取播放列表失败'
      setError(errorMessage)
      return { data: null, loading: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const getOfficialPlaylists = useCallback(
    async (startIndex: number, pageSize: number, year: number): Promise<ApiHookResult<Playlist[]>> => {
      setLoading(true)
      setError(null)
      try {
        const result = await window.electronAPI.getOfficialPlaylists(startIndex, pageSize, year)
        setOfficialPlaylists(result)
        return { data: result, loading: false, error: null }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '获取官方播放列表失败'
        setError(errorMessage)
        return { data: null, loading: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getPublicPlaylists = useCallback(async (): Promise<ApiHookResult<Playlist[]>> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getPublicPlaylists()
      setPublicPlaylists(result)
      return { data: result, loading: false, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取公开播放列表失败'
      setError(errorMessage)
      return { data: null, loading: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    playlist,
    officialPlaylists,
    publicPlaylists,
    loading,
    error,
    getPlaylist,
    getOfficialPlaylists,
    getPublicPlaylists,
  }
}

// 歌曲相关 Hook
export function useSongs() {
  const [lyrics, setLyrics] = useState<Lyric[]>([])
  const [searchResults, setSearchResults] = useState<SongSearchResponse | null>(null)
  const [songDetails, setSongDetails] = useState<Song | null>(null)
  const [songPoll, setSongPoll] = useState<SongPoll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getSongLyrics = useCallback(async (songId: string): Promise<ApiHookResult<Lyric[]>> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getSongLyrics(songId)
      setLyrics(result)
      return { data: result, loading: false, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取歌曲歌词失败'
      setError(errorMessage)
      return { data: null, loading: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const searchSongs = useCallback(
    async (request: SongSearchRequest): Promise<ApiHookResult<SongSearchResponse>> => {
      setLoading(true)
      setError(null)
      try {
        const result = await window.electronAPI.searchSongs(request)
        setSearchResults(result)
        return { data: result, loading: false, error: null }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '搜索歌曲失败'
        setError(errorMessage)
        return { data: null, loading: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getSongDetails = useCallback(async (songId: string): Promise<ApiHookResult<Song>> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getSongDetails(songId)
      setSongDetails(result)
      return { data: result, loading: false, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取歌曲详情失败'
      setError(errorMessage)
      return { data: null, loading: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const getSongPoll = useCallback(async (songId: string): Promise<ApiHookResult<SongPoll[]>> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getSongPoll(songId)
      setSongPoll(result)
      return { data: result, loading: false, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取歌曲投票失败'
      setError(errorMessage)
      return { data: null, loading: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    lyrics,
    searchResults,
    songDetails,
    songPoll,
    loading,
    error,
    getSongLyrics,
    searchSongs,
    getSongDetails,
    getSongPoll,
  }
}

// 艺术家相关 Hook
export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAllArtists = useCallback(async (): Promise<ApiHookResult<Artist[]>> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getAllArtists()
      setArtists(result)
      return { data: result, loading: false, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取艺术家列表失败'
      setError(errorMessage)
      return { data: null, loading: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    artists,
    loading,
    error,
    getAllArtists,
  }
}

// 电台相关 Hook
export function useRadio() {
  const [radioState, setRadioState] = useState<RadioState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRadioCurrentState = useCallback(async (): Promise<ApiHookResult<RadioState>> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getRadioCurrentState()
      setRadioState(result)
      return { data: result, loading: false, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取电台状态失败'
      setError(errorMessage)
      return { data: null, loading: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const getRadioStreamUrl = useCallback(async (): Promise<ApiHookResult<string>> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getRadioStreamUrl()
      return { data: result, loading: false, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取电台流 URL 失败'
      setError(errorMessage)
      return { data: '', loading: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    radioState,
    loading,
    error,
    getRadioCurrentState,
    getRadioStreamUrl,
  }
}

// 探索相关 Hook
export function useExplore() {
  const [trendingSongs, setTrendingSongs] = useState<TrendingSong[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getTrendingSongs = useCallback(async (days: number): Promise<ApiHookResult<TrendingSong[]>> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getTrendingSongs(days)
      setTrendingSongs(result)
      return { data: result, loading: false, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取热门歌曲失败'
      setError(errorMessage)
      return { data: null, loading: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    trendingSongs,
    loading,
    error,
    getTrendingSongs,
  }
}

// 统计相关 Hook
export function useStatistics() {
  const [coverDistribution, setCoverDistribution] = useState<CoverDistribution | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCoverDistribution = useCallback(async (): Promise<ApiHookResult<CoverDistribution>> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getCoverDistribution()
      setCoverDistribution(result)
      return { data: result, loading: false, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取封面分布失败'
      setError(errorMessage)
      return { data: null, loading: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    coverDistribution,
    loading,
    error,
    getCoverDistribution,
  }
}

// 导出类型
export type { Playlist, Song, Lyric, SongPoll, SongSearchRequest, SongSearchResponse, Artist, RadioState, TrendingSong, CoverDistribution, SongListItem }
