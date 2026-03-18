// Electron API 类型定义

// 已下载歌曲的数据结构
export interface DownloadedSong {
  id: string
  title: string
  filePath: string
  fileSize: number
  downloadedAt: string
  coverPath?: string // 本地封面路径
  artists?: string
  originalArtists?: string
}

export interface ElectronAPI {
  // 窗口控制
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  startDragging: () => void

  // 播放列表 API
  getPlaylist: (id: string) => Promise<Playlist>
  getOfficialPlaylists: (startIndex: number, pageSize: number, year: number) => Promise<Playlist[]>
  getPublicPlaylists: () => Promise<Playlist[]>

  // 歌曲 API
  getSongLyrics: (songId: string) => Promise<Lyric[]>
  searchSongs: (request: SongSearchRequest) => Promise<SongSearchResponse>
  getSongDetails: (songId: string) => Promise<Song>
  getSongPoll: (songId: string) => Promise<SongPoll[]>

  // 艺术家 API
  getAllArtists: () => Promise<Artist[]>

  // 探索 API
  getTrendingSongs: (days: number) => Promise<TrendingSong[]>

  // 电台 API
  getRadioCurrentState: () => Promise<RadioState>
  getRadioStreamUrl: () => Promise<string>

  // 统计 API
  getCoverDistribution: () => Promise<CoverDistribution>

  // 数据存储
  storeGet: (key: string) => Promise<unknown>
  storeSet: (key: string, value: unknown) => Promise<boolean>
  storeDelete: (key: string) => Promise<boolean>

  // i18n 加载
  loadTranslations: (lang: string) => Promise<{ success: boolean; content?: string; error?: string }>

  // 下载 API
  downloadAudio: (songId: string, audioUrl: string, title: string, coverUrl?: string, artists?: string, originalArtists?: string) => Promise<{ success: boolean; error?: string; song?: DownloadedSong }>
  getDownloads: () => Promise<DownloadedSong[]>
  deleteDownload: (songId: string) => Promise<{ success: boolean; error?: string }>
  isDownloaded: (songId: string) => Promise<boolean>
  showInFolder: (songId: string) => Promise<{ success: boolean; error?: string }>
  subscribeDownloadProgress: (songId: string, callback: (progress: number) => void) => () => void

  // IPC 事件监听
  on: (channel: string, callback: (...args: unknown[]) => void) => void
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
