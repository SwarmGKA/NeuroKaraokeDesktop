import { useState, useEffect } from 'react'
import { Typography, Flex, Empty, Skeleton } from 'antd'
import { SearchOutlined, HistoryOutlined, PlayCircleOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons'
import { useHomeData, getThumbnailUrl, getCoverArtFromCache } from '../../stores/homeDataStore'
import { useI18n } from '../../i18n'
import type { SongListItem, Artist, CoverArt } from '../../types/api'

const { Text } = Typography

// Storage URL
const STORAGE_URL = 'https://storage.neurokaraoke.com'

// Cover art cache (songId -> coverArt)
const coverArtCache = new Map<string, CoverArt>()
const pendingFetches = new Set<string>()

// Get cover URL helper with lazy loading
function useSongCoverUrl(song: SongListItem): string | undefined {
  const [coverUrl, setCoverUrl] = useState<string | undefined>(() => {
    // Try existing cache
    const cached = getCoverArtFromCache(song.id) || coverArtCache.get(song.id || '')
    if (cached?.cloudflareId) {
      return getThumbnailUrl(cached.cloudflareId)
    }
    if (cached?.absolutePath) {
      const path = cached.absolutePath
      if (path.startsWith('http')) return path
      return `${STORAGE_URL}${path.startsWith('/') ? '' : '/'}${path}`
    }
    // Try song's own coverArt/thumbnailArt
    const cloudflareId = song.coverArt?.cloudflareId || song.thumbnailArt?.cloudflareId
    if (cloudflareId) {
      return getThumbnailUrl(cloudflareId)
    }
    return undefined
  })

  useEffect(() => {
    if (coverUrl || !song.id || pendingFetches.has(song.id)) return

    // Check if already cached
    const cached = getCoverArtFromCache(song.id) || coverArtCache.get(song.id)
    if (cached?.cloudflareId) {
      setCoverUrl(getThumbnailUrl(cached.cloudflareId))
      return
    }

    // Fetch song details for cover art
    pendingFetches.add(song.id)
    window.electronAPI.getSongDetails(song.id).then(details => {
      pendingFetches.delete(song.id)
      if (details?.coverArt) {
        coverArtCache.set(song.id!, details.coverArt)
        if (details.coverArt.cloudflareId) {
          setCoverUrl(getThumbnailUrl(details.coverArt.cloudflareId))
        } else if (details.coverArt.absolutePath) {
          const path = details.coverArt.absolutePath
          if (path.startsWith('http')) {
            setCoverUrl(path)
          } else {
            setCoverUrl(`${STORAGE_URL}${path.startsWith('/') ? '' : '/'}${path}`)
          }
        }
      }
    }).catch(() => {
      pendingFetches.delete(song.id)
    })
  }, [song.id, coverUrl])

  return coverUrl
}

interface SearchSuggestionsProps {
  query: string
  history: string[]
  isDark: boolean
  onSelectSuggestion: (suggestion: string) => void
  onRemoveHistory: (query: string) => void
  onPlaySongDirectly: (song: SongListItem, allSongs: SongListItem[]) => void
  onClose: () => void
}

// Skeleton item
function SkeletonItem() {
  return (
    <Flex align="center" gap={12} style={{ padding: '8px 16px' }}>
      <Skeleton.Avatar active size={40} shape="square" />
      <Flex vertical flex={1}>
        <Skeleton active paragraph={false} title={{ width: '60%' }} />
        <Skeleton active paragraph={false} title={{ width: '40%' }} />
      </Flex>
    </Flex>
  )
}

// Song suggestion item
function SongSuggestionItem({
  song,
  isDark,
  onPlay,
}: {
  song: SongListItem
  isDark: boolean
  onPlay: () => void
}) {
  const coverUrl = useSongCoverUrl(song)

  const artists = song.coverArtists?.join(', ') || song.originalArtists?.join(', ')

  return (
    <Flex
      align="center"
      gap={12}
      className="suggestion-item"
      onClick={onPlay}
      style={{
        padding: '8px 16px',
        cursor: 'pointer',
        borderRadius: 8,
        transition: 'background 0.2s',
      }}
    >
      {/* Cover */}
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

      {/* Info */}
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

      {/* Play icon hint */}
      <PlayCircleOutlined
        style={{ fontSize: 20, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
      />
    </Flex>
  )
}

// Artist suggestion item
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
      {/* Avatar */}
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

      {/* Name */}
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
            {artist.songCount} songs
          </Text>
        )}
      </Flex>
    </Flex>
  )
}

// History item
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
  onPlaySongDirectly,
  onClose: _onClose,
}: SearchSuggestionsProps) {
  const { t } = useI18n()
  const { artists } = useHomeData()
  const [loading, setLoading] = useState(false)
  const [songResults, setSongResults] = useState<SongListItem[]>([])
  const [artistResults, setArtistResults] = useState<Artist[]>([])

  // Search songs
  useEffect(() => {
    if (!query.trim()) {
      setSongResults([])
      setArtistResults([])
      return
    }

    // Set loading immediately
    setLoading(true)

    const searchSuggestions = async () => {
      try {
        // Search songs using POST API
        const songResponse = await window.electronAPI.searchSongs({
          search: query,
          page: 0,
          pageSize: 5,
        })
        setSongResults(songResponse?.items || [])

        // Search artists (local filter)
        const queryLower = query.toLowerCase()
        const searchTerms = queryLower.split(/\s+/).filter(Boolean)
        const filteredArtists = artists
          .filter(a => {
            const nameLower = a.name?.toLowerCase() || ''
            return searchTerms.some(term => nameLower.includes(term))
          })
          .slice(0, 5)
        setArtistResults(filteredArtists)
      } catch (error) {
        console.error('[SearchSuggestions] Search failed:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchSuggestions, 150)
    return () => {
      clearTimeout(timer)
      setLoading(false)
    }
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
        // Show skeleton
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
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </div>
      ) : showHistory ? (
        // Show history
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
        // Show search results
        <div>
          {/* Song results */}
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
                  onPlay={() => onPlaySongDirectly(song, songResults)}
                />
              ))}
            </div>
          )}

          {/* Artist results */}
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
        // No results
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('search.noResults')}
          style={{ padding: 24 }}
        />
      ) : null}

      {/* Bottom hint */}
      {(hasResults || showHistory) && !loading && (
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
