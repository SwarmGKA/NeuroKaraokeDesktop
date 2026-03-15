import { useState, useEffect, useCallback } from "react";
import { Store } from "@tauri-apps/plugin-store";
import { BaseTheme, AccentTheme, ThemeState, defaultThemeState } from "../theme";

const STORE_NAME = "theme-store.json";
const THEME_KEY = "theme-state";

export function useThemeStore() {
  const [theme, setThemeState] = useState<ThemeState>(defaultThemeState);
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initStore() {
      try {
        const storeInstance = await Store.load(STORE_NAME);
        if (!mounted) return;

        setStore(storeInstance);

        const savedTheme = await storeInstance.get<ThemeState>(THEME_KEY);
        if (savedTheme && mounted) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme store:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initStore();

    return () => {
      mounted = false;
    };
  }, []);

  const setTheme = useCallback(
    async (newTheme: ThemeState) => {
      setThemeState(newTheme);
      if (store) {
        try {
          await store.set(THEME_KEY, newTheme);
          await store.save();
        } catch (error) {
          console.error("Failed to save theme:", error);
        }
      }
    },
    [store]
  );

  const setBaseTheme = useCallback(
    async (base: BaseTheme) => {
      await setTheme({ ...theme, base });
    },
    [theme, setTheme]
  );

  const setAccentTheme = useCallback(
    async (accent: AccentTheme) => {
      await setTheme({ ...theme, accent });
    },
    [theme, setTheme]
  );

  return {
    theme,
    isLoading,
    setTheme,
    setBaseTheme,
    setAccentTheme,
  };
}
