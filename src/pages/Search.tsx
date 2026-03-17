import { useState, useEffect, useCallback, useMemo } from 'react'
import { Typography, Flex, Tag, Select, Slider, Popover, Button, Skeleton, Empty } from 'antd'
import { HistoryOutlined, FireOutlined, DownOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useI18n } from '../i18n'
import { useHomeData, getThumbnailUrl } from '../stores/homeDataStore'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { useSearchState } from '../stores/searchStore'
import { usePlayer } from '../stores/playerStore'
import type { SongListItem, Song } from '../types/api'
import '../components/search/Search.css'

const { Title, Text } = Typography

// 音乐调性选项
const MUSICAL_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// 热门搜索词
const HOT_SEARCHES_ZH = ['Neuro', 'Evil', 'Vedal', 'duet', 'cover', 'karaoke']
const HOT_SEARCHES_EN = ['Neuro', 'Evil', 'Vedal', 'duet', 'cover', 'karaoke']

// 推荐标签
const RECOMMEND_TAGS_ZH = ['流行', '摇滚', '电子', '民谣', '说唱', 'R&B', '爵士', '古典']
const RECOMMEND_TAGS_EN = ['Pop', 'Rock', 'Electronic', 'Folk', 'Hip Hop', 'R&B', 'Jazz', 'Classical']

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

