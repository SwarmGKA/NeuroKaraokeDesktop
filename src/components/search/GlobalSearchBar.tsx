import { useState, useRef, useEffect, useCallback } from 'react'
import { Input, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useI18n } from '../../i18n'
import { useSearchHistory } from '../../hooks/useSearchHistory'
import { useSearchState } from '../../stores/searchStore'
import { usePlayer } from '../../stores/playerStore'
import { SearchSuggestions } from './SearchSuggestions'
import type { SongListItem, Song } from '../../types/api'
import './Search.css'

const { Text } = Typography

// Convert SongListItem to Song format
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

interface GlobalSearchBarProps {
  isDark: boolean
  onNavigateToSearch: () => void
}

export function GlobalSearchBar({ isDark, onNavigateToSearch }: GlobalSearchBarProps) {
  const { t } = useI18n()
  const inputRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { history, addHistory, removeHistory } = useSearchHistory()
  const { performSearch } = useSearchState()
  const { playSong } = usePlayer()

  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Keyboard shortcut Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowSuggestions(true)
  }

  const handleFocus = () => {
    setShowSuggestions(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      addHistory(query.trim())
      performSearch(query.trim())
      setShowSuggestions(false)
      inputRef.current?.blur()
      onNavigateToSearch()
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion)
    addHistory(suggestion)
    performSearch(suggestion)
    setShowSuggestions(false)
    onNavigateToSearch()
  }

  // Play song directly when clicked in suggestions
  const handlePlaySongDirectly = useCallback((song: SongListItem, allSongs: SongListItem[]) => {
    const songs = allSongs.map(s => songListItemToSong(s))
    const currentSong = songListItemToSong(song)
    const index = allSongs.findIndex(s => s.id === song.id)
    playSong(currentSong, songs, index >= 0 ? index : 0)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }, [playSong])

  return (
    <div ref={containerRef} className="global-search-container">
      <form onSubmit={handleSubmit} className="global-search-form">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={t('home.searchPlaceholder')}
          prefix={<SearchOutlined style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }} />}
          className="global-search-input"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
          }}
        />
        <Text className="global-search-shortcut">
          Ctrl+K
        </Text>
      </form>

      {showSuggestions && (
        <SearchSuggestions
          query={query}
          history={history}
          isDark={isDark}
          onSelectSuggestion={handleSelectSuggestion}
          onRemoveHistory={removeHistory}
          onPlaySongDirectly={handlePlaySongDirectly}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  )
}
