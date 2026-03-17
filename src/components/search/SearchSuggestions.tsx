import { useState, useEffect } from 'react'
import { Typography, Flex, Spin, Empty } from 'antd'
import { SearchOutlined, HistoryOutlined, PlayCircleOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons'
import { useHomeData, getThumbnailUrl } from '../../stores/homeDataStore'
import { useI18n } from '../../i18n'
import type { SongListItem, Artist } from '../../types/api'

const { Text } = Typography

interface SearchSuggestionsProps {
  query: string
  history: string[]
  isDark: boolean
  onSelectSuggestion: (suggestion: string) => void
  onRemoveHistory: (query: string) => void
  onPlaySong: () => void
  onClose: () => void
}

// 歌曲搜索建议项
function SongSuggestionItem({
  song,
  isDark,
  onClick,
  onPlay,
}: {
  song: SongListItem
  isDark: boolean
  onClick: () => void
  onPlay: () => void
}) {
  const coverUrl = song.coverArt?.cloudflareId
    ? getThumbnailUrl(song.coverArt.cloudflareId)
    : undefined

  const artists = song.coverArtists?.join(', ') || song.originalArtists?.join(', ')

  return (
    <Flex
      align="center"
      gap={12}
      className="suggestion-item"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        cursor: 'pointer',
        borderRadius: 8,
        transition: 'background 0.2s',
      }}
    >
      {/* 封面 */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 6,
          overflow: 'hidden',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={song.title || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Text style={{ color: '#fff', fontSize: 16 }}>♪</Text>
        )}
      </div>

      {/* 信息 */}
      <Flex vertical flex={1} style={{ minWidth: 0 }}>
        <Text
          ellipsis
          style={{
            fontSize: 14,
            color: isDark ? '#fff' : '#1a1a1a',
          }}
        >
          {song.title}
        </Text>
        {artists && (
          <Text
            ellipsis
            type="secondary"
            style={{ fontSize: 12 }}
          >
            {artists}
          </Text>
        )}
      </Flex>

      {/* 播放按钮 */}
      <PlayCircleOutlined
        onClick={(e) => {
          e.stopPropagation()
          onPlay()
        }}
        style={{ fontSize: 20, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
      />
    </Flex>
  )
}

// 艺术家建议项
function ArtistSuggestionItem({
  artist,
  isDark,
  onClick,
}: {
  artist: Artist
  isDark: boolean
  onClick: () => void
}) {
  const imageUrl = artist.imagePath
    ? getThumbnailUrl(artist.imagePath)
    : undefined

  return (
    <Flex
      align="center"
      gap={12}
      className="suggestion-item"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        cursor: 'pointer',
        borderRadius: 8,
        transition: 'background 0.2s',
      }}
    >
      {/* 头像 */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={artist.name || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <UserOutlined style={{ color: '#fff', fontSize: 16 }} />
        )}
      </div>

      {/* 名称 */}
      <Flex vertical flex={1} style={{ minWidth: 0 }}>
        <Text
          ellipsis
          style={{
            fontSize: 14,
            color: isDark ? '#fff' : '#1a1a1a',
          }}
        >
          {artist.name}
        </Text>
        {artist.songCount && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {artist.songCount} 首歌曲
          </Text>
        )}
      </Flex>
    </Flex>
  )
}

// 历史记录项
function HistoryItem({
  query,
  isDark,
  onClick,
  onRemove,
}: {
  query: string
  isDark: boolean
  onClick: () => void
  onRemove: () => void
}) {
  return (
    <Flex
      align="center"
      gap={12}
      className="suggestion-item"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        cursor: 'pointer',
        borderRadius: 8,
        transition: 'background 0.2s',
      }}
    >
      <HistoryOutlined style={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }} />
      <Text
        ellipsis
        style={{ flex: 1, fontSize: 14, color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}
      >
        {query}
      </Text>
      <CloseOutlined
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
      />
    </Flex>
  )
}

export function SearchSuggestions({
  query,
  history,
  isDark,
  onSelectSuggestion,
  onRemoveHistory,
  onPlaySong,
  onClose: _onClose,
}: SearchSuggestionsProps) {
  const { t } = useI18n()
  const { artists } = useHomeData()
  const [loading, setLoading] = useState(false)
  const [songResults, setSongResults] = useState<SongListItem[]>([])
  const [artistResults, setArtistResults] = useState<Artist[]>([])

  // 搜索歌曲
  useEffect(() => {
    if (!query.trim()) {
      setSongResults([])
      setArtistResults([])
      return
    }

    const searchSuggestions = async () => {
      setLoading(true)
      try {
        // 搜索歌曲
        const songResponse = await window.electronAPI.searchSongs({
          search: query,
          page: 0,
          pageSize: 5,
        })
        setSongResults(songResponse?.items || [])

        // 搜索艺术家（本地过滤）
        const queryLower = query.toLowerCase()
        const filteredArtists = artists
          .filter(a => a.name?.toLowerCase().includes(queryLower))
          .slice(0, 5)
        setArtistResults(filteredArtists)
      } catch (error) {
        console.error('搜索建议失败:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchSuggestions, 150)
    return () => clearTimeout(timer)
  }, [query, artists])

  const hasResults = songResults.length > 0 || artistResults.length > 0
  const showHistory = !query.trim() && history.length > 0

  return (
    <div
      className="search-suggestions"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 8,
        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: 12,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(0,0,0,0.12)',
        maxHeight: 400,
        overflow: 'auto',
        zIndex: 1000,
      }}
    >
      {loading ? (
        <Flex justify="center" align="center" style={{ padding: 32 }}>
          <Spin />
        </Flex>
      ) : showHistory ? (
        // 显示搜索历史
        <div>
          <Text
            type="secondary"
            style={{
              display: 'block',
              padding: '12px 16px 8px',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {t('search.history')}
          </Text>
          {history.map((item, index) => (
            <HistoryItem
              key={`${item}-${index}`}
              query={item}
              isDark={isDark}
              onClick={() => onSelectSuggestion(item)}
              onRemove={() => onRemoveHistory(item)}
            />
          ))}
        </div>
      ) : hasResults ? (
        // 显示搜索结果
        <div>
          {/* 歌曲结果 */}
          {songResults.length > 0 && (
            <div>
              <Text
                type="secondary"
                style={{
                  display: 'block',
                  padding: '12px 16px 8px',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {t('search.songs')}
              </Text>
              {songResults.map((song) => (
                <SongSuggestionItem
                  key={song.id}
                  song={song}
                  isDark={isDark}
                  onClick={() => onSelectSuggestion(song.title || '')}
                  onPlay={onPlaySong}
                />
              ))}
            </div>
          )}

          {/* 艺术家结果 */}
          {artistResults.length > 0 && (
            <div>
              <Text
                type="secondary"
                style={{
                  display: 'block',
                  padding: songResults.length > 0 ? '16px 16px 8px' : '12px 16px 8px',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {t('search.artists')}
              </Text>
              {artistResults.map((artist) => (
                <ArtistSuggestionItem
                  key={artist.id}
                  artist={artist}
                  isDark={isDark}
                  onClick={() => onSelectSuggestion(artist.name || '')}
                />
              ))}
            </div>
          )}
        </div>
      ) : query.trim() ? (
        // 无结果
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('search.noResults')}
          style={{ padding: 24 }}
        />
      ) : null}

      {/* 底部提示 */}
      {(hasResults || showHistory) && (
        <Flex
          justify="center"
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            <SearchOutlined style={{ marginRight: 4 }} />
            {t('search.pressEnter')}
          </Text>
        </Flex>
      )}
    </div>
  )
}
