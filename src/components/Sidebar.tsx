import { Button, Typography, Space, Avatar } from 'antd'
import {
  FiHome,
  FiSearch,
  FiShuffle,
  FiCompass,
  FiUsers,
  FiMusic,
  FiHelpCircle,
  FiHeadphones,
  FiInfo,
  FiHeart,
  FiDownload,
  FiList,
  FiUpload,
  FiImage,
  FiVideo,
  FiMic,
  FiMessageCircle,
  FiQuote,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { useI18n } from '../i18n'
import { BaseTheme, accentColors, AccentTheme } from '../theme'

const { Text } = Typography

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  accentColor: AccentTheme
  baseTheme: BaseTheme
  sidebarCollapsed: boolean
  onToggleCollapse: () => void
}

interface MenuItem {
  key: string
  label: string
  icon: React.ReactNode
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

export function Sidebar({
  currentPage,
  onPageChange,
  accentColor,
  baseTheme,
  sidebarCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { t } = useI18n()
  const accent = accentColors[accentColor]

  const menuGroups: MenuGroup[] = [
    {
      title: t('sidebar.home'),
      items: [
        { key: 'home', label: t('sidebar.home'), icon: <FiHome /> },
        { key: 'search', label: t('sidebar.search'), icon: <FiSearch /> },
        { key: 'random', label: t('sidebar.random'), icon: <FiShuffle /> },
        { key: 'explore', label: t('sidebar.explore'), icon: <FiCompass /> },
        { key: 'artists', label: t('sidebar.artists'), icon: <FiUsers /> },
        { key: 'karaokePlaylist', label: t('sidebar.karaokePlaylist'), icon: <FiMusic /> },
        { key: 'karaokeQuiz', label: t('sidebar.karaokeQuiz'), icon: <FiHelpCircle /> },
        { key: 'listenTogether', label: t('sidebar.listenTogether'), icon: <FiHeadphones /> },
        { key: 'about', label: t('sidebar.about'), icon: <FiInfo /> },
      ],
    },
    {
      title: t('sidebar.library'),
      items: [
        { key: 'favorites', label: t('sidebar.favorites'), icon: <FiHeart /> },
        { key: 'downloads', label: t('sidebar.downloads'), icon: <FiDownload /> },
        { key: 'playlists', label: t('sidebar.playlists'), icon: <FiList /> },
        { key: 'uploaded', label: t('sidebar.uploaded'), icon: <FiUpload /> },
      ],
    },
    {
      title: t('sidebar.others'),
      items: [
        { key: 'artGallery', label: t('sidebar.artGallery'), icon: <FiImage /> },
        { key: 'videoLibrary', label: t('sidebar.videoLibrary'), icon: <FiVideo /> },
        { key: 'audioClips', label: t('sidebar.audioClips'), icon: <FiMic /> },
        { key: 'communityCanvas', label: t('sidebar.communityCanvas'), icon: <FiMessageCircle /> },
        { key: 'quotes', label: t('sidebar.quotes'), icon: <FiQuote /> },
      ],
    },
  ]

  const sidebarWidth = sidebarCollapsed ? 64 : 220

  return (
    <div
      style={{
        width: sidebarWidth,
        height: '100%',
        backgroundColor: baseTheme === 'dark' ? '#141414' : '#ffffff',
        borderRight: `1px solid ${baseTheme === 'dark' ? '#303030' : '#f0f0f0'}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} style={{ marginBottom: 16 }}>
            {!sidebarCollapsed && (
              <Text
                style={{
                  display: 'block',
                  padding: '8px 16px',
                  fontSize: 12,
                  color: baseTheme === 'dark' ? '#ffffff73' : '#00000073',
                  fontWeight: 500,
                }}
              >
                {group.title}
              </Text>
            )}
            {group.items.map((item) => {
              const isActive = currentPage === item.key
              return (
                <Button
                  key={item.key}
                  type="text"
                  icon={item.icon}
                  onClick={() => onPageChange(item.key)}
                  style={{
                    width: '100%',
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    padding: sidebarCollapsed ? 0 : '0 16px',
                    gap: sidebarCollapsed ? 0 : 12,
                    color: isActive
                      ? accent.primary
                      : baseTheme === 'dark'
                        ? '#ffffffd9'
                        : '#000000d9',
                    backgroundColor: isActive
                      ? accent.primaryBg
                      : 'transparent',
                    borderRadius: 0,
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = baseTheme === 'dark' ? '#ffffff0a' : '#0000000a'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Button>
              )
            })}
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '8px 0',
          borderTop: `1px solid ${baseTheme === 'dark' ? '#303030' : '#f0f0f0'}`,
        }}
      >
        <Button
          type="text"
          icon={sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          onClick={onToggleCollapse}
          style={{
            width: '100%',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9',
          }}
        />
      </div>
    </div>
  )
}
