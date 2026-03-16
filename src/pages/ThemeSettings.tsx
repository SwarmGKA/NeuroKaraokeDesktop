import { Flex, Typography, Card, Radio, Button, Space } from 'antd'
import { useI18n, Language } from '../i18n'

const { Title, Text } = Typography

export type BaseTheme = 'light' | 'dark'
export type AccentTheme = 'neuro' | 'neuro-evil' | 'evil'

interface ThemeSettingsProps {
  baseTheme: BaseTheme
  accentTheme: AccentTheme
  language: Language
  onBaseThemeChange: (theme: BaseTheme) => void
  onAccentThemeChange: (theme: AccentTheme) => void
  onLanguageChange: (lang: Language) => void
}

const accentColors = {
  neuro: { color: '#40d8ff', label: 'settings.accent.neuro' },
  'neuro-evil': { color: '#a057ff', label: 'settings.accent.neuroEvil' },
  evil: { color: '#f90e6a', label: 'settings.accent.evil' },
}

export function ThemeSettings({
  baseTheme,
  accentTheme,
  language,
  onBaseThemeChange,
  onAccentThemeChange,
  onLanguageChange,
}: ThemeSettingsProps) {
  const { t } = useI18n()
  const isDark = baseTheme === 'dark'

  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
  }

  return (
    <Flex vertical gap={24} style={{ padding: 24 }}>
      <div>
        <Title level={3} style={{ marginBottom: 8 }}>
          {t('page.settings')}
        </Title>
        <Text type="secondary">{t('settings.appearance')}</Text>
      </div>

      {/* 主题选择 */}
      <Card
        title={
          <Text strong style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
            {t('settings.theme')}
          </Text>
        }
        style={cardStyle}
        styles={{
          header: { borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}` },
        }}
      >
        <Radio.Group value={baseTheme} onChange={(e) => onBaseThemeChange(e.target.value)}>
          <Radio value="light">{t('settings.theme.light')}</Radio>
          <Radio value="dark">{t('settings.theme.dark')}</Radio>
        </Radio.Group>
      </Card>

      {/* 强调色选择 */}
      <Card
        title={
          <Text strong style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
            {t('settings.accentColor')}
          </Text>
        }
        style={cardStyle}
        styles={{
          header: { borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}` },
        }}
      >
        <Flex vertical gap={12}>
          {(Object.keys(accentColors) as AccentTheme[]).map((key) => {
            const { color, label } = accentColors[key]
            const isActive = accentTheme === key

            return (
              <Button
                key={key}
                type={isActive ? 'primary' : 'default'}
                style={{
                  justifyContent: 'flex-start',
                  backgroundColor: isActive ? `${color}30` : 'transparent',
                  borderColor: isActive ? color : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  color: isActive ? color : isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
                }}
                onClick={() => onAccentThemeChange(key)}
              >
                <Space>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: `2px solid ${isActive ? (isDark ? '#fff' : '#1a1a1a') : 'transparent'}`,
                    }}
                  />
                  {t(label)}
                </Space>
              </Button>
            )
          })}
        </Flex>
      </Card>

      {/* 语言选择 */}
      <Card
        title={
          <Text strong style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>
            {t('settings.language')}
          </Text>
        }
        style={cardStyle}
        styles={{
          header: { borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}` },
        }}
      >
        <Radio.Group value={language} onChange={(e) => onLanguageChange(e.target.value)}>
          <Radio value="zh">{t('settings.language.zh')}</Radio>
          <Radio value="en">{t('settings.language.en')}</Radio>
        </Radio.Group>
      </Card>
    </Flex>
  )
}
