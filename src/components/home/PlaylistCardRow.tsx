import { useRef, useEffect, useState } from 'react'
import { Card, Skeleton, Typography, Flex, Tag } from 'antd'
import { motion } from 'framer-motion'
import { PlayCircleOutlined, TrophyOutlined, TeamOutlined, EyeOutlined } from '@ant-design/icons'
import type { Playlist, RadioState } from '../../types/api'
import { getThumbnailUrl } from '../../stores/homeDataStore'
import { useI18n } from '../../i18n'

const { Text } = Typography

interface PlaylistCardRowProps {
  playlists: Playlist[]
  loading: boolean
  error: string | null
  radioState: RadioState | null
  radioLoading: boolean
  onRadioClick?: () => void
  onKaraokeQuizClick?: () => void
  onListenTogetherClick?: () => void
}

// 歌单卡片
function PlaylistCard({ playlist, index }: { playlist: Playlist; index: number }) {
  const coverUrl = playlist.mosaicMedia?.[0]?.cloudflareId
    ? getThumbnailUrl(playlist.mosaicMedia[0].cloudflareId)
    : playlist.media?.cloudflareId
      ? getThumbnailUrl(playlist.media.cloudflareId)
      : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        hoverable
        style={{ width: 160, borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}
        styles={{ body: { padding: 12 } }}
        cover={
          <div style={{ width: 160, height: 160, position: 'relative', overflow: 'hidden' }}>
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={playlist.name || '歌单封面'}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 48 }}>♪</Text>
              </div>
            )}
          </div>
        }
      >
        <Text ellipsis style={{ fontSize: 13, fontWeight: 500 }}>
          {playlist.name || '未命名歌单'}
        </Text>
        {playlist.songCount !== undefined && (
          <Text type="secondary" style={{ fontSize: 12 }}>{playlist.songCount} 首歌曲</Text>
        )}
      </Card>
    </motion.div>
  )
}

// 功能卡片（正方形）
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  gradient: string
  live?: boolean
  listenerCount?: number
  onClick?: () => void
  loading?: boolean
}

function FeatureCard({ icon, title, subtitle, gradient, live, listenerCount, onClick, loading }: FeatureCardProps) {
  if (loading) {
    return (
      <Card
        style={{ width: 160, borderRadius: 12 }}
        styles={{ body: { padding: 0 } }}
      >
        <Skeleton.Image active style={{ width: 160, height: 204 }} />
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        hoverable
        onClick={onClick}
        style={{
          width: 160,
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'pointer',
          background: gradient,
          border: 'none',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Flex
          vertical
          align="center"
          justify="center"
          style={{ height: 204, padding: 16 }}
          gap={8}
        >
          {/* 图标 */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>

          {/* LIVE 标签 */}
          {live && (
            <Tag color="green" style={{ margin: 0, padding: '2px 8px', borderRadius: 4 }}>
              LIVE
            </Tag>
          )}

          {/* 标题 */}
          <Text style={{ color: '#fff', fontWeight: 600, fontSize: 15, textAlign: 'center' }}>
            {title}
          </Text>

          {/* 副标题/听众数 */}
          {listenerCount !== undefined ? (
            <Flex align="center" gap={4}>
              <EyeOutlined style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }} />
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                {listenerCount} 听众
              </Text>
            </Flex>
          ) : subtitle ? (
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center' }}>
              {subtitle}
            </Text>
          ) : null}
        </Flex>
      </Card>
    </motion.div>
  )
}

// 骨架卡片
function SkeletonCard() {
  return (
    <Card
      style={{ width: 160, borderRadius: 12 }}
      styles={{ body: { padding: 12 } }}
      cover={<Skeleton.Image active style={{ width: 160, height: 160 }} />}
    >
      <Skeleton active paragraph={false} title={{ width: '80%' }} />
    </Card>
  )
}

export function PlaylistCardRow({
  playlists,
  loading,
  error,
  radioState,
  radioLoading,
  onRadioClick,
  onKaraokeQuizClick,
  onListenTogetherClick,
}: PlaylistCardRowProps) {
  const { t } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // 鼠标滚轮横向滚动
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  // 鼠标拖拽滚动
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const isRadioOffline = radioState?.offline

  return (
    <div style={{ marginBottom: 32 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 18 }}>{t('home.dailyRecommend')}</Text>
      </Flex>

      {error && <Text type="danger">{error}</Text>}

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: 8,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* 歌单卡片 */}
            {playlists.map((playlist, index) => (
              <PlaylistCard
                key={playlist.id || index}
                playlist={playlist}
                index={index}
              />
            ))}

            {/* 电台卡片 */}
            <FeatureCard
              icon={<PlayCircleOutlined style={{ fontSize: 28, color: '#fff' }} />}
              title={t('home.radio')}
              subtitle={isRadioOffline ? t('home.radioOffline') : undefined}
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              live={!isRadioOffline}
              listenerCount={!isRadioOffline ? radioState?.listenerCount : undefined}
              onClick={onRadioClick}
              loading={radioLoading}
            />

            {/* 音乐挑战卡片 */}
            <FeatureCard
              icon={<TrophyOutlined style={{ fontSize: 28, color: '#fff' }} />}
              title={t('home.karaokeQuiz')}
              subtitle={t('home.karaokeQuizDesc')}
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              onClick={onKaraokeQuizClick}
            />

            {/* 一起听卡片 */}
            <FeatureCard
              icon={<TeamOutlined style={{ fontSize: 28, color: '#fff' }} />}
              title={t('home.listenTogether')}
              subtitle={t('home.listenTogetherDesc')}
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              onClick={onListenTogetherClick}
            />
          </>
        )}
      </div>
    </div>
  )
}
