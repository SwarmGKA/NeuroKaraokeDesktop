import { useEffect, useRef } from 'react'
import { Card, Skeleton, Typography, Flex, Tag, Empty, Spin } from 'antd'
import { motion } from 'framer-motion'
import { PlayCircleOutlined, FireOutlined } from '@ant-design/icons'
import type { SongListItem, Song } from '../../types/api'
import { getThumbnailUrl } from '../../stores/homeDataStore'
import { useI18n } from '../../i18n'
import { usePlayer } from '../../stores/playerStore'

const { Text } = Typography

interface SongCardGridProps {
  songs: SongListItem[]
  loading: boolean
  hasMore: boolean
  isDark: boolean
  onLoadMore: () => void
}

// 将 SongListItem 转换为 Song 格式
function songListItemToSong(item: SongListItem): Song {
  return {
    id: item.id,
    title: item.title,
    absolutePath: item.absolutePath,
    duration: item.duration,
    playCount: item.playCount,
    streamDate: item.streamDate,
    dateAdded: item.dateAdded,
    coverArtists: item.coverArtists?.map(name => ({ name })),
    originalArtists: item.originalArtists?.map(name => ({ name })),
    coverArt: item.coverArt,
    hls: item.hls,
    hasLyrics: item.hasLyrics,
  }
}

// 单个歌曲卡片
function SongCard({
  song,
  index,
  isDark,
  hotBadgeText,
  unknownArtistText,
  onPlay,
}: {
  song: SongListItem
  index: number
  isDark: boolean
  hotBadgeText: string
  unknownArtistText: string
  onPlay: () => void
}) {
  const coverUrl = song.coverArt?.cloudflareId
    ? getThumbnailUrl(song.coverArt.cloudflareId)
    : undefined

  const artists = song.coverArtists?.join(', ') || song.originalArtists?.join(', ') || unknownArtistText
  const isHot = (song.playCount || 0) > 10000

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.25 }}
    >
      <Card
        hoverable
        onClick={onPlay}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'pointer',
          height: '100%',
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}
        styles={{
          body: { padding: 0 },
        }}
      >
        {/* 封面 - 占比 60% */}
        <div
          style={{
            width: '100%',
            paddingTop: '60%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={song.title || ''}
              loading="lazy"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 32 }}>♪</Text>
            </div>
          )}

          {/* 热门标记 */}
          {isHot && (
            <Tag
              icon={<FireOutlined />}
              color="red"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                margin: 0,
                borderRadius: 4,
              }}
            >
              {hotBadgeText}
            </Tag>
          )}

          {/* 悬浮播放图标 */}
          <div
            className="song-card-play-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <PlayCircleOutlined style={{ fontSize: 48, color: '#fff' }} />
          </div>
        </div>

        {/* 信息区域 */}
        <div style={{ padding: 12 }}>
          <Text
            ellipsis
            style={{
              fontWeight: 500,
              fontSize: 14,
              display: 'block',
              color: isDark ? '#fff' : '#1a1a1a',
            }}
          >
            {song.title}
          </Text>
          <Text
            ellipsis
            type="secondary"
            style={{ fontSize: 12, marginTop: 4, display: 'block' }}
          >
            {artists}
          </Text>
        </div>
      </Card>

      {/* 悬浮样式 */}
      <style>{`
        .song-card-play-overlay {
          opacity: 0;
        }
        .ant-card:hover .song-card-play-overlay {
          opacity: 1;
        }
      `}</style>
    </motion.div>
  )
}

// 骨架卡片
function SkeletonCard() {
  return (
    <Card
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
      styles={{ body: { padding: 0 } }}
    >
      <Skeleton.Image
        active
        style={{
          width: '100%',
          height: 0,
          paddingTop: '60%',
          borderRadius: 0,
        }}
      />
      <div style={{ padding: 12 }}>
        <Skeleton active paragraph={false} title={{ width: '80%' }} />
        <Skeleton active paragraph={false} title={{ width: '60%' }} style={{ marginTop: 8 }} />
      </div>
    </Card>
  )
}

export function SongCardGrid({
  songs,
  loading,
  hasMore,
  isDark,
  onLoadMore,
}: SongCardGridProps) {
  const { t } = useI18n()
  const { playSong } = usePlayer()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const hotBadgeText = t('home.hotBadge')
  const unknownArtistText = t('song.unknownArtist')

  // 无限滚动
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [hasMore, loading, onLoadMore])

  // 播放歌曲
  const handlePlay = (song: SongListItem, index: number) => {
    const allSongs = songs.map((s) => songListItemToSong(s))
    const currentSong = songListItemToSong(song)
    playSong(currentSong, allSongs, index)
  }

  if (songs.length === 0 && !loading) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t('search.noSongsFound')}
        style={{ padding: 64 }}
      />
    )
  }

  return (
    <div>
      {/* 歌曲网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}
      >
        {songs.map((song, index) => (
          <SongCard
            key={song.id || `${song.title}-${index}`}
            song={song}
            index={index}
            isDark={isDark}
            hotBadgeText={hotBadgeText}
            unknownArtistText={unknownArtistText}
            onPlay={() => handlePlay(song, index)}
          />
        ))}

        {/* 加载骨架屏 */}
        {loading && Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      </div>

      {/* 加载更多触发器 */}
      {hasMore && !loading && (
        <div ref={loadMoreRef} style={{ height: 1 }} />
      )}

      {/* 加载中提示 */}
      {loading && (
        <Flex justify="center" style={{ padding: 24 }}>
          <Spin />
        </Flex>
      )}
    </div>
  )
}
