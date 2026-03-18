import { Flex, Typography, Empty, Button, Dropdown } from 'antd'
import { FolderOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons'
import { useI18n } from '../i18n'
import { useDownloadStore, type DownloadedSong } from '../stores/downloadStore'
import { usePlayer } from '../stores/playerStore'
import type { MenuProps } from 'antd'

const { Title, Text } = Typography

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 生成显示名称：歌名 - 原作者名
function getDisplayName(title: string | undefined, originalArtists: string | undefined): string {
  if (originalArtists) {
    return `${title || 'Unknown'} - ${originalArtists}`
  }
  return title || 'Unknown'
}

export function Downloads() {
  const { t } = useI18n()
  const { downloads, deleteDownload, showInFolder } = useDownloadStore()
  const { playSong, state } = usePlayer()

  // 播放已下载的歌曲
  const handlePlay = (download: DownloadedSong) => {
    // 创建一个 Song 对象，使用本地文件路径
    const song = {
      id: download.id,
      title: download.title,
      // 使用 file:// 协议播放本地文件
      audioUrl: `file://${download.filePath}`,
      coverArtists: download.artists ? [{ name: download.artists }] : undefined,
      originalArtists: download.originalArtists ? [{ name: download.originalArtists }] : undefined,
      coverArt: download.coverPath ? { absolutePath: `file://${download.coverPath}` } : undefined,
    }
    playSong(song, [song], 0)
  }

  // 删除下载
  const handleDelete = async (songId: string) => {
    await deleteDownload(songId)
  }

  // 打开文件所在位置
  const handleShowInFolder = async (songId: string) => {
    await showInFolder(songId)
  }

  // 当前播放的歌曲
  const currentSongId = state.currentSong?.id

  return (
    <Flex vertical gap={24} style={{ padding: 24 }}>
      {/* 标题 */}
      <div>
        <Title level={3} style={{ marginBottom: 8 }}>
          {t('page.downloads')}
        </Title>
        <Text type="secondary">{t('downloads.subtitle')}</Text>
      </div>

      {/* 下载列表 */}
      {downloads.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('downloads.empty')}
          style={{ padding: 64 }}
        >
          <Button type="primary" href="#/search">
            {t('downloads.downloadNow')}
          </Button>
        </Empty>
      ) : (
        <Flex vertical gap={8}>
          {downloads.map((download) => (
            <DownloadSongItem
              key={download.id}
              download={download}
              isPlaying={currentSongId === download.id && state.isPlaying}
              onPlay={() => handlePlay(download)}
              onDelete={() => handleDelete(download.id)}
              onShowInFolder={() => handleShowInFolder(download.id)}
              deleteText={t('downloads.delete')}
              showInFolderText={t('downloads.showInFolder')}
            />
          ))}
        </Flex>
      )}
    </Flex>
  )
}

// 下载歌曲项组件（带更多操作）
function DownloadSongItem({
  download,
  isPlaying,
  onPlay,
  onDelete,
  onShowInFolder,
  deleteText,
  showInFolderText,
}: {
  download: DownloadedSong
  isPlaying: boolean
  onPlay: () => void
  onDelete: () => void
  onShowInFolder: () => void
  deleteText: string
  showInFolderText: string
}) {
  // 显示名称
  const displayName = getDisplayName(download.title, download.originalArtists)

  // 封面 URL（使用本地文件）
  const coverUrl = download.coverPath ? `file://${download.coverPath}` : undefined

  // 下拉菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: 'showInFolder',
      icon: <FolderOutlined />,
      label: showInFolderText,
      onClick: (e) => {
        e.domEvent.stopPropagation()
        onShowInFolder()
      },
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: deleteText,
      danger: true,
      onClick: (e) => {
        e.domEvent.stopPropagation()
        onDelete()
      },
    },
  ]

  return (
    <div
      onClick={onPlay}
      style={{
        backgroundColor: isPlaying ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255,255,255,0.03)',
        border: isPlaying ? '1px solid rgba(102, 126, 234, 0.5)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        cursor: 'pointer',
        padding: '12px 16px',
        transition: 'all 0.2s ease',
      }}
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
              alt={download.title || ''}
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
            {displayName}
          </Text>
          <Flex gap={8} align="center">
            {download.artists && (
              <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                {download.artists}
              </Text>
            )}
            <Text type="secondary" style={{ fontSize: 11 }}>
              {formatFileSize(download.fileSize)}
            </Text>
          </Flex>
        </Flex>

        {/* 更多操作按钮 */}
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'rgba(255,255,255,0.45)' }}
          />
        </Dropdown>
      </Flex>
    </div>
  )
}
