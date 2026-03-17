import { useState, useRef, useEffect } from 'react'
import { Input, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useI18n } from '../../i18n'
import { useSearchHistory } from '../../hooks/useSearchHistory'
import { useSearchState } from '../../stores/searchStore'
import { SearchSuggestions } from './SearchSuggestions'
import './Search.css'

const { Text } = Typography

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

  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // 快捷键 Ctrl+K 聚焦搜索框
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

  // 点击外部关闭建议浮层
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

  const handlePlaySong = () => {
    setShowSuggestions(false)
  }

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
          onPlaySong={handlePlaySong}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  )
}
