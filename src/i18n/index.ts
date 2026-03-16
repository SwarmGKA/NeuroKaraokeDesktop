import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'zh' | 'en'

type TranslationMap = Record<string, string>

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = 'neuro-karaoke-language'

function parseProperties(content: string): TranslationMap {
  const translations: TranslationMap = {}
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')
    if (separatorIndex > 0) {
      const key = trimmedLine.substring(0, separatorIndex).trim()
      const value = trimmedLine.substring(separatorIndex + 1).trim()
      translations[key] = value
    }
  }

  return translations
}

async function loadTranslations(lang: Language): Promise<TranslationMap> {
  try {
    const response = await fetch(`/src/i18n/locales/${lang}.properties`)
    if (!response.ok) {
      throw new Error(`Failed to load ${lang} translations`)
    }
    const content = await response.text()
    return parseProperties(content)
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error)
    return {}
  }
}

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') {
      return stored
    }
    return 'zh'
  })

  const [translations, setTranslations] = useState<TranslationMap>({})

  useEffect(() => {
    loadTranslations(language).then(setTranslations)
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }

  const t = (key: string): string => {
    return translations[key] || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
