import { Flex, Typography, Card } from 'antd'
import { useI18n } from '../i18n'

const { Title, Text } = Typography

export function About() {
  const { t } = useI18n()

  return (
    <Flex vertical gap={24} style={{ padding: 24 }}>
      <div>
        <Title level={3} style={{ marginBottom: 8 }}>
          {t('page.about')}
        </Title>
        <Text type="secondary">{t('about.subtitle')}</Text>
      </div>

      <Card
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <Flex vertical gap={16}>
          <Text>{t('about.appName')}</Text>
          <Text type="secondary">{t('about.version')}: 1.0.0</Text>
          <Text type="secondary">{t('about.techStack')}</Text>
        </Flex>
      </Card>
    </Flex>
  )
}
