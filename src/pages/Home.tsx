import { Typography } from 'antd'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import { useHomeData } from '../stores/homeDataStore'
import { PlaylistCardRow, TrendingGrid } from '../components/home'

const { Title, Text } = Typography

export function Home() {
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
    if (hour < 6) return '夜深了'
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
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
