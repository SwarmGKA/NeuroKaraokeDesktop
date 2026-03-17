import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'

export type Language = 'zh' | 'en'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'language-settings'

// 解析 .properties 文件内容
function parseProperties(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = content.split('\n')

  for (const line of lines) {
    // 跳过注释和空行
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) {
      continue
    }

    // 解析 key=value
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex > 0) {
      const key = trimmed.substring(0, separatorIndex).trim()
      let value = trimmed.substring(separatorIndex + 1).trim()

      // 处理转义字符
      value = value
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\\\/g, '\\')

      result[key] = value
    }
  }

  return result
}

// 备用翻译（当文件加载失败时使用）
const fallbackTranslations: Record<Language, Record<string, string>> = {
  zh: {
    'app.title': 'Neuro Karaoke',
    'app.loading': '加载中...',
    'sidebar.home': '首页',
    'sidebar.search': '搜索',
    'sidebar.random': '随机歌曲',
    'sidebar.explore': '探索',
    'sidebar.karaokePlaylist': '卡拉OK歌单',
    'sidebar.karaokeQuiz': '卡拉OK问答',
    'sidebar.listenTogether': '一起听',
    'sidebar.about': '关于',
    'sidebar.library': '我的库',
    'sidebar.favorites': '我的收藏',
    'sidebar.downloads': '下载',
    'sidebar.playlists': '我的播放列表',
    'sidebar.uploaded': '已上传的歌曲',
    'sidebar.others': '其他',
    'sidebar.artGallery': '艺术画廊',
    'sidebar.videoLibrary': '视频库',
    'sidebar.audioClips': '音频片段',
    'sidebar.communityCanvas': '社区画布',
    'sidebar.quotes': 'Neuro与Evil语录',
    'page.settings': '设置',
    'settings.title': '设置',
    'settings.appearance': '自定义应用程序的外观',
    'settings.theme': '主题',
    'settings.theme.light': '亮色',
    'settings.theme.dark': '暗色',
    'settings.accentColor': '强调色',
    'settings.accent.neuro': 'Neuro',
    'settings.accent.neuroEvil': 'Neuro & Evil',
    'settings.accent.evil': 'Evil',
    'settings.language': '语言',
    'settings.language.zh': '中文',
    'settings.language.en': '英文',
    'userCard.title': '用户卡片',
    'userCard.settings': '设置',
    'userCard.editProfile': '编辑资料',
    'userCard.logout': '退出登录',
    'userCard.guestUser': '访客用户',
    'userCard.stats.played': '播放次数',
    'userCard.stats.favorites': '收藏数量',
    'userCard.stats.downloads': '下载次数',
    'userCard.close': '关闭',
    'home.welcome': '欢迎回来',
    'home.greeting.lateNight': '夜深了',
    'home.greeting.morning': '早上好',
    'home.greeting.afternoon': '下午好',
    'home.greeting.evening': '晚上好',
    'home.dailyRecommend': '每日推荐',
    'home.radio': '电台',
    'home.nowPlaying': '正在播放',
    'home.listeners': '听众',
    'home.trending': '热门趋势',
    'home.trendingDesc': '最近7天最受欢迎',
    'home.hotBadge': '热门',
    'home.quickActions': '快捷入口',
    'home.karaokeQuiz': '音乐挑战',
    'home.karaokeQuizDesc': '测试你的音乐知识',
    'home.listenTogether': '一起听',
    'home.listenTogetherDesc': '与好友同步听歌',
    'home.searchPlaceholder': '搜索歌曲、艺人...',
    'home.radioOffline': '电台离线中',
    'home.radioOfflineDesc': '暂时没有播放内容',
    'search.subtitle': '搜索歌曲、艺术家',
    'search.content': '搜索内容',
    'search.history': '搜索历史',
    'search.clearHistory': '清除历史',
    'search.songs': '歌曲',
    'search.artists': '艺术家',
    'search.noResults': '未找到结果',
    'search.pressEnter': '按回车搜索',
    'search.filters': '筛选',
    'search.clearFilters': '清除筛选',
    'search.searchArtists': '搜索艺术家',
    'search.moreArtists': '还有 {count} 位艺术家',
    'search.energy': '能量值',
    'search.energyLow': '低',
    'search.energyHigh': '高',
    'search.key': '调性',
    'search.noSongsFound': '未找到相关歌曲',
    'search.resultsFor': '找到 {count} 个 "{query}" 相关结果',
    'search.hotSearches': '热门搜索',
    'search.recommendTags': '推荐标签',
    'search.relatedArtists': '相关艺术家',
    'search.trendingTags': '热门标签',
    'random.subtitle': '随机发现新歌曲',
    'random.content': '随机歌曲内容',
    'explore.subtitle': '探索热门歌曲和新内容',
    'explore.content': '探索内容',
    'about.subtitle': '关于 Neuro Karaoke',
    'about.appName': 'Neuro Karaoke Desktop',
    'about.version': '版本',
    'about.techStack': '使用 Electron + React + Ant Design 构建',
    'favorites.subtitle': '你收藏的歌曲',
    'favorites.content': '收藏内容',
    'downloads.subtitle': '已下载的歌曲',
    'downloads.content': '下载内容',
    'playlists.subtitle': '你的播放列表',
    'playlists.content': '播放列表内容',
    'uploaded.subtitle': '你上传的歌曲',
    'uploaded.content': '已上传内容',
    'karaokePlaylist.subtitle': '管理和创建卡拉OK歌单',
    'karaokePlaylist.content': '卡拉OK歌单内容',
    'karaokeQuiz.subtitle': '测试你的音乐知识',
    'karaokeQuiz.content': '卡拉OK问答内容',
    'listenTogether.subtitle': '与朋友一起听歌',
    'listenTogether.content': '一起听内容',
    'artGallery.subtitle': '浏览专辑封面艺术',
    'artGallery.content': '艺术画廊内容',
    'videoLibrary.subtitle': '浏览视频库',
    'videoLibrary.content': '视频库内容',
    'audioClips.subtitle': '音频片段收藏',
    'audioClips.content': '音频片段内容',
    'communityCanvas.subtitle': '社区创作画布',
    'communityCanvas.content': '社区画布内容',
    'quotes.subtitle': 'Neuro 与 Evil 的经典语录',
    'quotes.content': '语录内容',
    'playlist.defaultName': '未命名歌单',
    'playlist.songCount': '{0} 首歌曲',
    'playlist.coverAlt': '歌单封面',
    'song.defaultTitle': '未知歌曲',
    'song.unknownArtist': '未知艺术家',
    'song.coverAlt': '歌曲封面',
    'user.guestName': '访客',
    'player.playingFrom': '正在播放',
    'player.currentPlaylist': '当前播放列表',
    'player.tapForLyrics': '点击封面查看歌词',
    'player.playMode.sequence': '顺序播放',
    'player.playMode.loop': '列表循环',
    'player.playMode.single': '单曲循环',
    'player.playMode.shuffle': '随机播放',
    'player.noLyrics': '暂无歌词',
  },
  en: {
    'app.title': 'Neuro Karaoke',
    'app.loading': 'Loading...',
    'sidebar.home': 'Home',
    'sidebar.search': 'Search',
    'sidebar.random': 'Random',
    'sidebar.explore': 'Explore',
    'sidebar.karaokePlaylist': 'Karaoke Playlist',
    'sidebar.karaokeQuiz': 'Karaoke Quiz',
    'sidebar.listenTogether': 'Listen Together',
    'sidebar.about': 'About',
    'sidebar.library': 'Library',
    'sidebar.favorites': 'Favorites',
    'sidebar.downloads': 'Downloads',
    'sidebar.playlists': 'Playlists',
    'sidebar.uploaded': 'Uploaded',
    'sidebar.others': 'Others',
    'sidebar.artGallery': 'Art Gallery',
    'sidebar.videoLibrary': 'Video Library',
    'sidebar.audioClips': 'Audio Clips',
    'sidebar.communityCanvas': 'Community Canvas',
    'sidebar.quotes': 'Quotes',
    'page.settings': 'Settings',
    'settings.title': 'Settings',
    'settings.appearance': 'Customize the appearance of the app',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.accentColor': 'Accent Color',
    'settings.accent.neuro': 'Neuro',
    'settings.accent.neuroEvil': 'Neuro & Evil',
    'settings.accent.evil': 'Evil',
    'settings.language': 'Language',
    'settings.language.zh': 'Chinese',
    'settings.language.en': 'English',
    'userCard.title': 'User Card',
    'userCard.settings': 'Settings',
    'userCard.editProfile': 'Edit Profile',
    'userCard.logout': 'Logout',
    'userCard.guestUser': 'Guest User',
    'userCard.stats.played': 'Played',
    'userCard.stats.favorites': 'Favorites',
    'userCard.stats.downloads': 'Downloads',
    'userCard.close': 'Close',
    'home.welcome': 'Welcome Back',
    'home.greeting.lateNight': 'Good Night',
    'home.greeting.morning': 'Good Morning',
    'home.greeting.afternoon': 'Good Afternoon',
    'home.greeting.evening': 'Good Evening',
    'home.dailyRecommend': 'Daily Recommendations',
    'home.radio': 'Radio',
    'home.nowPlaying': 'Now Playing',
    'home.listeners': 'listeners',
    'home.trending': 'Trending',
    'home.trendingDesc': 'Most popular in last 7 days',
    'home.hotBadge': 'Hot',
    'home.quickActions': 'Quick Actions',
    'home.karaokeQuiz': 'Music Quiz',
    'home.karaokeQuizDesc': 'Test your music knowledge',
    'home.listenTogether': 'Listen Together',
    'home.listenTogetherDesc': 'Sync with friends',
    'home.searchPlaceholder': 'Search songs, artists...',
    'home.radioOffline': 'Radio Offline',
    'home.radioOfflineDesc': 'No content playing right now',
    'search.subtitle': 'Search songs, artists',
    'search.content': 'Search content',
    'search.history': 'Search History',
    'search.clearHistory': 'Clear History',
    'search.songs': 'Songs',
    'search.artists': 'Artists',
    'search.noResults': 'No results found',
    'search.pressEnter': 'Press Enter to search',
    'search.filters': 'Filters',
    'search.clearFilters': 'Clear Filters',
    'search.searchArtists': 'Search artists',
    'search.moreArtists': '{count} more artists',
    'search.energy': 'Energy',
    'search.energyLow': 'Low',
    'search.energyHigh': 'High',
    'search.key': 'Key',
    'search.noSongsFound': 'No songs found',
    'search.resultsFor': 'Found {count} results for "{query}"',
    'search.hotSearches': 'Hot Searches',
    'search.recommendTags': 'Recommended Tags',
    'search.relatedArtists': 'Related Artists',
    'search.trendingTags': 'Trending Tags',
    'random.subtitle': 'Discover new songs randomly',
    'random.content': 'Random content',
    'explore.subtitle': 'Explore trending songs and new content',
    'explore.content': 'Explore content',
    'about.subtitle': 'About Neuro Karaoke',
    'about.appName': 'Neuro Karaoke Desktop',
    'about.version': 'Version',
    'about.techStack': 'Built with Electron + React + Ant Design',
    'favorites.subtitle': 'Your favorite songs',
    'favorites.content': 'Favorites content',
    'downloads.subtitle': 'Downloaded songs',
    'downloads.content': 'Downloads content',
    'playlists.subtitle': 'Your playlists',
    'playlists.content': 'Playlists content',
    'uploaded.subtitle': 'Your uploaded songs',
    'uploaded.content': 'Uploaded content',
    'karaokePlaylist.subtitle': 'Manage and create karaoke playlists',
    'karaokePlaylist.content': 'Karaoke playlist content',
    'karaokeQuiz.subtitle': 'Test your music knowledge',
    'karaokeQuiz.content': 'Karaoke quiz content',
    'listenTogether.subtitle': 'Listen to music with friends',
    'listenTogether.content': 'Listen together content',
    'artGallery.subtitle': 'Browse album cover art',
    'artGallery.content': 'Art gallery content',
    'videoLibrary.subtitle': 'Browse video library',
    'videoLibrary.content': 'Video library content',
    'audioClips.subtitle': 'Audio clips collection',
    'audioClips.content': 'Audio clips content',
    'communityCanvas.subtitle': 'Community creative canvas',
    'communityCanvas.content': 'Community canvas content',
    'quotes.subtitle': 'Classic quotes from Neuro and Evil',
    'quotes.content': 'Quotes content',
    'playlist.defaultName': 'Untitled Playlist',
    'playlist.songCount': '{0} songs',
    'playlist.coverAlt': 'Playlist cover',
    'song.defaultTitle': 'Unknown Song',
    'song.unknownArtist': 'Unknown Artist',
    'song.coverAlt': 'Song cover',
    'user.guestName': 'Guest',
    'player.playingFrom': 'PLAYING FROM',
    'player.currentPlaylist': 'Current Playlist',
    'player.tapForLyrics': 'Tap for lyrics',
    'player.playMode.sequence': 'Sequence',
    'player.playMode.loop': 'Loop',
    'player.playMode.single': 'Single',
    'player.playMode.shuffle': 'Shuffle',
    'player.noLyrics': 'No lyrics available',
  },
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh')
  const [translations, setTranslations] = useState<Record<string, string>>(fallbackTranslations['zh'])
  const [isLoading, setIsLoading] = useState(true)

  // 加载翻译文件
  const loadTranslations = useCallback(async (lang: Language) => {
    try {
      const result = await window.electronAPI.loadTranslations(lang)
      if (result.success && result.content) {
        const parsed = parseProperties(result.content)
        if (Object.keys(parsed).length > 0) {
          return parsed
        }
      }
      console.warn('Failed to load translations, using fallback:', result.error)
    } catch (error) {
      console.error('Failed to load translations:', error)
    }
    return fallbackTranslations[lang]
  }, [])

  // 初始化
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const savedLang = await window.electronAPI.storeGet(STORAGE_KEY)
        const lang = (savedLang as Language) || 'zh'

        if (mounted) {
          const loadedTranslations = await loadTranslations(lang)
          setLanguageState(lang)
          setTranslations(loadedTranslations)
        }
      } catch (error) {
        console.error('Failed to init i18n:', error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    init()
    return () => { mounted = false }
  }, [loadTranslations])

  // 切换语言
  const setLanguage = useCallback(async (lang: Language) => {
    if (lang === language) return

    const loadedTranslations = await loadTranslations(lang)
    setTranslations(loadedTranslations)
    setLanguageState(lang)

    try {
      await window.electronAPI.storeSet(STORAGE_KEY, lang)
    } catch (error) {
      console.error('Failed to save language:', error)
    }
  }, [language, loadTranslations])

  // 翻译函数，支持参数替换
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let text = translations[key] || fallbackTranslations[language]?.[key] || key

    // 支持参数替换 {0}, {1}, ... 或 {paramName}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
      })
    }

    return text
  }, [translations, language])

  if (isLoading) return null

  const ctxValue = { language, setLanguage, t }
  return React.createElement(I18nContext.Provider, { value: ctxValue }, children)
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
