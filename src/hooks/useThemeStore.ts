import { useState, useEffect, useCallback } from 'react'

export type BaseTheme = 'light' | 'dark'
export type AccentTheme = 'neuro' | 'neuro-evil' | 'evil'

interface ThemeState {
  base: BaseTheme
  accent: AccentTheme
}

const STORAGE_KEY = 'theme-settings'

// 强调色配置
export const accentColors = {
  neuro: {
    50: '#e6f9ff',
    100: '#b3efff',
    200: '#80e5ff',
    300: '#4ddbff',
    400: '#40d8ff',
    500: '#26d1ff',
    600: '#00c7ff',
    700: '#009ecc',
    800: '#007699',
    900: '#004d66',
  },
  'neuro-evil': {
    50: '#f3e6ff',
    100: '#dcb3ff',
    200: '#c580ff',
    300: '#ae4dff',
    400: '#a057ff',
    500: '#8f26ff',
    600: '#7a00ff',
    700: '#6200cc',
    800: '#490099',
    900: '#310066',
  },
  evil: {
    50: '#ffe6f0',
    100: '#ffb3d3',
    200: '#ff80b6',
    300: '#ff4d99',
    400: '#f90e6a',
    500: '#e6005c',
    600: '#b30047',
    700: '#800033',
    800: '#4d001f',
    900: '#1a000a',
  },
}

// 简化的强调色（用于 Ant Design）
export const primaryColors = {
  neuro: '#40d8ff',
  'neuro-evil': '#a057ff',
  evil: '#f90e6a',
}

const defaultThemeState: ThemeState = {
  base: 'dark',
  accent: 'neuro',
}

export function useThemeStore() {
  const [themeState, setThemeState] = useState<ThemeState>(defaultThemeState)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化：从存储加载主题设置
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedSettings = await window.electronAPI.storeGet(STORAGE_KEY)
        if (savedSettings && typeof savedSettings === 'object') {
          setThemeState(savedSettings as ThemeState)
        }
      } catch (error) {
        console.error('加载主题设置失败:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTheme()
  }, [])

  // 保存主题设置
  const saveTheme = useCallback(async (state: ThemeState) => {
    try {
      await window.electronAPI.storeSet(STORAGE_KEY, state)
    } catch (error) {
      console.error('保存主题设置失败:', error)
    }
  }, [])

  // 设置基础主题
  const setBaseTheme = useCallback(async (base: BaseTheme) => {
    const newState = { ...themeState, base }
    setThemeState(newState)
    await saveTheme(newState)
  }, [themeState, saveTheme])

  // 设置强调色主题
  const setAccentTheme = useCallback(async (accent: AccentTheme) => {
    const newState = { ...themeState, accent }
    setThemeState(newState)
    await saveTheme(newState)
  }, [themeState, saveTheme])

  // 获取当前强调色
  const accentColor = primaryColors[themeState.accent]
  const accentPalette = accentColors[themeState.accent]

  return {
    baseTheme: themeState.base,
    accentTheme: themeState.accent,
    accentColor,
    accentPalette,
    setBaseTheme,
    setAccentTheme,
    isLoading,
  }
}

export default useThemeStore
