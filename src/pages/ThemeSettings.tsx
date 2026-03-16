import { Card, Radio, Button, Space, Typography } from 'antd'
import { useI18n, Language } from '../i18n'
import { BaseTheme, AccentTheme } from '../theme'

const { Title, Text } = Typography

interface ThemeSettingsProps {
  baseTheme: BaseTheme
  accentTheme: AccentTheme
  language: Language
  onBaseThemeChange: (theme: BaseTheme) => void
  onAccentThemeChange: (theme: AccentTheme) => void
  onLanguageChange: (lang: Language) => void
}

export default function ThemeSettings({
  baseTheme,
  accentTheme,
  language,
  onBaseThemeChange,
  onAccentThemeChange,
  onLanguageChange,
}: ThemeSettingsProps) {
  const { t } = useI18n()

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>{t('settings.title')}</Title>
        <Text type="secondary">{t('settings.appearance')}</Text>

        <div>
          <Text strong>{t('settings.theme')}</Text>
          <Radio.Group
            value={baseTheme}
            onChange={(e) => onBaseThemeChange(e.target.value)}
            style={{ marginLeft: 16 }}
          >
            <Radio.Button value="light">{t('settings.theme.light')}</Radio.Button>
            <Radio.Button value="dark">{t('settings.theme.dark')}</Radio.Button>
          </Radio.Group>
        </div>

        <div>
          <Text strong>{t('settings.accentColor')}</Text>
          <Radio.Group
            value={accentTheme}
            onChange={(e) => onAccentThemeChange(e.target.value)}
            style={{ marginLeft: 16 }}
          >
            <Radio.Button value="neuro">{t('settings.accent.neuro')}</Radio.Button>
            <Radio.Button value="neuro-evil">{t('settings.accent.neuroEvil')}</Radio.Button>
            <Radio.Button value="evil">{t('settings.accent.evil')}</Radio.Button>
          </Radio.Group>
        </div>

        <div>
          <Text strong>{t('settings.language')}</Text>
          <Radio.Group
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{ marginLeft: 16 }}
          >
            <Radio.Button value="zh">{t('settings.language.zh')}</Radio.Button>
            <Radio.Button value="en">{t('settings.language.en')}</Radio.Button>
          </Radio.Group>
        </div>
      </Space>
    </Card>
  )
}
