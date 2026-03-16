import { Avatar, Button, Space, Typography } from 'antd'
import { FiSettings, FiUser } from 'react-icons/fi'
import { useI18n } from '../i18n'
import { BaseTheme, AccentTheme, accentColors } from '../theme'

const { Text } = Typography

interface UserPanelProps {
  onSettingsClick: () => void
  onOpenUserCard: () => void
  accentColor: AccentTheme
  baseTheme: BaseTheme
}

export function UserPanel({
  onSettingsClick,
  onOpenUserCard,
  accentColor,
  baseTheme,
}: UserPanelProps) {
  const { t } = useI18n()
  const accent = accentColors[accentColor]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: baseTheme === 'dark' ? '#141414' : '#ffffff',
        borderTop: `1px solid ${baseTheme === 'dark' ? '#303030' : '#f0f0f0'}`,
      }}
    >
      <Space
        style={{ cursor: 'pointer' }}
        onClick={onOpenUserCard}
      >
        <Avatar
          size={36}
          icon={<FiUser />}
          style={{
            backgroundColor: accent.primary,
          }}
        />
        <Text
          style={{
            color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9',
            fontSize: 14,
          }}
        >
          {t('userCard.guestUser')}
        </Text>
      </Space>

      <Button
        type="text"
        icon={<FiSettings size={18} />}
        onClick={onSettingsClick}
        style={{
          color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9',
        }}
      />
    </div>
  )
}
