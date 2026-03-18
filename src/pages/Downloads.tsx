import { Flex, Typography, Empty, Button } from 'antd'
import { useI18n } from '../i18n'
import { useDownloadStore, type DownloadedSong } from '../stores/downloadStore'
import { usePlayer } from '../stores/playerStore'
import { SongItem } from '../components/SongItem'

const { Title, Text } = Typography

export function Downloads() {
  const { t } = useI18n()
  const { downloads, isLoading, deleteDownload } = useDownloadStore()
  const { playSong, state } = usePlayer()

  // 播放已下载的歌曲
  const handlePlay = (download: DownloadedSong) => {
    // 创建一个简单的 Song 对象
    const song = {
      id: download.id,
      title: download.title,
      audioUrl: `file://${download.filePath}`,
    }
    playSong(song, [song], 0)
  }

  // 删除下载
  const handleDelete = async (songId: string) => {
    await deleteDownload(songId)
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
      {isLoading ? (
        <Text type="secondary">{t('app.loading')}</Text>
      ) : downloads.length === 0 ? (
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
            <SongItem
              key={download.id}
              song={download}
              onPlay={() => handlePlay(download)}
              isPlaying={currentSongId === download.id && state.isPlaying}
              showDownload={false}
              showDelete={true}
              onDelete={() => handleDelete(download.id)}
            />
          ))}
        </Flex>
      )}
    </Flex>
  )
}
