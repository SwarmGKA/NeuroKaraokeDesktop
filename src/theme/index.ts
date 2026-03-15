import { extendTheme } from "@chakra-ui/react";

export type BaseTheme = "light" | "dark";
export type AccentTheme = "neuro" | "neuro-evil" | "evil";
export type ThemeState = {
  base: BaseTheme;
  accent: AccentTheme;
};

const accentColors = {
  neuro: {
    50: "#e6f9ff",
    100: "#b3efff",
    200: "#80e5ff",
    300: "#4ddbff",
    400: "#40d8ff",
    500: "#26d1ff",
    600: "#00c7ff",
    700: "#009ecc",
    800: "#007699",
    900: "#004d66",
  },
  "neuro-evil": {
    50: "#f3e6ff",
    100: "#dcb3ff",
    200: "#c580ff",
    300: "#ae4dff",
    400: "#a057ff",
    500: "#8f26ff",
    600: "#7a00ff",
    700: "#6200cc",
    800: "#490099",
    900: "#310066",
  },
  evil: {
    50: "#ffe6f0",
    100: "#ffb3d3",
    200: "#ff80b6",
    300: "#ff4d99",
    400: "#f90e6a",
    500: "#e6005c",
    600: "#b30047",
    700: "#800033",
    800: "#4d001f",
    900: "#1a000a",
  },
};

export function createAppTheme(baseTheme: BaseTheme, accent: AccentTheme) {
  const accentPalette = accentColors[accent];

  return extendTheme({
    config: {
      initialColorMode: baseTheme,
      useSystemColorMode: false,
    },
    colors: {
      brand: accentPalette,
      // 添加语义化颜色
      bg: {
        primary: baseTheme === "dark" ? "#1a1a1a" : "#ffffff",
        secondary: baseTheme === "dark" ? "#252525" : "#f5f5f5",
        sidebar: baseTheme === "dark" ? "#1a1a1a" : "#fafafa",
        card: baseTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      },
      text: {
        primary: baseTheme === "dark" ? "#ffffff" : "#1a1a1a",
        secondary: baseTheme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
      },
      accent: accentPalette,
    },
    styles: {
      global: {
        body: {
          bg: baseTheme === "dark" ? "#1a1a1a" : "#ffffff",
          color: baseTheme === "dark" ? "#ffffff" : "#1a1a1a",
        },
      },
    },
  });
}

export const defaultThemeState: ThemeState = {
  base: "dark",
  accent: "neuro",
};
