import { Typography, Flex, Avatar, Tag } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useI18n } from '../../i18n'
import { getThumbnailUrl } from '../../stores/homeDataStore'
import type { Artist } from '../../types/api'

const { Text } = Typography

interface RelatedSidebarProps {
  isDark: boolean
  relatedArtists: Artist[]
  trendingTags: string[]
  onArtistClick: (artistId: string) => void
  onTagClick: (tag: string) => void
}

export function RelatedSidebar({
  isDark,
  relatedArtists,
  trendingTags,
  onArtistClick,
  onTagClick,
}: RelatedSidebarProps) {
  const { t } = useI18n()

  // 预定义标签颜色
  const tagColors = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
  ]

  return (
    <div
      style={{
        width: 240,
        height: '100%',
        overflow: 'auto',
        padding: '0 0 16px 16px',
        borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
      }}
    >
      {/* 相关艺术家 */}
      {relatedArtists.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Text
            type="secondary"
            style={{
              display: 'block',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: 12,
            }}
          >
            {t('search.relatedArtists')}
          </Text>

          <Flex vertical gap={8}>
            {relatedArtists.slice(0, 6).map((artist) => {
              const imageUrl = artist.imagePath
                ? getThumbnailUrl(artist.imagePath)
                : undefined

              return (
                <Flex
                  key={artist.id}
                  align="center"
                  gap={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => artist.id && onArtistClick(artist.id)}
                >
                  <Avatar
                    size={40}
                    src={imageUrl}
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                    }}
                  />
                  <Flex vertical style={{ minWidth: 0 }}>
                    <Text
                      ellipsis
                      style={{
                        fontSize: 13,
                        color: isDark ? '#fff' : '#1a1a1a',
                      }}
                    >
                      {artist.name}
                    </Text>
                    {artist.songCount && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {artist.songCount} {t('search.songs')}
                      </Text>
                    )}
                  </Flex>
                </Flex>
              )
            })}
          </Flex>
        </div>
      )}

      {/* 热门标签 */}
      {trendingTags.length > 0 && (
        <div>
          <Text
            type="secondary"
            style={{
              display: 'block',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: 12,
            }}
          >
            {t('search.trendingTags')}
          </Text>

          <Flex wrap="wrap" gap={8}>
            {trendingTags.map((tag, index) => (
              <Tag
                key={tag}
                color={tagColors[index % tagColors.length]}
                style={{
                  margin: 0,
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
                onClick={() => onTagClick(tag)}
              >
                {tag}
              </Tag>
            ))}
          </Flex>
        </div>
      )}
    </div>
  )
}
