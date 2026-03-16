import { Flex, Typography, Card } from 'antd'
import { useI18n } from '../i18n'

const { Title, Text } = Typography

export function ArtGallery() {
  const { t } = useI18n()

  return (
    <Flex vertical gap={24} style={{ padding: 24 }}>
      <div>
        <Title level={3} style={{ marginBottom: 8 }}>
          {t('page.artGallery')}
        </Title>
        <Text type="secondary">{t('artGallery.subtitle')}</Text>
      </div>

      <Card
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <Text type="secondary">{t('artGallery.content')}</Text>
      </Card>
    </Flex>
  )
}
