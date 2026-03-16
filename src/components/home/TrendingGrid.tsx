import { Card, Skeleton, Typography, Flex, Tag } from 'antd'
import { motion } from 'framer-motion'
import { FireOutlined } from '@ant-design/icons'
import type { TrendingSong } from '../../types/api'
import { getThumbnailUrl } from '../../stores/homeDataStore'
import { useI18n } from '../../i18n'

const { Text } = Typography

interface TrendingGridProps {
  songs: TrendingSong[]
  loading: boolean
  error: string | null
}

// 单个歌曲卡片
function TrendingSongCard({
  song,
  index,
  hotBadgeText
}: {
  song: TrendingSong
  index: number
  hotBadgeText: string
}) {
  const coverUrl = song.cover_art?.cloudflare_id
    ? getThumbnailUrl(song.cover_art.cloudflare_id, 200)
    : undefined

  const artists = song.cover_artists?.join(', ') || song.original_artists?.join(', ') || '未知艺术家'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + index * 0.03, duration: 0.25 }}
    >
      <Card
        hoverable
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'pointer',
          height: '100%',
        }}
        styles={{
          body: { padding: 12 },
        }}
      >
        <Flex gap={12} align="center">
          {/* 封面 */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={song.title || '歌曲封面'}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 20 }}>♪</Text>
              </div>
            )}
          </div>

          {/* 信息 */}
          <Flex vertical flex={1} style={{ minWidth: 0 }}>
            <Text
              ellipsis
              style={{ fontWeight: 500, fontSize: 14 }}
            >
              {song.title || '未知歌曲'}
            </Text>
            <Text
              ellipsis
              type="secondary"
              style={{ fontSize: 12, marginTop: 2 }}
            >
              {artists}
            </Text>
          </Flex>

          {/* 热门标记 */}
          {index < 3 && (
            <Tag
              icon={<FireOutlined />}
              color="red"
              style={{ margin: 0, borderRadius: 4 }}
            >
              {hotBadgeText}
            </Tag>
          )}
        </Flex>
      </Card>
    </motion.div>
  )
}

// 骨架卡片
function SkeletonSongCard() {
  return (
    <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 12 } }}>
      <Flex gap={12} align="center">
        <Skeleton.Avatar active size={56} shape="square" />
        <Flex vertical flex={1}>
          <Skeleton active paragraph={false} title={{ width: '70%' }} />
          <Skeleton active paragraph={false} title={{ width: '50%' }} />
        </Flex>
      </Flex>
    </Card>
  )
}

export function TrendingGrid({ songs, loading, error }: TrendingGridProps) {
  const { t } = useI18n()

  // 显示前12首歌曲，分两列
  const displaySongs = songs.slice(0, 12)
  const hotBadgeText = t('home.hotBadge')

  return (
    <div style={{ marginBottom: 32 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 18 }}>{t('home.trending')}</Text>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {t('home.trendingDesc')}
        </Text>
      </Flex>

      {error && (
        <Text type="danger">{error}</Text>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonSongCard key={i} />
          ))
        ) : (
          displaySongs.map((song, index) => (
            <TrendingSongCard
              key={`${song.title}-${index}`}
              song={song}
              index={index}
              hotBadgeText={hotBadgeText}
            />
          ))
        )}
      </div>
    </div>
  )
}
