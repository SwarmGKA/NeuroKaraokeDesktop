import { Flex, Typography, Card, Skeleton, Button, Empty } from 'antd'
import { motion } from 'framer-motion'
import { PlayCircleOutlined, ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useI18n } from '../i18n'
import { usePlaylistDetail } from '../stores/playlistDetailStore'
import { usePlayer } from '../stores/playerStore'
import type { PlaylistSong } from '../types/api'

const { Title, Text } = Typography

// 格式化时长（从 audioUrl 推断或使用默认值）
function formatDuration(seconds?: number): string {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 歌曲列表项组件
function SongItem({
  song,
  index,
  onPlay,
  isPlaying
}: {
  song: PlaylistSong
  index: number
  onPlay: () => void
  isPlaying: boolean
}) {
  // coverArt 已经是完整的 URL
  const coverUrl = song.coverArt

  // 艺术家信息
  const artists = song.coverArtists || song.originalArtists

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
    >
      <Card
        hoverable
        onClick={onPlay}
        style={{
          backgroundColor: isPlaying ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255,255,255,0.03)',
          border: isPlaying ? '1px solid rgba(102, 126, 234, 0.5)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          cursor: 'pointer',
          marginBottom: 8,
        }}
        styles={{ body: { padding: '12px 16px' } }}
      >
        <Flex align="center" gap={12}>
          {/* 封面 */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={song.title || ''}
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
                <Text style={{ color: '#fff', fontSize: 20 }}>♪</Text>
              </div>
            )}
            {isPlaying && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlayCircleOutlined style={{ color: '#fff', fontSize: 20 }} />
              </div>
            )}
          </div>

          {/* 歌曲信息 */}
          <Flex vertical flex={1} style={{ minWidth: 0 }}>
            <Text
              ellipsis
              style={{
                fontWeight: 500,
                color: isPlaying ? '#667eea' : undefined,
              }}
            >
              {song.title || '未知歌曲'}
            </Text>
            {artists && (
              <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                {artists}
              </Text>
            )}
          </Flex>

          {/* 艺术家标签 */}
          {song.coverArtists && (
            <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
              {song.coverArtists}
            </Text>
          )}
        </Flex>
      </Card>
    </motion.div>
  )
}

interface PlaylistDetailProps {
  onBack: () => void
}

export function PlaylistDetail({ onBack }: PlaylistDetailProps) {
  const { t } = useI18n()
  const { currentPlaylist, loading, error } = usePlaylistDetail()
  const { state, playSong } = usePlayer()

  // 获取歌曲列表（优先使用 songs，否则使用 songListDTOs）
  const songs = currentPlaylist?.songs || []

  // 播放全部
  const handlePlayAll = () => {
    if (songs.length === 0) return

    // 转换为 Song 格式
    const playlistSongs = songs.map((song) => ({
      title: song.title,
      audioUrl: song.audioUrl,
      coverArtists: song.coverArtists ? [{ name: song.coverArtists }] : undefined,
      originalArtists: song.originalArtists ? [{ name: song.originalArtists }] : undefined,
      coverArt: song.coverArt ? { absolutePath: song.coverArt } : undefined,
    }))

    playSong(playlistSongs[0], playlistSongs, 0)
  }

  // 播放单首歌曲
  const handlePlaySong = (index: number) => {
    if (songs.length === 0) return

    const playlistSongs = songs.map((song) => ({
      title: song.title,
      audioUrl: song.audioUrl,
      coverArtists: song.coverArtists ? [{ name: song.coverArtists }] : undefined,
      originalArtists: song.originalArtists ? [{ name: song.originalArtists }] : undefined,
      coverArt: song.coverArt ? { absolutePath: song.coverArt } : undefined,
    }))

    playSong(playlistSongs[index], playlistSongs, index)
  }

  // 获取封面 URL - 使用 cover 字段
  const coverUrl = currentPlaylist?.cover

  if (loading) {
    return (
      <Flex vertical gap={24} style={{ padding: 24 }}>
        <Skeleton active />
        <Skeleton active />
        <Flex vertical gap={8}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} style={{ borderRadius: 12 }}>
              <Skeleton avatar active paragraph={{ rows: 1 }} />
            </Card>
          ))}
        </Flex>
      </Flex>
    )
  }

  if (error) {
    return (
      <Flex vertical align="center" justify="center" style={{ padding: 48, height: '100%' }}>
        <Empty description={error} />
        <Button type="primary" onClick={onBack} style={{ marginTop: 16 }}>
          {t('playlist.backToList')}
        </Button>
      </Flex>
    )
  }

  if (!currentPlaylist) {
    return (
      <Flex vertical align="center" justify="center" style={{ padding: 48, height: '100%' }}>
        <Empty description={t('playlist.notFound')} />
        <Button type="primary" onClick={onBack} style={{ marginTop: 16 }}>
          {t('playlist.backToList')}
        </Button>
      </Flex>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '100%' }}
    >
      {/* 头部：封面和基本信息 */}
      <div
        style={{
          padding: '32px 40px',
          background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.2) 0%, transparent 100%)',
        }}
      >
        <Flex gap={24} align="flex-end">
          {/* 封面 */}
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              flexShrink: 0,
            }}
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={currentPlaylist.name || t('playlist.coverAlt')}
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
                <Text style={{ color: '#fff', fontSize: 64 }}>♪</Text>
              </div>
            )}
          </div>

          {/* 信息 */}
          <Flex vertical gap={8} flex={1}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              style={{ width: 'fit-content', color: 'rgba(255,255,255,0.65)' }}
            >
              {t('playlist.backToList')}
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {currentPlaylist.name || t('playlist.defaultName')}
            </Title>
            <Flex gap={16} align="center">
              <Text type="secondary">
                {t('playlist.songCount', { '0': songs.length })}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </div>

      {/* 操作栏 */}
      <Flex gap={12} style={{ padding: '16px 40px' }}>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          size="large"
        >
          {t('playlist.playAll')}
        </Button>
      </Flex>

      {/* 歌曲列表 */}
      <div style={{ padding: '0 40px 40px' }}>
        {songs.length === 0 ? (
          <Empty description={t('playlist.emptySongs')} style={{ marginTop: 48 }} />
        ) : (
          songs.map((song, index) => {
            // 检查当前歌曲是否正在播放
            const isPlaying = state.currentSong?.title === song.title && state.isPlaying

            return (
              <SongItem
                key={`${song.title}-${index}`}
                song={song}
                index={index}
                onPlay={() => handlePlaySong(index)}
                isPlaying={isPlaying}
              />
            )
          })
        )}
      </div>
    </motion.div>
  )
}
