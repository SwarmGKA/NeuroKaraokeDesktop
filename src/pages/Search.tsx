import { useState, useEffect, useCallback, useMemo } from 'react'
import { Typography, Flex, Tag, Select, Skeleton, Empty, Button, Card } from 'antd'
import { HistoryOutlined, FireOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useI18n } from '../i18n'
import { useHomeData, getThumbnailUrl } from '../stores/homeDataStore'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { useSearchState } from '../stores/searchStore'
import { usePlayer } from '../stores/playerStore'
import type { SongListItem, Song, CoverArt } from '../types/api'
import '../components/search/Search.css'

const { Title, Text } = Typography

// 存储服务 URL
const STORAGE_URL = 'https://storage.neurokaraoke.com'

// 获取封面 URL 的辅助函数
function getSongCoverUrl(coverArt: CoverArt | undefined, thumbnailArt: CoverArt | undefined): string | undefined {
  // 优先使用 cloudflareId
  const cloudflareId = coverArt?.cloudflareId || thumbnailArt?.cloudflareId
  if (cloudflareId) {
    return getThumbnailUrl(cloudflareId)
  }

  // 尝试使用 absolutePath
  const absolutePath = coverArt?.absolutePath || thumbnailArt?.absolutePath
  if (absolutePath) {
    if (absolutePath.startsWith('http')) {
      return absolutePath
    }
    return `${STORAGE_URL}${absolutePath.startsWith('/') ? '' : '/'}${absolutePath}`
  }

  return undefined
}

// 热门搜索词
const HOT_SEARCHES_ZH = ['Neuro', 'Evil', 'Vedal', 'duet', 'cover', 'karaoke']
const HOT_SEARCHES_EN = ['Neuro', 'Evil', 'Vedal', 'duet', 'cover', 'karaoke']

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

// 横向歌曲卡片组件（参考 TrendingSongCard 样式）
function SongCard({
  song,
  onPlay,
}: {
  song: SongListItem
  onPlay: () => void
}) {
  const { t } = useI18n()
  // 使用辅助函数获取封面 URL
  const coverUrl = getSongCoverUrl(song.coverArt, song.thumbnailArt)

  const artists = song.coverArtists?.join(', ') || song.originalArtists?.join(', ') || t('song.unknownArtist')

  return (
    <Card
      hoverable
      onClick={onPlay}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
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
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 20 }}>♪</Text>
            </div>
          )}
          {/* 悬浮播放图标 */}
          <div
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
            className="play-overlay"
          >
            <PlayCircleOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
        </div>

        {/* 信息 */}
        <Flex vertical flex={1} style={{ minWidth: 0 }}>
          <Text
            ellipsis
            style={{ fontWeight: 500, fontSize: 14 }}
          >
            {song.title || t('song.defaultTitle')}
          </Text>
          <Text
            ellipsis
            type="secondary"
            style={{ fontSize: 12, marginTop: 2 }}
          >
            {artists}
          </Text>
        </Flex>
      </Flex>
    </Card>
  )
}

