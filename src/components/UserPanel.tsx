import { Flex, Avatar, Button, Typography } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { useI18n } from '../i18n'

const { Text } = Typography

interface UserPanelProps {
  onSettingsClick: () => void
  onOpenUserCard: () => void
  accentColor: string
  baseTheme: 'light' | 'dark'
}

export function UserPanel({
  onSettingsClick,
  onOpenUserCard,
  accentColor,
  baseTheme,
}: UserPanelProps) {
  const isDark = baseTheme === 'dark'
  const { t } = useI18n()

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{
        width: '100%',
        padding: 12,
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
        backgroundColor: isDark ? '#1a1a1a' : '#fafafa',
      }}
    >
      <Flex align="center" gap={8} style={{ cursor: 'pointer' }} onClick={onOpenUserCard}>
        <Avatar
          size={32}
          style={{
            backgroundColor: accentColor,
            color: '#000',
            fontWeight: 600,
          }}
        >
          {t('user.guestName').charAt(0)}
        </Avatar>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: isDark ? '#ffffff' : '#1a1a1a',
          }}
        >
          {t('user.guestName')}
        </Text>
      </Flex>

      <Button
        type="text"
        icon={<SettingOutlined />}
        size="small"
        style={{
          color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
        }}
        onClick={onSettingsClick}
      />
    </Flex>
  )
}
