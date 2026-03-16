import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react'
import type { Song, Lyric } from '../types/api'
import { getAudioUrl } from './homeDataStore'

// 播放模式
export type PlayMode = 'sequence' | 'loop' | 'single' | 'shuffle'

// 播放器状态
export interface PlayerState {
  // 当前歌曲
  currentSong: Song | null
  // 歌曲列表
  playlist: Song[]
  // 当前索引
  currentIndex: number
  // 播放状态
  isPlaying: boolean
  // 当前时间（秒）
  currentTime: number
  // 总时长（秒）
  duration: number
  // 音量 (0-1)
  volume: number
  // 是否静音
  isMuted: boolean
  // 播放模式
  playMode: PlayMode
  // 是否展开
  isExpanded: boolean
  // 歌词
  lyrics: Lyric[]
  // 当前歌词索引
  currentLyricIndex: number
  // 是否显示歌词
  showLyrics: boolean
  // 缓冲状态
  isBuffering: boolean
  // 封面主色调
  coverColor: string
}

// 初始状态
const initialState: PlayerState = {
  currentSong: null,
  playlist: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  playMode: 'sequence',
  isExpanded: false,
  lyrics: [],
  currentLyricIndex: -1,
  showLyrics: false,
  isBuffering: false,
  coverColor: '#667eea',
}

// Action 类型
type PlayerAction =
  | { type: 'SET_SONG'; song: Song; index: number }
  | { type: 'SET_PLAYLIST'; playlist: Song[]; index?: number }
  | { type: 'SET_PLAYING'; isPlaying: boolean }
  | { type: 'SET_CURRENT_TIME'; time: number }
  | { type: 'SET_DURATION'; duration: number }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'SET_MUTED'; isMuted: boolean }
  | { type: 'SET_PLAY_MODE'; mode: PlayMode }
  | { type: 'TOGGLE_EXPAND' }
  | { type: 'SET_EXPANDED'; expanded: boolean }
  | { type: 'SET_LYRICS'; lyrics: Lyric[] }
  | { type: 'SET_CURRENT_LYRIC_INDEX'; index: number }
  | { type: 'TOGGLE_LYRICS' }
  | { type: 'SET_BUFFERING'; isBuffering: boolean }
  | { type: 'SET_COVER_COLOR'; color: string }
  | { type: 'NEXT_SONG' }
  | { type: 'PREV_SONG' }

// Reducer
function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_SONG':
      return { ...state, currentSong: action.song, currentIndex: action.index, currentTime: 0 }
    case 'SET_PLAYLIST':
      return { ...state, playlist: action.playlist, currentIndex: action.index ?? 0 }
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.isPlaying }
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.time }
    case 'SET_DURATION':
      return { ...state, duration: action.duration }
    case 'SET_VOLUME':
      return { ...state, volume: action.volume }
    case 'SET_MUTED':
      return { ...state, isMuted: action.isMuted }
    case 'SET_PLAY_MODE':
      return { ...state, playMode: action.mode }
    case 'TOGGLE_EXPAND':
      return { ...state, isExpanded: !state.isExpanded }
    case 'SET_EXPANDED':
      return { ...state, isExpanded: action.expanded }
    case 'SET_LYRICS':
      return { ...state, lyrics: action.lyrics, currentLyricIndex: -1 }
    case 'SET_CURRENT_LYRIC_INDEX':
      return { ...state, currentLyricIndex: action.index }
    case 'TOGGLE_LYRICS':
      return { ...state, showLyrics: !state.showLyrics }
    case 'SET_BUFFERING':
      return { ...state, isBuffering: action.isBuffering }
    case 'SET_COVER_COLOR':
      return { ...state, coverColor: action.color }
    case 'NEXT_SONG': {
      if (state.playlist.length === 0) return state
      let nextIndex: number
      if (state.playMode === 'shuffle') {
        nextIndex = Math.floor(Math.random() * state.playlist.length)
      } else {
        nextIndex = (state.currentIndex + 1) % state.playlist.length
      }
      return {
        ...state,
        currentSong: state.playlist[nextIndex] || null,
        currentIndex: nextIndex,
        currentTime: 0,
        lyrics: [],
        currentLyricIndex: -1,
      }
    }
    case 'PREV_SONG': {
      if (state.playlist.length === 0) return state
      let prevIndex: number
      if (state.playMode === 'shuffle') {
        prevIndex = Math.floor(Math.random() * state.playlist.length)
      } else {
        prevIndex = state.currentIndex <= 0 ? state.playlist.length - 1 : state.currentIndex - 1
      }
      return {
        ...state,
        currentSong: state.playlist[prevIndex] || null,
        currentIndex: prevIndex,
        currentTime: 0,
        lyrics: [],
        currentLyricIndex: -1,
      }
    }
    default:
      return state
  }
}

// Context
interface PlayerContextType {
  state: PlayerState
  audioRef: React.RefObject<HTMLAudioElement | null>
  // 播放控制
  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  next: () => void
  prev: () => void
  setPlayMode: (mode: PlayMode) => void
  // 歌曲管理
  playSong: (song: Song, playlist?: Song[], index?: number) => void
  playPlaylist: (playlist: Song[], startIndex?: number) => void
  // UI 控制
  toggleExpand: () => void
  setExpanded: (expanded: boolean) => void
  toggleLyrics: () => void
  // 歌词
  loadLyrics: (songId: string) => Promise<void>
}

const PlayerContext = createContext<PlayerContextType | null>(null)

