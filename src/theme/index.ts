import { theme } from 'antd'
import type { ConfigProviderProps } from 'antd'
import type { BaseTheme, AccentTheme } from '../hooks/useThemeStore'
import { primaryColors, accentColors } from '../hooks/useThemeStore'

export type { BaseTheme, AccentTheme }

// 创建 Ant Design 主题配置
export function createAppTheme(baseTheme: BaseTheme, accentTheme: AccentTheme): ConfigProviderProps['theme'] {
  const primaryColor = primaryColors[accentTheme]
  const isDark = baseTheme === 'dark'

  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // 主色
      colorPrimary: primaryColor,
      // 背景色
      colorBgContainer: isDark ? '#1a1a1a' : '#ffffff',
      colorBgElevated: isDark ? '#252525' : '#ffffff',
      colorBgLayout: isDark ? '#1a1a1a' : '#f5f5f5',
      // 文字颜色
      colorText: isDark ? '#ffffff' : '#1a1a1a',
      colorTextSecondary: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
      colorTextTertiary: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
      // 边框颜色
      colorBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
      colorBorderSecondary: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      // 圆角
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusSM: 4,
      // 字体
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      Button: {
        primaryShadow: 'none',
        defaultShadow: 'none',
      },
      Card: {
        colorBgContainer: isDark ? '#252525' : '#ffffff',
      },
      Menu: {
        darkItemBg: '#1a1a1a',
        darkItemColor: 'rgba(255,255,255,0.65)',
        darkItemHoverBg: 'rgba(255,255,255,0.08)',
        darkItemSelectedBg: `${primaryColor}20`,
        darkItemSelectedColor: primaryColor,
      },
      Modal: {
        contentBg: isDark ? '#1a1a1a' : '#ffffff',
        headerBg: isDark ? '#1a1a1a' : '#ffffff',
      },
      Radio: {
        colorPrimary: primaryColor,
      },
    },
  }
}

// CSS 变量样式（用于非 Ant Design 组件）
export function getThemeStyles(baseTheme: BaseTheme, accentTheme: AccentTheme): React.CSSProperties {
  const isDark = baseTheme === 'dark'
  const primaryColor = primaryColors[accentTheme]
  const palette = accentColors[accentTheme]

  return {
    '--color-primary': primaryColor,
    '--color-primary-light': palette[300],
    '--color-primary-dark': palette[700],
    '--bg-primary': isDark ? '#1a1a1a' : '#ffffff',
    '--bg-secondary': isDark ? '#252525' : '#f5f5f5',
    '--bg-sidebar': isDark ? '#1a1a1a' : '#fafafa',
    '--bg-card': isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    '--text-primary': isDark ? '#ffffff' : '#1a1a1a',
    '--text-secondary': isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
    '--border-color': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
  } as React.CSSProperties
}

// 默认主题状态
export const defaultThemeState = {
  base: 'dark' as BaseTheme,
  accent: 'neuro' as AccentTheme,
}

export { accentColors, primaryColors }
