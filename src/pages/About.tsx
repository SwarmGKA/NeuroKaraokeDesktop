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
        <Text type="secondary">关于 Neuro Karaoke</Text>
      </div>

      <Card
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <Flex vertical gap={16}>
          <Text>Neuro Karaoke Desktop</Text>
          <Text type="secondary">版本: 1.0.0</Text>
          <Text type="secondary">使用 Electron + React + Ant Design 构建</Text>
        </Flex>
      </Card>
    </Flex>
  )
}
