import { Card, Typography, Space } from 'antd'
import { useI18n } from '../i18n'

const { Title, Paragraph } = Typography

export default function Downloads() {
  const { t } = useI18n()

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>{t('page.downloads')}</Title>
        <Paragraph>{t('app.loading')}</Paragraph>
      </Space>
    </Card>
  )
}
