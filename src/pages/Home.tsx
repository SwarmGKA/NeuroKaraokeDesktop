import { Typography } from 'antd'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import { useHomeData } from '../stores/homeDataStore'
import { PlaylistCardRow, TrendingGrid } from '../components/home'
import type { Playlist } from '../types/api'

const { Title, Text } = Typography

interface HomeProps {
  onOpenPlaylist?: (playlist: Playlist) => void
}

export function Home({ onOpenPlaylist }: HomeProps) {
  const { t } = useI18n()
  const {
    officialPlaylists,
    playlistsLoading,
    playlistsError,
    trendingSongs,
    trendingLoading,
    trendingError,
    radioState,
    radioLoading,
  } = useHomeData()

  // 获取当前时间问候语
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return t('home.greeting.lateNight')
    if (hour < 12) return t('home.greeting.morning')
    if (hour < 18) return t('home.greeting.afternoon')
    return t('home.greeting.evening')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '32px 40px',
        maxWidth: 1200,
        margin: '0 auto',
        minHeight: '100%',
      }}
    >
      {/* 欢迎标题 */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          {getGreeting()}
        </Title>
        <Text type="secondary">{t('home.welcome')}</Text>
      </div>

      {/* 每日推荐 + 电台/音乐挑战/一起听 */}
      <PlaylistCardRow
        playlists={officialPlaylists}
        loading={playlistsLoading}
        error={playlistsError}
        radioState={radioState}
        radioLoading={radioLoading}
        onPlaylistClick={onOpenPlaylist}
      />

      {/* 热门趋势 */}
      <TrendingGrid
        songs={trendingSongs}
        loading={trendingLoading}
        error={trendingError}
      />
    </motion.div>
  )
}
