import { useState, useEffect, useRef } from 'react'
import { ConfigProvider, App as AntApp, Flex, Box } from 'antd'
import { AnimatePresence } from 'framer-motion'
import { I18nProvider, useI18n, Language } from './i18n'
import { TitleBar } from './components/TitleBar'
import { Sidebar, Page } from './components/Sidebar'
import { UserPanel } from './components/UserPanel'
import { UserCardDialog } from './components/UserCardDialog'
import { PageTransition } from './components/PageTransition'
import {
  Home,
  Search,
  Random,
  Explore,
  KaraokePlaylist,
  KaraokeQuiz,
  ListenTogether,
  About,
  Favorites,
  Downloads,
  Playlists,
  Uploaded,
  ArtGallery,
  VideoLibrary,
  AudioClips,
  CommunityCanvas,
  Quotes,
  ThemeSettings,
} from './pages'
import { createAppTheme } from './theme'
import { useThemeStore, BaseTheme, AccentTheme } from './hooks/useThemeStore'

const STORAGE_KEY = 'sidebar-collapsed'

function AppContent() {
  const { baseTheme, accentTheme, accentColor, setBaseTheme, setAccentTheme, isLoading } = useThemeStore()
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userCardOpen, setUserCardOpen] = useState(false)
  const { language, setLanguage } = useI18n()
  const sidebarRef = useRef<HTMLDivElement>(null)

  // 加载侧边栏折叠状态
  useEffect(() => {
    async function loadSidebarState() {
      try {
        const saved = await window.electronAPI.storeGet(STORAGE_KEY)
        if (typeof saved === 'boolean') {
          setSidebarCollapsed(saved)
        }
      } catch (error) {
        console.error('加载侧边栏状态失败:', error)
      }
    }
    loadSidebarState()
  }, [])

  const handleBaseThemeChange = async (theme: BaseTheme) => {
    await setBaseTheme(theme)
  }

  const handleAccentThemeChange = async (theme: AccentTheme) => {
    await setAccentTheme(theme)
  }

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang)
  }

  const handleSidebarCollapse = async () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    try {
      await window.electronAPI.storeSet(STORAGE_KEY, newState)
    } catch (error) {
      console.error('保存侧边栏状态失败:', error)
    }
  }

  const handlePageChange = (page: Page) => {
    setCurrentPage(page)
    // 滚动侧边栏使选中项可见
    setTimeout(() => {
      const activeElement = document.querySelector(`[data-page="${page}"]`)
      if (activeElement && sidebarRef.current) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 50)
  }

  const handleOpenUserCard = () => setUserCardOpen(true)
  const handleCloseUserCard = () => setUserCardOpen(false)

  const theme = createAppTheme(baseTheme, accentTheme)
  const isDark = baseTheme === 'dark'

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />
      case 'search':
        return <Search />
      case 'random':
        return <Random />
      case 'explore':
        return <Explore />
      case 'karaokePlaylist':
        return <KaraokePlaylist />
      case 'karaokeQuiz':
        return <KaraokeQuiz />
      case 'listenTogether':
        return <ListenTogether />
      case 'about':
        return <About />
      case 'favorites':
        return <Favorites />
      case 'downloads':
        return <Downloads />
      case 'playlists':
        return <Playlists />
      case 'uploaded':
        return <Uploaded />
      case 'artGallery':
        return <ArtGallery />
      case 'videoLibrary':
        return <VideoLibrary />
      case 'audioClips':
        return <AudioClips />
      case 'communityCanvas':
        return <CommunityCanvas />
      case 'quotes':
        return <Quotes />
      case 'settings':
        return (
          <ThemeSettings
            baseTheme={baseTheme}
            accentTheme={accentTheme}
            language={language}
            onBaseThemeChange={handleBaseThemeChange}
            onAccentThemeChange={handleAccentThemeChange}
            onLanguageChange={handleLanguageChange}
          />
        )
      default:
        return <Home />
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <Box
          style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            color: isDark ? '#ffffff' : '#1a1a1a',
            overflow: 'hidden',
            transition: 'background-color 0.3s ease',
          }}
        >
          <Flex vertical style={{ height: '100%' }}>
            <TitleBar baseTheme={baseTheme} />

            <Flex flex={1} style={{ overflow: 'hidden' }}>
              <Flex vertical>
                <Sidebar
                  ref={sidebarRef}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  accentColor={accentColor}
                  baseTheme={baseTheme}
                  sidebarCollapsed={sidebarCollapsed}
                  onToggleCollapse={handleSidebarCollapse}
                />
                <UserPanel
                  onSettingsClick={() => handlePageChange('settings')}
                  onOpenUserCard={handleOpenUserCard}
                  accentColor={accentColor}
                  baseTheme={baseTheme}
                />
              </Flex>

              <Box
                flex={1}
                style={{
                  overflow: 'auto',
                  backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                  position: 'relative',
                }}
              >
                <AnimatePresence mode="wait">
                  <PageTransition key={currentPage}>
                    {renderPage()}
                  </PageTransition>
                </AnimatePresence>
              </Box>
            </Flex>
          </Flex>

          <UserCardDialog
            isOpen={userCardOpen}
            onClose={handleCloseUserCard}
            baseTheme={baseTheme}
            accentColor={accentColor}
            onSettingsClick={() => {
              handleCloseUserCard()
              handlePageChange('settings')
            }}
          />
        </Box>
      </AntApp>
    </ConfigProvider>
  )
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App
