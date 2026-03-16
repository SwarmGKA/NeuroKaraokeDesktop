import { Modal, Flex, Avatar, Button, Typography, Divider, Row, Col, Statistic } from 'antd'
import { SettingOutlined, EditOutlined, LogoutOutlined } from '@ant-design/icons'
import { useI18n } from '../i18n'

const { Text, Title } = Typography

interface UserCardDialogProps {
  isOpen: boolean
  onClose: () => void
  onSettingsClick: () => void
  accentColor: string
  baseTheme: 'light' | 'dark'
}

export function UserCardDialog({
  isOpen,
  onClose,
  onSettingsClick,
  accentColor,
  baseTheme,
}: UserCardDialogProps) {
  const { t } = useI18n()
  const isDark = baseTheme === 'dark'

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={t('userCard.title')}
      footer={
        <Button
          style={{
            borderColor: accentColor,
            color: accentColor,
          }}
          onClick={onClose}
        >
          {t('userCard.close')}
        </Button>
      }
      centered
      width={400}
      styles={{
        content: {
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        },
        header: {
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
        },
        body: {
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        },
        footer: {
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
        },
      }}
      closeIcon={
        <Text style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }}>×</Text>
      }
    >
      <Flex vertical gap={24} style={{ padding: '16px 0' }}>
        {/* 用户头像和信息 */}
        <Flex align="center" justify="center" gap={16}>
          <Avatar
            size={64}
            style={{
              backgroundColor: accentColor,
              color: '#000',
              fontWeight: 600,
            }}
          >
            U
          </Avatar>
          <Flex vertical>
            <Title level={4} style={{ margin: 0, color: isDark ? '#ffffff' : '#1a1a1a' }}>
              Guest
            </Title>
            <Text type="secondary">{t('userCard.guestUser')}</Text>
          </Flex>
        </Flex>

        <Divider style={{ margin: 0, borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }} />

        {/* 统计信息 */}
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('userCard.stats.played')}
                </Text>
              }
              value={0}
              valueStyle={{ color: accentColor, fontSize: 20, fontWeight: 600 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('userCard.stats.favorites')}
                </Text>
              }
              value={0}
              valueStyle={{ color: accentColor, fontSize: 20, fontWeight: 600 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('userCard.stats.downloads')}
                </Text>
              }
              value={0}
              valueStyle={{ color: accentColor, fontSize: 20, fontWeight: 600 }}
            />
          </Col>
        </Row>

        <Divider style={{ margin: 0, borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }} />

        {/* 操作按钮 */}
        <Flex vertical gap={8}>
          <Button
            type="text"
            icon={<SettingOutlined />}
            style={{
              justifyContent: 'flex-start',
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
            }}
            onClick={() => {
              onClose()
              onSettingsClick()
            }}
          >
            {t('userCard.settings')}
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{
              justifyContent: 'flex-start',
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
            }}
            onClick={() => {}}
          >
            {t('userCard.editProfile')}
          </Button>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{
              justifyContent: 'flex-start',
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
            }}
            onClick={() => {}}
          >
            {t('userCard.logout')}
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}
