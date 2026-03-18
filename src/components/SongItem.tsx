import { Card, Typography, Flex, Progress, Popconfirm } from 'antd'
import { PlayCircleOutlined, DownloadOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useI18n } from '../i18n'
import { useDownloadStore, type DownloadedSong } from '../stores/downloadStore'
import type { SongListItem, TrendingSong, Song } from '../types/api'

const { Text } = Typography

// 歌曲项 Props
interface SongItemProps {
  // 歌曲信息
  song: SongListItem | TrendingSong | Song | DownloadedSong
  // 封面 URL
  coverUrl?: string
  // 显示名称（优先使用，格式：歌名 - 原作者名）
  displayName?: string
  // 艺术家（封面艺术家）
  artists?: string
  // 是否正在播放
  isPlaying?: boolean
  // 播放回调
  onPlay: () => void
  // 是否显示下载按钮
  showDownload?: boolean
  // 是否显示删除按钮
  showDelete?: boolean
  // 删除回调
  onDelete?: () => void
  // 是否支持下载（有音频源）
  canDownload?: boolean
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SongItem({
  song,
  coverUrl,
  displayName,
  artists,
  isPlaying = false,
  onPlay,
  showDownload = true,
  showDelete = false,
  onDelete,
  canDownload = true,
}: SongItemProps) {
  const { t } = useI18n()
  const { downloadSong, isDownloaded, getDownloadState, deleteDownload } = useDownloadStore()

  // 获取歌曲 ID 和标题
  const songId = 'id' in song ? song.id : undefined
  const title = 'title' in song ? song.title : 'Unknown'

  // 显示名称：优先使用传入的 displayName，否则显示 title
  const displayTitle = displayName || title

  // 获取下载状态
  const downloadState = getDownloadState(songId)
  const alreadyDownloaded = isDownloaded(songId)
  const isDownloading = downloadState?.status === 'downloading'

  // 处理下载
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (songId && !alreadyDownloaded && !isDownloading && canDownload) {
      await downloadSong(song as SongListItem | TrendingSong | Song)
    }
  }

  // 处理删除
  const handleDelete = async () => {
    if (songId && onDelete) {
      onDelete()
    } else if (songId && alreadyDownloaded) {
      await deleteDownload(songId)
    }
  }

  // 获取下载图标状态
  const renderDownloadButton = () => {
    if (!showDownload || !songId) return null

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
          title={t('downloads.downloaded')}
        />
      )
    }

    if (!canDownload) {
      return (
        <DownloadOutlined
          style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)' }}
        />
      )
    }

    return (
      <DownloadOutlined
        style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}
        onClick={handleDownload}
        title={t('song.download')}
      />
    )
  }

  // 渲染删除按钮
  const renderDeleteButton = () => {
    if (!showDelete) return null

    return (
      <Popconfirm
        title={t('downloads.deleteConfirm')}
        onConfirm={handleDelete}
        okText={t('downloads.delete')}
        cancelText={t('search.clearHistory')}
      >
        <DeleteOutlined
          style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}
          onClick={(e) => e.stopPropagation()}
        />
      </Popconfirm>
    )
  }

  // 检查是否为已下载歌曲
  const isDownloadedSong = 'filePath' in song
  const downloadedSong = isDownloadedSong ? (song as DownloadedSong) : null

  return (
    <Card
      hoverable
      onClick={onPlay}
      style={{
        backgroundColor: isPlaying ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255,255,255,0.03)',
        border: isPlaying ? '1px solid rgba(102, 126, 234, 0.5)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        cursor: 'pointer',
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
              alt={displayTitle || ''}
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
            {displayTitle || t('song.defaultTitle')}
          </Text>
          {artists && (
            <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
              {artists}
            </Text>
          )}
          {downloadedSong && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {formatFileSize(downloadedSong.fileSize)}
            </Text>
          )}
        </Flex>

        {/* 操作按钮 */}
        <Flex gap={12} align="center">
          {renderDownloadButton()}
          {renderDeleteButton()}
        </Flex>
      </Flex>
    </Card>
  )
}
