import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { BaseTheme, AccentTheme } from "../theme";

interface ThemeContextValue {
  baseTheme: BaseTheme;
  accentTheme: AccentTheme;
  setBaseTheme: (theme: BaseTheme) => void;
  setAccentTheme: (theme: AccentTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const BASE_THEME_KEY = "neurokaraoke-base-theme";
const ACCENT_THEME_KEY = "neurokaraoke-accent-theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [baseTheme, setBaseThemeState] = useState<BaseTheme>(() => {
    const stored = localStorage.getItem(BASE_THEME_KEY);
    return (stored as BaseTheme) || "dark";
  });

  const [accentTheme, setAccentThemeState] = useState<AccentTheme>(() => {
    const stored = localStorage.getItem(ACCENT_THEME_KEY);
    return (stored as AccentTheme) || "neuro";
  });

  useEffect(() => {
    localStorage.setItem(BASE_THEME_KEY, baseTheme);
  }, [baseTheme]);

  useEffect(() => {
    localStorage.setItem(ACCENT_THEME_KEY, accentTheme);
  }, [accentTheme]);

  const setBaseTheme = (theme: BaseTheme) => {
    setBaseThemeState(theme);
  };

  const setAccentTheme = (theme: AccentTheme) => {
    setAccentThemeState(theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        baseTheme,
        accentTheme,
        setBaseTheme,
        setAccentTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeStore() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeStore must be used within a ThemeProvider");
  }
  return context;
}
