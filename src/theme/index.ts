import { theme } from "antd";

export type BaseTheme = "light" | "dark";
export type AccentTheme = "neuro" | "neuro-evil" | "evil";

export const accentColors = {
  neuro: {
    primary: "#40d8ff",
    primaryHover: "#66e2ff",
    primaryActive: "#1ac8e8",
    primaryBg: "rgba(64, 216, 255, 0.1)",
    primaryBgHover: "rgba(64, 216, 255, 0.2)",
  },
  "neuro-evil": {
    primary: "#a057ff",
    primaryHover: "#b579ff",
    primaryActive: "#8a3dff",
    primaryBg: "rgba(160, 87, 255, 0.1)",
    primaryBgHover: "rgba(160, 87, 255, 0.2)",
  },
  evil: {
    primary: "#f90e6a",
    primaryHover: "#ff3d85",
    primaryActive: "#d60758",
    primaryBg: "rgba(249, 14, 106, 0.1)",
    primaryBgHover: "rgba(249, 14, 106, 0.2)",
  },
};

export function createAntdTheme(baseTheme: BaseTheme, accentTheme: AccentTheme) {
  const accent = accentColors[accentTheme];
  const baseAlgorithm = baseTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm;

  return {
    algorithm: baseAlgorithm,
    token: {
      colorPrimary: accent.primary,
      colorPrimaryHover: accent.primaryHover,
      colorPrimaryActive: accent.primaryActive,
      colorPrimaryBg: accent.primaryBg,
      colorPrimaryBgHover: accent.primaryBgHover,
    },
  };
}
