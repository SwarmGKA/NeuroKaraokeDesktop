import { Modal, Avatar, Button, Divider, Row, Col, Statistic, Space, Typography } from 'antd'
import { FiUser, FiSettings, FiEdit, FiLogOut } from 'react-icons/fi'
import { useI18n } from '../i18n'
import { BaseTheme, AccentTheme, accentColors } from '../theme'

const { Text, Title } = Typography

interface UserCardDialogProps {
  isOpen: boolean
  onClose: () => void
  onSettingsClick: () => void
  accentColor: AccentTheme
  baseTheme: BaseTheme
}

export function UserCardDialog({
  isOpen,
  onClose,
  onSettingsClick,
  accentColor,
  baseTheme,
}: UserCardDialogProps) {
  const { t } = useI18n()
  const accent = accentColors[accentColor]

  const handleSettingsClick = () => {
    onClose()
    onSettingsClick()
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      styles={{
        content: {
          backgroundColor: baseTheme === 'dark' ? '#1f1f1f' : '#ffffff',
        },
        header: {
          backgroundColor: baseTheme === 'dark' ? '#1f1f1f' : '#ffffff',
          borderBottom: `1px solid ${baseTheme === 'dark' ? '#303030' : '#f0f0f0'}`,
        },
        body: {
          backgroundColor: baseTheme === 'dark' ? '#1f1f1f' : '#ffffff',
        },
      }}
      title={
        <Text style={{ color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9', fontSize: 16, fontWeight: 600 }}>
          {t('userCard.title')}
        </Text>
      }
      closeIcon={
        <Text style={{ color: baseTheme === 'dark' ? '#ffffff73' : '#00000073' }}>×</Text>
      }
    >
      <div style={{ padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Avatar
            size={72}
            icon={<FiUser size={36} />}
            style={{
              backgroundColor: accent.primary,
            }}
          />
          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9',
              }}
            >
              {t('userCard.guestUser')}
            </Title>
            <Text style={{ color: baseTheme === 'dark' ? '#ffffff73' : '#00000073' }}>
              {t('userCard.guestUser')}
            </Text>
          </div>
        </div>

        <Divider style={{ margin: '16px 0', borderColor: baseTheme === 'dark' ? '#303030' : '#f0f0f0' }} />

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Statistic
              title={
                <Text style={{ color: baseTheme === 'dark' ? '#ffffff73' : '#00000073', fontSize: 12 }}>
                  {t('userCard.stats.played')}
                </Text>
              }
              value={0}
              valueStyle={{
                color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9',
                fontSize: 20,
              }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title={
                <Text style={{ color: baseTheme === 'dark' ? '#ffffff73' : '#00000073', fontSize: 12 }}>
                  {t('userCard.stats.favorites')}
                </Text>
              }
              value={0}
              valueStyle={{
                color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9',
                fontSize: 20,
              }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title={
                <Text style={{ color: baseTheme === 'dark' ? '#ffffff73' : '#00000073', fontSize: 12 }}>
                  {t('userCard.stats.downloads')}
                </Text>
              }
              value={0}
              valueStyle={{
                color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9',
                fontSize: 20,
              }}
            />
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0', borderColor: baseTheme === 'dark' ? '#303030' : '#f0f0f0' }} />

        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Button
            type="text"
            icon={<FiSettings />}
            onClick={handleSettingsClick}
            block
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              height: 40,
              color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9',
            }}
          >
            {t('userCard.settings')}
          </Button>
          <Button
            type="text"
            icon={<FiEdit />}
            block
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              height: 40,
              color: baseTheme === 'dark' ? '#ffffffd9' : '#000000d9',
            }}
          >
            {t('userCard.editProfile')}
          </Button>
          <Button
            type="text"
            icon={<FiLogOut />}
            block
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              height: 40,
              color: '#ff4d4f',
            }}
          >
            {t('userCard.logout')}
          </Button>
        </Space>
      </div>
    </Modal>
  )
}