// 骨架卡片
function SkeletonCard() {
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

export function Search() {
  const { t, language } = useI18n()
  const { artists } = useHomeData()
  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory()
  const { searchState, performSearch, resetSearch } = useSearchState()
  const { playSong } = usePlayer()

  // 状态
  const [results, setResults] = useState<SongListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // 筛选状态（仅保留艺术家筛选）
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])

  const pageSize = 20

  const hotSearches = language === 'zh' ? HOT_SEARCHES_ZH : HOT_SEARCHES_EN

  // 当前搜索词
  const query = searchState.query

  // 组件卸载时重置搜索状态
  useEffect(() => {
    return () => {
      resetSearch()
    }
  }, [resetSearch])

  // 搜索歌曲
  const searchSongs = useCallback(async (
    searchQuery: string,
    pageNum: number,
    reset: boolean = false
  ) => {
    if (!searchQuery.trim() && selectedArtists.length === 0) {
      if (reset) {
        setResults([])
        setTotalCount(0)
        setHasMore(false)
      }
      return
    }

    setLoading(true)
    try {
      const response = await window.electronAPI.searchSongs({
        search: searchQuery || undefined,
        page: pageNum,
        pageSize,
        artistIds: selectedArtists.length > 0 ? selectedArtists : undefined,
      })

      if (response) {
        const newItems = response.items || []
        setResults(prev => reset ? newItems : [...prev, ...newItems])
        setTotalCount(response.totalCount || 0)
        setHasMore(newItems.length === pageSize)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('[Search] Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedArtists])

  // 搜索状态变化时触发搜索
  useEffect(() => {
    if (query && searchState.timestamp > 0) {
      addHistory(query)
      searchSongs(query, 0, true)
    }
  }, [searchState.timestamp])

  // 筛选变化时重新搜索
  useEffect(() => {
    if (query || selectedArtists.length > 0) {
      searchSongs(query, 0, true)
    }
  }, [selectedArtists])

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      searchSongs(query, page + 1, false)
    }
  }, [loading, hasMore, query, page, searchSongs])

  // 点击热门搜索
  const handleHotSearchClick = (keyword: string) => {
    addHistory(keyword)
    performSearch(keyword)
  }

  // 点击历史记录
  const handleHistoryClick = (keyword: string) => {
    performSearch(keyword)
  }

  // 播放歌曲
  const handlePlay = (song: SongListItem, index: number) => {
    const allSongs = results.map(s => songListItemToSong(s))
    const currentSong = songListItemToSong(song)
    playSong(currentSong, allSongs, index)
  }

  // 清除筛选
  const clearFilters = () => {
    setSelectedArtists([])
  }

  const hasFilters = selectedArtists.length > 0

  // 艺术家下拉选项
  const artistOptions = useMemo(() => {
    return artists
      .filter(a => a.name)
      .sort((a, b) => (b.songCount || 0) - (a.songCount || 0))
      .slice(0, 50)
      .map(a => ({
        label: `${a.name} (${a.songCount || 0})`,
        value: a.id || '',
      }))
  }, [artists])

  // 渲染默认状态（无搜索词）- 平实质朴的现代化设计
  const renderDefaultState = () => (
    <div style={{ padding: 24 }}>
      {/* 热门搜索 */}
      <div style={{ marginBottom: 32 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
          <FireOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          {t('search.hotSearches')}
        </Text>
        <Flex wrap="wrap" gap={8}>
          {hotSearches.map((keyword) => (
            <Tag
              key={keyword}
              style={{
                cursor: 'pointer',
                borderRadius: 4,
                padding: '4px 12px',
                margin: 0,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.85)',
              }}
              onClick={() => handleHotSearchClick(keyword)}
            >
              {keyword}
            </Tag>
          ))}
        </Flex>
      </div>

      {/* 搜索历史 */}
      {history.length > 0 && (
        <div>
          <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 16 }}>
              <HistoryOutlined style={{ marginRight: 8 }} />
              {t('search.history')}
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: 12, cursor: 'pointer' }}
              onClick={clearHistory}
            >
              {t('search.clearHistory')}
            </Text>
          </Flex>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {history.map((item, index) => (
              <Flex
                key={`${item}-${index}`}
                justify="space-between"
                align="center"
                style={{
                  padding: '12px 0',
                  borderBottom: index < history.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <Text
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleHistoryClick(item)}
                >
                  {item}
                </Text>
                <Text
                  type="secondary"
                  style={{ cursor: 'pointer', fontSize: 16 }}
                  onClick={() => removeHistory(item)}
                >
                  ×
                </Text>
              </Flex>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // 渲染搜索结果
  const renderSearchResults = () => (
    <div style={{ padding: 24 }}>
      {/* 顶部标题和结果数量 */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Flex align="center" gap={16}>
          <Title level={4} style={{ margin: 0 }}>
            {query ? `"${query}" 的搜索结果` : '全部歌曲'}
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            共 {totalCount} 首
          </Text>
        </Flex>
        {hasFilters && (
          <Text
            type="secondary"
            style={{ fontSize: 12, cursor: 'pointer' }}
            onClick={clearFilters}
          >
            清除筛选
          </Text>
        )}
      </Flex>

      {/* 横向筛选栏 */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* 艺术家多选下拉 */}
        <Select
          mode="multiple"
          placeholder="选择艺术家"
          value={selectedArtists}
          onChange={setSelectedArtists}
          options={artistOptions}
          style={{ minWidth: 200 }}
          maxTagCount={2}
          maxTagPlaceholder={(omitted) => `+${omitted.length}`}
          allowClear
        />
      </div>

      {/* 歌曲列表（横向卡片样式） */}
      {results.length === 0 && !loading ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('search.noSongsFound')}
          style={{ padding: 64 }}
        />
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {results.map((song, index) => (
              <SongCard
                key={song.id || `${song.title}-${index}`}
                song={song}
                onPlay={() => handlePlay(song, index)}
              />
            ))}
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
          </div>

          {/* 加载更多 */}
          {hasMore && !loading && (
            <Flex justify="center" style={{ padding: 24 }}>
              <Button onClick={handleLoadMore}>加载更多</Button>
            </Flex>
          )}
        </>
      )}
    </div>
  )

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#1a1a1a',
      }}
    >
      {/* 页面标题 */}
      <div
        style={{
          padding: '24px 24px 0',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 0,
        }}
      >
        <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
          {t('page.search')}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {t('search.subtitle')}
        </Text>
      </div>

      {/* 内容区域 */}
      <div style={{ minHeight: 'calc(100% - 80px)' }}>
        {query || selectedArtists.length > 0 ? renderSearchResults() : renderDefaultState()}
      </div>

      {/* 悬浮样式 */}
      <style>{`
        .play-overlay {
          opacity: 0;
        }
        .ant-card:hover .play-overlay {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
