import { Card, Typography, Space } from 'antd'
import { useI18n } from '../i18n'

const { Title, Paragraph } = Typography

export default function Home() {
  const { t } = useI18n()

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>{t('page.home')}</Title>
        <Paragraph>{t('app.loading')}</Paragraph>
      </Space>
    </Card>
  )
}
