import { forwardRef } from 'react'
import { Flex, Button, Typography } from 'antd'
import { useI18n } from '../i18n'
import {
  HomeOutlined,
  SearchOutlined,
  SyncOutlined,
  CompassOutlined,
  UnorderedListOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  AppstoreOutlined,
  MessageOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'

const { Text } = Typography

export type Page =
  | 'home'
  | 'search'
  | 'random'
  | 'explore'
  | 'artists'
  | 'karaokePlaylist'
  | 'karaokeQuiz'
  | 'listenTogether'
  | 'radio'
  | 'about'
  | 'favorites'
  | 'downloads'
  | 'playlists'
  | 'uploaded'
  | 'artGallery'
  | 'videoLibrary'
  | 'audioClips'
  | 'communityCanvas'
  | 'quotes'
  | 'settings'

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  accentColor: string
  baseTheme: 'light' | 'dark'
  sidebarCollapsed: boolean
  onToggleCollapse: () => void
}

interface MenuItem {
  id: Page
  icon: React.ReactNode
  labelKey: string
}

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ currentPage, onPageChange, accentColor, baseTheme, sidebarCollapsed, onToggleCollapse }, ref) => {
    const { t } = useI18n()

    const mainMenu: MenuItem[] = [
      { id: 'home', icon: <HomeOutlined />, labelKey: 'sidebar.home' },
      { id: 'search', icon: <SearchOutlined />, labelKey: 'sidebar.search' },
      { id: 'random', icon: <SyncOutlined />, labelKey: 'sidebar.random' },
      { id: 'explore', icon: <CompassOutlined />, labelKey: 'sidebar.explore' },
      { id: 'karaokePlaylist', icon: <UnorderedListOutlined />, labelKey: 'sidebar.karaokePlaylist' },
      { id: 'karaokeQuiz', icon: <QuestionCircleOutlined />, labelKey: 'sidebar.karaokeQuiz' },
      { id: 'listenTogether', icon: <CustomerServiceOutlined />, labelKey: 'sidebar.listenTogether' },
      { id: 'about', icon: <InfoCircleOutlined />, labelKey: 'sidebar.about' },
    ]

    const libraryItems: MenuItem[] = [
      { id: 'favorites', icon: <HeartOutlined />, labelKey: 'sidebar.favorites' },
      { id: 'downloads', icon: <DownloadOutlined />, labelKey: 'sidebar.downloads' },
      { id: 'playlists', icon: <UnorderedListOutlined />, labelKey: 'sidebar.playlists' },
      { id: 'uploaded', icon: <UploadOutlined />, labelKey: 'sidebar.uploaded' },
    ]

    const otherItems: MenuItem[] = [
      { id: 'artGallery', icon: <PictureOutlined />, labelKey: 'sidebar.artGallery' },
      { id: 'videoLibrary', icon: <VideoCameraOutlined />, labelKey: 'sidebar.videoLibrary' },
      { id: 'audioClips', icon: <AudioOutlined />, labelKey: 'sidebar.audioClips' },
      { id: 'communityCanvas', icon: <AppstoreOutlined />, labelKey: 'sidebar.communityCanvas' },
      { id: 'quotes', icon: <MessageOutlined />, labelKey: 'sidebar.quotes' },
    ]

    const isDark = baseTheme === 'dark'

    const renderMenuItem = (item: MenuItem) => {
      const isActive = currentPage === item.id

      return (
        <Button
          key={item.id}
          data-page={item.id}
          type={isActive ? 'primary' : 'text'}
          icon={item.icon}
          style={{
            width: '100%',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            backgroundColor: isActive ? `${accentColor}20` : 'transparent',
            color: isActive ? accentColor : isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
            border: 'none',
            height: '36px',
            marginBottom: '2px',
          }}
          onClick={() => onPageChange(item.id)}
        >
          {!sidebarCollapsed && (
            <span style={{ flex: 1, textAlign: 'left' }}>
              {t(item.labelKey)}
            </span>
          )}
          {!sidebarCollapsed && item.id === 'playlists' && (
            <PlusOutlined
              style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </Button>
      )
    }

    return (
      <Flex
        ref={ref}
        vertical
        style={{
          width: sidebarCollapsed ? 60 : 240,
          height: '100%',
          backgroundColor: isDark ? '#1a1a1a' : '#fafafa',
          borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
          transition: 'width 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 菜单区域 */}
        <Flex
          vertical
          flex={1}
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: 8,
            // 隐藏滚动条
          }}
        >
          {/* 主菜单 */}
          <Flex vertical gap={2}>
            {mainMenu.map(renderMenuItem)}
          </Flex>

          {/* 分隔线 */}
          {!sidebarCollapsed && (
            <div
              style={{
                height: 1,
                backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                margin: '8px 12px',
              }}
            />
          )}

          {/* 我的库 */}
          <Flex vertical gap={2}>
            {!sidebarCollapsed && (
              <Text
                style={{
                  fontSize: 11,
                  color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '8px 12px',
                }}
              >
                {t('sidebar.library')}
              </Text>
            )}
            {libraryItems.map(renderMenuItem)}
          </Flex>

          {/* 分隔线 */}
          {!sidebarCollapsed && (
            <div
              style={{
                height: 1,
                backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                margin: '8px 12px',
              }}
            />
          )}

          {/* 其他 */}
          <Flex vertical gap={2}>
            {!sidebarCollapsed && (
              <Text
                style={{
                  fontSize: 11,
                  color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '8px 12px',
                }}
              >
                {t('sidebar.others')}
              </Text>
            )}
            {otherItems.map(renderMenuItem)}
          </Flex>
        </Flex>

        {/* 折叠按钮 */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 16,
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={sidebarCollapsed ? <RightOutlined /> : <LeftOutlined />}
            style={{
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
              backgroundColor: isDark ? '#1a1a1a' : '#fafafa',
            }}
            onClick={onToggleCollapse}
          />
        </div>
      </Flex>
    )
  }
)

Sidebar.displayName = 'Sidebar'
