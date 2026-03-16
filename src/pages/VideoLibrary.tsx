import { Flex, Typography, Card } from 'antd'
import { useI18n } from '../i18n'

const { Title, Text } = Typography

export function VideoLibrary() {
  const { t } = useI18n()

  return (
    <Flex vertical gap={24} style={{ padding: 24 }}>
      <div>
        <Title level={3} style={{ marginBottom: 8 }}>
          {t('page.videoLibrary')}
        </Title>
        <Text type="secondary">{t('videoLibrary.subtitle')}</Text>
      </div>

      <Card
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <Text type="secondary">{t('videoLibrary.content')}</Text>
      </Card>
    </Flex>
  )
}
