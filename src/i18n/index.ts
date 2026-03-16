import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'

export type Language = 'zh' | 'en'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'language-settings'

// 内置翻译
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
    'page.home': '首页',
    'page.search': '搜索',
    'page.random': '随机歌曲',
    'page.explore': '探索',
    'page.karaokePlaylist': '卡拉OK歌单',
    'page.karaokeQuiz': '卡拉OK问答',
    'page.listenTogether': '一起听',
    'page.about': '关于',
    'page.favorites': '我的收藏',
    'page.downloads': '下载',
    'page.playlists': '我的播放列表',
    'page.uploaded': '已上传的歌曲',
    'page.artGallery': '艺术画廊',
    'page.videoLibrary': '视频库',
    'page.audioClips': '音频片段',
    'page.communityCanvas': '社区画布',
    'page.quotes': 'Neuro与Evil语录',
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
    'page.home': 'Home',
    'page.search': 'Search',
    'page.random': 'Random',
    'page.explore': 'Explore',
    'page.karaokePlaylist': 'Karaoke Playlist',
    'page.karaokeQuiz': 'Karaoke Quiz',
    'page.listenTogether': 'Listen Together',
    'page.about': 'About',
    'page.favorites': 'Favorites',
    'page.downloads': 'Downloads',
    'page.playlists': 'Playlists',
    'page.uploaded': 'Uploaded',
    'page.artGallery': 'Art Gallery',
    'page.videoLibrary': 'Video Library',
    'page.audioClips': 'Audio Clips',
    'page.communityCanvas': 'Community Canvas',
    'page.quotes': 'Quotes',
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
  },
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh')
  const [translations, setTranslations] = useState<Record<string, string>>(fallbackTranslations['zh'])
  const [isLoading, setIsLoading] = useState(true)

  // 初始化
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const savedLang = await window.electronAPI.storeGet(STORAGE_KEY)
        const lang = (savedLang as Language) || 'zh'

        if (mounted) {
          setLanguageState(lang)
          setTranslations(fallbackTranslations[lang])
        }
      } catch (error) {
        console.error('Failed to init i18n:', error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    init()
    return () => { mounted = false }
  }, [])

  // 切换语言
  const setLanguage = useCallback(async (lang: Language) => {
    if (lang === language) return
    setTranslations(fallbackTranslations[lang])
    setLanguageState(lang)
    try {
      await window.electronAPI.storeSet(STORAGE_KEY, lang)
    } catch (error) {
      console.error('Failed to save language:', error)
    }
  }, [language])

  // 翻译函数
  const t = useCallback((key: string): string => translations[key] || key, [translations])

  if (isLoading) return null

  const ctxValue = { language, setLanguage, t }
  return React.createElement(I18nContext.Provider, { value: ctxValue }, children)
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