// Provider
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 创建 audio 元素
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    // 事件监听
    audio.addEventListener('timeupdate', () => {
      dispatch({ type: 'SET_CURRENT_TIME', time: audio.currentTime })
      // 更新当前歌词
      updateCurrentLyric(audio.currentTime)
    })

    audio.addEventListener('loadedmetadata', () => {
      dispatch({ type: 'SET_DURATION', duration: audio.duration })
    })

    audio.addEventListener('ended', () => {
      if (state.playMode === 'single') {
        audio.currentTime = 0
        audio.play()
      } else {
        dispatch({ type: 'NEXT_SONG' })
      }
    })

    audio.addEventListener('waiting', () => {
      dispatch({ type: 'SET_BUFFERING', isBuffering: true })
    })

    audio.addEventListener('canplay', () => {
      dispatch({ type: 'SET_BUFFERING', isBuffering: false })
    })

    audio.addEventListener('play', () => {
      dispatch({ type: 'SET_PLAYING', isPlaying: true })
    })

    audio.addEventListener('pause', () => {
      dispatch({ type: 'SET_PLAYING', isPlaying: false })
    })

    // 加载保存的音量
    window.electronAPI.storeGet('player-volume').then((vol) => {
      if (typeof vol === 'number') {
        audio.volume = vol
        dispatch({ type: 'SET_VOLUME', volume: vol })
      }
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // 当播放模式改变时更新 ended 事件处理
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      if (state.playMode === 'single') {
        audio.currentTime = 0
        audio.play()
      } else {
        dispatch({ type: 'NEXT_SONG' })
      }
    }

    audio.removeEventListener('ended', handleEnded)
    audio.addEventListener('ended', handleEnded)

    return () => audio.removeEventListener('ended', handleEnded)
  }, [state.playMode])

  // 当歌曲改变时更新音频源
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !state.currentSong) return

    // 获取音频 URL
    let audioUrl: string | undefined
    if (state.currentSong.hls) {
      // HLS 流
      audioUrl = state.currentSong.hls
    } else if (state.currentSong.audioUrl) {
      audioUrl = state.currentSong.audioUrl
    } else if (state.currentSong.absolutePath) {
      audioUrl = getAudioUrl(state.currentSong.absolutePath)
    }

    if (audioUrl && audioUrl !== audio.src) {
      audio.src = audioUrl
      audio.load()
      if (state.isPlaying) {
        audio.play().catch(console.error)
      }
    }
  }, [state.currentSong, state.isPlaying])

  // 更新当前歌词
  const updateCurrentLyric = useCallback((currentTime: number) => {
    if (state.lyrics.length === 0) return

    // 找到当前时间对应的歌词
    for (let i = state.lyrics.length - 1; i >= 0; i--) {
      const lyric = state.lyrics[i]
      if (lyric.time) {
        const lyricTime = parseTimeToSeconds(lyric.time)
        if (currentTime >= lyricTime) {
          if (state.currentLyricIndex !== i) {
            dispatch({ type: 'SET_CURRENT_LYRIC_INDEX', index: i })
          }
          break
        }
      }
    }
  }, [state.lyrics, state.currentLyricIndex])

  // 解析时间字符串为秒数
  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':')
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10)
      const seconds = parseFloat(parts[1])
      return minutes * 60 + seconds
    }
    return 0
  }

  // 播放控制函数
  const play = useCallback(() => {
    audioRef.current?.play().catch(console.error)
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause()
    } else {
      play()
    }
  }, [state.isPlaying, play, pause])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }, [])

  const setVolume = useCallback(async (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
    dispatch({ type: 'SET_VOLUME', volume })
    await window.electronAPI.storeSet('player-volume', volume)
  }, [])

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !state.isMuted
    }
    dispatch({ type: 'SET_MUTED', isMuted: !state.isMuted })
  }, [state.isMuted])

  const next = useCallback(() => {
    dispatch({ type: 'NEXT_SONG' })
  }, [])

  const prev = useCallback(() => {
    dispatch({ type: 'PREV_SONG' })
  }, [])

  const setPlayMode = useCallback((mode: PlayMode) => {
    dispatch({ type: 'SET_PLAY_MODE', mode })
  }, [])

  const playSong = useCallback((song: Song, playlist?: Song[], index?: number) => {
    const newPlaylist = playlist || [song]
    const newIndex = index ?? 0
    dispatch({ type: 'SET_PLAYLIST', playlist: newPlaylist, index: newIndex })
    dispatch({ type: 'SET_SONG', song, index: newIndex })
    // 自动开始播放
    setTimeout(() => play(), 100)
  }, [play])

  const playPlaylist = useCallback((playlist: Song[], startIndex = 0) => {
    const song = playlist[startIndex]
    if (song) {
      playSong(song, playlist, startIndex)
    }
  }, [playSong])

  const toggleExpand = useCallback(() => {
    dispatch({ type: 'TOGGLE_EXPAND' })
  }, [])

  const setExpanded = useCallback((expanded: boolean) => {
    dispatch({ type: 'SET_EXPANDED', expanded })
  }, [])

  const toggleLyrics = useCallback(() => {
    dispatch({ type: 'TOGGLE_LYRICS' })
  }, [])

  const loadLyrics = useCallback(async (songId: string) => {
    try {
      const lyrics = await window.electronAPI.getSongLyrics(songId)
      dispatch({ type: 'SET_LYRICS', lyrics })
    } catch (error) {
      console.error('Failed to load lyrics:', error)
      dispatch({ type: 'SET_LYRICS', lyrics: [] })
    }
  }, [])

  const value: PlayerContextType = {
    state,
    audioRef,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    next,
    prev,
    setPlayMode,
    playSong,
    playPlaylist,
    toggleExpand,
    setExpanded,
    toggleLyrics,
    loadLyrics,
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}

// Hook
export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider')
  }
  return context
}