// 歌曲卡片组件
function SongCard({
  song,
  isDark,
  onPlay,
}: {
  song: SongListItem
  isDark: boolean
  onPlay: () => void
}) {
  const coverUrl = song.coverArt?.cloudflareId
    ? getThumbnailUrl(song.coverArt.cloudflareId)
    : undefined

  const artists = song.coverArtists?.join(', ') || song.originalArtists?.join(', ')
  const isHot = (song.playCount || 0) > 10000

  return (
    <div
      className="song-card-wrapper"
      onClick={onPlay}
      style={{
        cursor: 'pointer',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      {/* 正方形封面 */}
      <div
        style={{
          width: '100%',
          paddingBottom: '100%',
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
            热门
          </Tag>
        )}

        {/* 悬浮播放按钮 */}
        <div
          className="song-card-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
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
          {artists || '未知艺术家'}
        </Text>
      </div>

      <style>{`
        .song-card-wrapper:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .song-card-wrapper:hover .song-card-overlay {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

// 骨架卡片
function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Skeleton.Image
        active
        style={{
          width: '100%',
          height: 0,
          paddingBottom: '100%',
          borderRadius: 0,
        }}
      />
      <div style={{ padding: 12 }}>
        <Skeleton active paragraph={false} title={{ width: '80%' }} />
        <Skeleton active paragraph={false} title={{ width: '60%' }} style={{ marginTop: 8 }} />
      </div>
    </div>
  )
}

export function Search() {
  const { t, language } = useI18n()
  const { artists } = useHomeData()
  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory()
  const { searchState, performSearch } = useSearchState()
  const { playSong } = usePlayer()

  // 状态
  const [results, setResults] = useState<SongListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // 筛选状态
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [energyLevel, setEnergyLevel] = useState<number | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  const pageSize = 20
  const isDark = true

  const hotSearches = language === 'zh' ? HOT_SEARCHES_ZH : HOT_SEARCHES_EN
  const recommendTags = language === 'zh' ? RECOMMEND_TAGS_ZH : RECOMMEND_TAGS_EN

  // 当前搜索词
  const query = searchState.query

  // 相关艺术家
  const relatedArtists = useMemo(() => {
    if (results.length === 0) return artists.slice(0, 8)
    // 基于搜索结果提取相关艺术家
    const artistNames = new Set<string>()
    results.forEach(song => {
      song.coverArtists?.forEach(a => artistNames.add(a))
      song.originalArtists?.forEach(a => artistNames.add(a))
    })
    return artists.filter(a => artistNames.has(a.name || '')).slice(0, 8)
  }, [results, artists])

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
        energyLevel: energyLevel || undefined,
        key: selectedKey || undefined,
      })

      if (response) {
        const newItems = response.items || []
        setResults(prev => reset ? newItems : [...prev, ...newItems])
        setTotalCount(response.totalCount || 0)
        setHasMore(newItems.length === pageSize)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedArtists, energyLevel, selectedKey])

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
  }, [selectedArtists, energyLevel, selectedKey])

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

  // 点击标签搜索
  const handleTagClick = (tagName: string) => {
    addHistory(tagName)
    performSearch(tagName)
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
    setEnergyLevel(null)
    setSelectedKey(null)
  }

  const hasFilters = selectedArtists.length > 0 || energyLevel !== null || selectedKey !== null

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

  // 渲染默认状态（无搜索词）
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
                borderRadius: 16,
                padding: '4px 12px',
                margin: 0,
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
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
        <div style={{ marginBottom: 32 }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
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
          <Flex wrap="wrap" gap={8}>
            {history.map((item, index) => (
              <Tag
                key={`${item}-${index}`}
                closable
                onClose={(e) => {
                  e.preventDefault()
                  removeHistory(item)
                }}
                onClick={() => handleHistoryClick(item)}
                style={{
                  cursor: 'pointer',
                  borderRadius: 16,
                  padding: '4px 12px',
                  margin: 0,
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                }}
              >
                {item}
              </Tag>
            ))}
          </Flex>
        </div>
      )}

      {/* 推荐标签 */}
      <div>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
          {t('search.recommendTags')}
        </Text>
        <Flex wrap="wrap" gap={12}>
          {recommendTags.map((tag) => (
            <div
              key={tag}
              onClick={() => handleTagClick(tag)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 500 }}>{tag}</Text>
            </div>
          ))}
        </Flex>
      </div>
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

        {/* 能量值筛选 */}
        <Popover
          content={
            <div style={{ width: 200 }}>
              <Slider
                min={1}
                max={10}
                value={energyLevel || 5}
                onChange={setEnergyLevel}
                tooltip={{ formatter: (v) => `能量值: ${v}` }}
              />
              <Flex justify="space-between" style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>低</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>高</Text>
              </Flex>
            </div>
          }
          title="能量值"
          trigger="click"
        >
          <Button>
            能量值 {energyLevel ? `: ${energyLevel}` : ''}
          </Button>
        </Popover>

        {/* 调性选择器 */}
        <Select
          placeholder="调性"
          value={selectedKey}
          onChange={setSelectedKey}
          allowClear
          style={{ width: 100 }}
        >
          {MUSICAL_KEYS.map(key => (
            <Select.Option key={key} value={key}>{key}</Select.Option>
          ))}
        </Select>

        {/* 展开更多筛选 */}
        <Button
          type="text"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          icon={<DownOutlined style={{ transform: showMoreFilters ? 'rotate(180deg)' : 'none' }} />}
        >
          更多筛选
        </Button>
      </div>

      {/* 更多筛选条件（可展开） */}
      {showMoreFilters && (
        <div
          style={{
            padding: 16,
            marginBottom: 24,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 12, display: 'block' }}>
            标签筛选
          </Text>
          <Flex wrap="wrap" gap={8}>
            {recommendTags.map((tag) => (
              <Tag
                key={tag}
                style={{
                  cursor: 'pointer',
                  borderRadius: 4,
                  margin: 0,
                }}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Tag>
            ))}
          </Flex>
        </div>
      )}

      {/* 歌曲网格 */}
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
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
          >
            {results.map((song, index) => (
              <SongCard
                key={song.id || `${song.title}-${index}`}
                song={song}
                
                isDark={isDark}
                onPlay={() => handlePlay(song, index)}
              />
            ))}
            {loading && Array.from({ length: 8 }).map((_, i) => (
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

      {/* 底部推荐区域 - 相关艺术家 */}
      {relatedArtists.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
            相关艺术家
          </Text>
          <div
            style={{
              display: 'flex',
              gap: 16,
              overflowX: 'auto',
              paddingBottom: 8,
            }}
          >
            {relatedArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => {
                  if (artist.id) {
                    setSelectedArtists([artist.id])
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 80,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  {artist.imagePath ? (
                    <img
                      src={getThumbnailUrl(artist.imagePath)}
                      alt={artist.name || ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 20 }}>
                      {artist.name?.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </div>
                <Text
                  ellipsis
                  style={{
                    fontSize: 12,
                    textAlign: 'center',
                    maxWidth: 80,
                  }}
                >
                  {artist.name}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部推荐区域 - 热门标签 */}
      <div style={{ marginTop: 32 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
          热门标签
        </Text>
        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          {recommendTags.map((tag) => (
            <div
              key={tag}
              onClick={() => handleTagClick(tag)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s',
              }}
            >
              <Text>{tag}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
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
    </div>
  )
}
