import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Store } from "@tauri-apps/plugin-store";

export type Language = "zh" | "en";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORE_NAME = "app-store.json";
const LANGUAGE_KEY = "language";

// 解析 .properties 文件
function parseProperties(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();
    result[key] = value;
  }

  return result;
}

// 加载语言文件
async function loadLocale(lang: Language): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/src/i18n/locales/${lang}.properties`);
    const content = await response.text();
    return parseProperties(content);
  } catch (error) {
    console.error(`Failed to load locale ${lang}:`, error);
    return {};
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const storeInstance = await Store.load(STORE_NAME);
        if (!mounted) return;

        setStore(storeInstance);

        const savedLang = await storeInstance.get<Language>(LANGUAGE_KEY);
        const lang = savedLang || "zh";
        const locale = await loadLocale(lang);

        if (mounted) {
          setLanguageState(lang);
          setTranslations(locale);
        }
      } catch (error) {
        console.error("Failed to init i18n:", error);
        const locale = await loadLocale("zh");
        if (mounted) setTranslations(locale);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  // 切换语言
  const setLanguage = useCallback(async (lang: Language) => {
    if (lang === language) return;
    const locale = await loadLocale(lang);
    setTranslations(locale);
    setLanguageState(lang);
    if (store) {
      await store.set(LANGUAGE_KEY, lang);
      await store.save();
    }
  }, [language, store]);

  // 翻译函数
  const t = useCallback((key: string): string => translations[key] || key, [translations]);

  if (isLoading) return null;

  const ctxValue = { language, setLanguage, t };
  return React.createElement(I18nContext.Provider, { value: ctxValue }, children);
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
