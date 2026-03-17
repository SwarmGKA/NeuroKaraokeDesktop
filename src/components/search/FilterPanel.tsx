import { useState } from 'react'
import { Typography, Flex, Slider, Collapse, Input, Checkbox } from 'antd'
import { SearchOutlined, CaretRightOutlined } from '@ant-design/icons'
import { useI18n } from '../../i18n'
import { useHomeData } from '../../stores/homeDataStore'

const { Text } = Typography

interface FilterPanelProps {
  isDark: boolean
  selectedArtists: string[]
  selectedGenres: string[]
  selectedMoods: string[]
  selectedThemes: string[]
  energyLevel: number | null
  musicalKey: string | null
  onArtistChange: (artists: string[]) => void
  onGenreChange: (genres: string[]) => void
  onMoodChange: (moods: string[]) => void
  onThemeChange: (themes: string[]) => void
  onEnergyChange: (energy: number | null) => void
  onKeyChange: (key: string | null) => void
}

// 音乐调性选项
const MUSICAL_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function FilterPanel({
  isDark,
  selectedArtists,
  selectedGenres,
  selectedMoods,
  selectedThemes,
  energyLevel,
  musicalKey,
  onArtistChange,
  onGenreChange,
  onMoodChange,
  onThemeChange,
  onEnergyChange,
  onKeyChange,
}: FilterPanelProps) {
  const { t } = useI18n()
  const { artists } = useHomeData()
  const [artistSearch, setArtistSearch] = useState('')

  // 过滤艺术家列表
  const filteredArtists = artistSearch.trim()
    ? artists.filter(a => a.name?.toLowerCase().includes(artistSearch.toLowerCase()))
    : artists

  // 清除所有筛选
  const clearAllFilters = () => {
    onArtistChange([])
    onGenreChange([])
    onMoodChange([])
    onThemeChange([])
    onEnergyChange(null)
    onKeyChange(null)
  }

  const hasFilters = selectedArtists.length > 0 ||
    selectedGenres.length > 0 ||
    selectedMoods.length > 0 ||
    selectedThemes.length > 0 ||
    energyLevel !== null ||
    musicalKey !== null

  const panelStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    border: 'none',
    marginBottom: 8,
  }

  return (
    <div
      style={{
        width: 280,
        height: '100%',
        overflow: 'auto',
        padding: '0 16px 16px 0',
      }}
    >
      {/* 标题和清除按钮 */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>{t('search.filters')}</Text>
        {hasFilters && (
          <Text
            type="secondary"
            style={{ fontSize: 12, cursor: 'pointer' }}
            onClick={clearAllFilters}
          >
            {t('search.clearFilters')}
          </Text>
        )}
      </Flex>

      <Collapse
        defaultActiveKey={['artists', 'energy']}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        style={{ background: 'transparent', border: 'none' }}
      >
        {/* 艺术家筛选 */}
        <Collapse.Panel
          header={<Text style={{ fontWeight: 500 }}>{t('search.artists')}</Text>}
          key="artists"
          style={panelStyle}
        >
          {/* 搜索艺术家 */}
          <Input
            placeholder={t('search.searchArtists')}
            prefix={<SearchOutlined />}
            value={artistSearch}
            onChange={(e) => setArtistSearch(e.target.value)}
            size="small"
            style={{ marginBottom: 12 }}
          />

          {/* 艺术家列表 */}
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {filteredArtists.slice(0, 20).map((artist) => (
              <Flex
                key={artist.id}
                align="center"
                gap={8}
                style={{ padding: '4px 0' }}
              >
                <Checkbox
                  checked={selectedArtists.includes(artist.id || '')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onArtistChange([...selectedArtists, artist.id || ''])
                    } else {
                      onArtistChange(selectedArtists.filter(id => id !== artist.id))
                    }
                  }}
                />
                <Text
                  ellipsis
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
                  }}
                >
                  {artist.name}
                </Text>
                {artist.songCount && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {artist.songCount}
                  </Text>
                )}
              </Flex>
            ))}
          </div>

          {filteredArtists.length > 20 && (
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
              {t('search.moreArtists', { count: filteredArtists.length - 20 })}
            </Text>
          )}
        </Collapse.Panel>

        {/* 能量值筛选 */}
        <Collapse.Panel
          header={<Text style={{ fontWeight: 500 }}>{t('search.energy')}</Text>}
          key="energy"
          style={panelStyle}
        >
          <Flex vertical gap={8}>
            <Slider
              min={1}
              max={10}
              value={energyLevel || 5}
              onChange={(value) => onEnergyChange(value)}
              tooltip={{ formatter: (v) => `${v}` }}
            />
            <Flex justify="space-between">
              <Text type="secondary" style={{ fontSize: 11 }}>{t('search.energyLow')}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{t('search.energyHigh')}</Text>
            </Flex>
          </Flex>
        </Collapse.Panel>

        {/* 调性筛选 */}
        <Collapse.Panel
          header={<Text style={{ fontWeight: 500 }}>{t('search.key')}</Text>}
          key="key"
          style={panelStyle}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}
          >
            {MUSICAL_KEYS.map((key) => (
              <div
                key={key}
                onClick={() => {
                  if (musicalKey === key) {
                    onKeyChange(null)
                  } else {
                    onKeyChange(key)
                  }
                }}
                style={{
                  textAlign: 'center',
                  padding: '6px 0',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  backgroundColor: musicalKey === key
                    ? '#667eea'
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  color: musicalKey === key
                    ? '#fff'
                    : isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
                  transition: 'all 0.2s',
                }}
              >
                {key}
              </div>
            ))}
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  )
}
