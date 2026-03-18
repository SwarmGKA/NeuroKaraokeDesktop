import { Flex, Typography, Card, Skeleton, Button, Empty, Progress } from 'antd'
import { motion } from 'framer-motion'
import { PlayCircleOutlined, ArrowLeftOutlined, DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useI18n } from '../i18n'
import { usePlaylistDetail } from '../stores/playlistDetailStore'
import { getThumbnailUrl } from '../stores/homeDataStore'
import { usePlayer } from '../stores/playerStore'
import { useDownloadStore } from '../stores/downloadStore'
import type { SongListDTO, PlaylistSong } from '../types/api'

const { Title, Text } = Typography

// 统一的歌曲项组件
function SongItem({
  title,
  coverUrl,
  artists,
  index,
  onPlay,
  isPlaying,
  songId,
  hasAudio,
  downloadText,
  downloadedText,
}: {
  title?: string
  coverUrl?: string
  artists?: string
  index: number
  onPlay: () => void
  isPlaying: boolean
  songId?: string
  hasAudio?: boolean
  downloadText: string
  downloadedText: string
}) {
  const { downloadSong, isDownloaded, getDownloadState } = useDownloadStore()

  const alreadyDownloaded = isDownloaded(songId)
  const downloadState = getDownloadState(songId)
  const isDownloading = downloadState?.status === 'downloading'

  // 处理下载
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (songId && !alreadyDownloaded && !isDownloading && hasAudio) {
      // 创建一个简单的歌曲对象用于下载
      await downloadSong({
        id: songId,
        title: title,
        absolutePath: undefined, // 这个信息在 PlaylistDetail 中不可用
      } as any)
    }
  }

  // 渲染下载按钮
  const renderDownloadButton = () => {
    if (!songId || !hasAudio) return null

    if (isDownloading) {
      return (
        <div style={{ width: 24, height: 24 }}>
          <Progress
            type="circle"
            percent={downloadState?.progress || 0}
            size={24}
            strokeColor="#667eea"
          />
        </div>
      )
    }

    if (alreadyDownloaded) {
      return (
        <CheckCircleOutlined
          style={{ fontSize: 18, color: '#52c41a' }}
          title={downloadedText}
        />
      )
    }

    return (
      <DownloadOutlined
        style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}
        onClick={handleDownload}
        title={downloadText}
      />
    )
  }

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
                alt={title || ''}
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
              {title || '未知歌曲'}
            </Text>
            {artists && (
              <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                {artists}
              </Text>
            )}
          </Flex>

          {/* 下载按钮 */}
          {renderDownloadButton()}
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

  // 翻译文本
  const downloadText = t('song.download')
  const downloadedText = t('downloads.downloaded')

  // 获取歌曲列表 - 支持两种数据格式
  // 1. songs: 来自 IDK API
  // 2. songListDTOs: 来自 getOfficialPlaylists API
  const idkSongs = currentPlaylist?.songs || []
  const apiSongs = currentPlaylist?.songListDTOs || []
  const useIdkFormat = idkSongs.length > 0
  const songs = useIdkFormat ? idkSongs : apiSongs
  const songCount = songs.length

  // 获取歌单封面 URL
  const getPlaylistCover = () => {
    // 优先使用 mosaicMedia
    if (currentPlaylist?.mosaicMedia?.[0]?.cloudflareId) {
      return getThumbnailUrl(currentPlaylist.mosaicMedia[0].cloudflareId)
    }
    // 其次使用 media
    if (currentPlaylist?.media?.cloudflareId) {
      return getThumbnailUrl(currentPlaylist.media.cloudflareId)
    }
    // 最后使用第一首歌的封面
    if (useIdkFormat && idkSongs[0]?.coverArt) {
      return idkSongs[0].coverArt
    }
    if (!useIdkFormat && apiSongs[0]?.coverArt?.cloudflareId) {
      return getThumbnailUrl(apiSongs[0].coverArt.cloudflareId)
    }
    return undefined
  }
  const coverUrl = getPlaylistCover()

  // 获取歌曲封面 URL
  const getSongCoverUrl = (song: SongListDTO | PlaylistSong, isIdkFormat: boolean): string | undefined => {
    if (isIdkFormat) {
      return (song as PlaylistSong).coverArt
    }
    const dto = song as SongListDTO
    if (dto.coverArt?.cloudflareId) {
      return getThumbnailUrl(dto.coverArt.cloudflareId)
    }
    return undefined
  }

  // 获取歌曲艺术家
  const getSongArtists = (song: SongListDTO | PlaylistSong, isIdkFormat: boolean): string | undefined => {
    if (isIdkFormat) {
      const s = song as PlaylistSong
      return s.coverArtists || s.originalArtists
    }
    const dto = song as SongListDTO
    if (dto.coverArtists?.length) {
      return dto.coverArtists.join(', ')
    }
    if (dto.originalArtists?.length) {
      return dto.originalArtists.join(', ')
    }
    return undefined
  }

  // 播放指定索引的歌曲
  const playSongAtIndex = (index: number) => {
    if (songs.length === 0) return

    const playlistSongs = songs.map((song) => {
      if (useIdkFormat) {
        const s = song as PlaylistSong
        return {
          title: s.title,
          audioUrl: s.audioUrl,
          coverArtists: s.coverArtists ? [{ name: s.coverArtists }] : undefined,
          originalArtists: s.originalArtists ? [{ name: s.originalArtists }] : undefined,
          coverArt: s.coverArt ? { absolutePath: s.coverArt } : undefined,
        }
      } else {
        const s = song as SongListDTO
        return {
          id: s.id,
          title: s.title,
          absolutePath: s.absolutePath,
          hls: s.hls,
          coverArt: s.coverArt,
          coverArtists: s.coverArtists?.map(name => ({ name })),
          originalArtists: s.originalArtists?.map(name => ({ name })),
        }
      }
    })

    playSong(playlistSongs[index], playlistSongs, index)
  }

  // 播放全部
  const handlePlayAll = () => {
    playSongAtIndex(0)
  }

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
                {t('playlist.songCount', { '0': songCount })}
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
          disabled={songCount === 0}
          size="large"
        >
          {t('playlist.playAll')}
        </Button>
      </Flex>

      {/* 歌曲列表 */}
      <div style={{ padding: '0 40px 40px' }}>
        {songCount === 0 ? (
          <Empty description={t('playlist.emptySongs')} style={{ marginTop: 48 }} />
        ) : (
          songs.map((song, index) => {
            const title = song.title
            const songCoverUrl = getSongCoverUrl(song, useIdkFormat)
            const artists = getSongArtists(song, useIdkFormat)
            const isPlaying = state.currentSong?.title === title && state.isPlaying
            const songId = useIdkFormat ? undefined : (song as SongListDTO).id
            const hasAudio = useIdkFormat ? !!(song as PlaylistSong).audioUrl : !!(song as SongListDTO).absolutePath || !!(song as SongListDTO).hls

            return (
              <SongItem
                key={`${title}-${index}`}
                title={title}
                coverUrl={songCoverUrl}
                artists={artists}
                index={index}
                onPlay={() => playSongAtIndex(index)}
                isPlaying={isPlaying}
                songId={songId}
                hasAudio={hasAudio}
                downloadText={downloadText}
                downloadedText={downloadedText}
              />
            )
          })
        )}
      </div>
    </motion.div>
  )
}
