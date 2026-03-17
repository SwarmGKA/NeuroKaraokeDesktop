import { useState, useEffect, useCallback, useMemo } from 'react'
import { Typography, Flex, Tag, Card } from 'antd'
import { HistoryOutlined, CloseOutlined, FireOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useHomeData } from '../stores/homeDataStore'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { FilterPanel } from '../components/search/FilterPanel'
import { SongCardGrid } from '../components/search/SongCardGrid'
import { RelatedSidebar } from '../components/search/RelatedSidebar'
import type { SongListItem } from '../types/api'
import '../components/search/Search.css'

const { Title, Text } = Typography

// 热门搜索词
const HOT_SEARCHES_ZH = ['Neuro', 'Evil', 'Vedal', 'duet', 'cover', 'karaoke']
const HOT_SEARCHES_EN = ['Neuro', 'Evil', 'Vedal', 'duet', 'cover', 'karaoke']

// 推荐标签
const RECOMMEND_TAGS_ZH = [
  { name: '流行', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: '摇滚', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: '电子', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: '民谣', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: '说唱', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'R&B', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: '爵士', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: '古典', color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
]

const RECOMMEND_TAGS_EN = [
  { name: 'Pop', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Rock', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Electronic', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Folk', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Hip Hop', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'R&B', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: 'Jazz', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: 'Classical', color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
]

export function Search() {
  const { t, language } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const { artists } = useHomeData()
  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory()

  // 从 URL 获取搜索词
  const urlQuery = searchParams.get('q') || ''

  // 状态
  const [query, setQuery] = useState(urlQuery)
  const [results, setResults] = useState<SongListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // 筛选状态
  const [selectedArtists, setSelectedArtists] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [energyLevel, setEnergyLevel] = useState<number | null>(null)
  const [musicalKey, setMusicalKey] = useState<string | null>(null)

  const pageSize = 20
  const isDark = true // 简化处理，实际应从主题上下文获取

  const hotSearches = language === 'zh' ? HOT_SEARCHES_ZH : HOT_SEARCHES_EN
  const recommendTags = language === 'zh' ? RECOMMEND_TAGS_ZH : RECOMMEND_TAGS_EN

  // 相关艺术家（基于搜索结果）
  const relatedArtists = useMemo(() => {
    if (results.length === 0) return []
    // 返回随机几个艺术家
    return artists.slice(0, 5)
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
        genreIds: selectedGenres.length > 0 ? selectedGenres : undefined,
        moodIds: selectedMoods.length > 0 ? selectedMoods : undefined,
        themeIds: selectedThemes.length > 0 ? selectedThemes : undefined,
        energyLevel: energyLevel || undefined,
        key: musicalKey || undefined,
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
  }, [selectedArtists, selectedGenres, selectedMoods, selectedThemes, energyLevel, musicalKey])

  // 初始加载和查询变化时搜索
  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery)
      addHistory(urlQuery)
      searchSongs(urlQuery, 0, true)
    }
  }, [urlQuery])

  // 筛选变化时重新搜索
  useEffect(() => {
    if (query || selectedArtists.length > 0) {
      searchSongs(query, 0, true)
    }
  }, [selectedArtists, selectedGenres, selectedMoods, selectedThemes, energyLevel, musicalKey])

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      searchSongs(query, page + 1, false)
    }
  }, [loading, hasMore, query, page, searchSongs])

  // 点击热门搜索
  const handleHotSearchClick = (keyword: string) => {
    setQuery(keyword)
    addHistory(keyword)
    setSearchParams({ q: keyword })
  }

  // 点击历史记录
  const handleHistoryClick = (keyword: string) => {
    setQuery(keyword)
    setSearchParams({ q: keyword })
  }

  // 点击推荐标签
  const handleTagClick = (tagName: string) => {
    setQuery(tagName)
    addHistory(tagName)
    setSearchParams({ q: tagName })
  }

  // 渲染默认状态（无搜索词）
  const renderDefaultState = () => (
    <div style={{ padding: 24 }}>
      {/* 热门搜索 */}
      <div className="default-hot-searches">
        <div className="default-hot-searches-title">
          <FireOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          {t('search.hotSearches')}
        </div>
        <Flex wrap="wrap" gap={8}>
          {hotSearches.map((keyword) => (
            <Tag
              key={keyword}
              className="hot-search-tag"
              style={{
                cursor: 'pointer',
                borderRadius: 16,
                padding: '4px 12px',
                margin: 0,
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
        <div className="default-search-history">
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

          {history.map((item, index) => (
            <Flex
              key={`${item}-${index}`}
              align="center"
              justify="space-between"
              className="default-search-history-item"
              onClick={() => handleHistoryClick(item)}
            >
              <Text>{item}</Text>
              <CloseOutlined
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}
                onClick={(e) => {
                  e.stopPropagation()
                  removeHistory(item)
                }}
              />
            </Flex>
          ))}
        </div>
      )}

      {/* 推荐标签 */}
      <div className="default-recommend-tags">
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
          {t('search.recommendTags')}
        </Text>
        <div className="default-recommend-tags-grid">
          {recommendTags.map((tag) => (
            <Card
              key={tag.name}
              className="recommend-tag-card"
              style={{
                background: tag.color,
                border: 'none',
              }}
              styles={{ body: { padding: 16 } }}
              onClick={() => handleTagClick(tag.name)}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                {tag.name}
              </Text>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  // 渲染搜索结果
  const renderSearchResults = () => (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* 左侧筛选面板 */}
      <FilterPanel
        isDark={isDark}
        selectedArtists={selectedArtists}
        selectedGenres={selectedGenres}
        selectedMoods={selectedMoods}
        selectedThemes={selectedThemes}
        energyLevel={energyLevel}
        musicalKey={musicalKey}
        onArtistChange={setSelectedArtists}
        onGenreChange={setSelectedGenres}
        onMoodChange={setSelectedMoods}
        onThemeChange={setSelectedThemes}
        onEnergyChange={setEnergyLevel}
        onKeyChange={setMusicalKey}
      />

      {/* 中间结果区 */}
      <div style={{ flex: 1, padding: '0 24px', overflow: 'auto' }}>
        {/* 结果标题 */}
        <div className="search-results-header">
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
            {t('search.resultsFor', { query, count: totalCount })}
          </Text>
        </div>

        {/* 歌曲网格 */}
        <SongCardGrid
          songs={results}
          loading={loading && page === 0}
          hasMore={hasMore}
          isDark={isDark}
          onLoadMore={handleLoadMore}
        />
      </div>

      {/* 右侧相关内容 */}
      <RelatedSidebar
        isDark={isDark}
        relatedArtists={relatedArtists}
        trendingTags={hotSearches}
        onArtistClick={(id) => {
          setSelectedArtists([id])
        }}
        onTagClick={handleTagClick}
      />
    </div>
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 页面标题 */}
      <div style={{ padding: '24px 24px 0' }}>
        <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
          {t('page.search')}
        </Title>
        <Text type="secondary">{t('search.subtitle')}</Text>
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'hidden', marginTop: 24 }}>
        {query || selectedArtists.length > 0 ? renderSearchResults() : renderDefaultState()}
      </div>
    </div>
  )
}
