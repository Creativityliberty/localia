// =====================================
// Localia — Presets de thèmes
// =====================================

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    primaryDark: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
  };
  radius: string;
  fontDisplay: string;
  fontBody: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "fresh",
    name: "Fresh",
    description: "Vert tendre + crème. Clean et organique. Idéal restauration & bien-être.",
    colors: {
      background: "#F4F7F2",
      surface: "#FFFFFF",
      primary: "#1B3D0A",
      primaryDark: "#0A2A05",
      accent: "#A6FF4D",
      textPrimary: "#111611",
      textSecondary: "#5E6B5B",
    },
    radius: "24px",
    fontDisplay: "Fraunces",
    fontBody: "Geist",
  },
  {
    id: "warm",
    name: "Warm",
    description: "Crème + terracotta. Chaleureux et accueillant. Parfait barbier & artisans.",
    colors: {
      background: "#FAF6F0",
      surface: "#FFFFFF",
      primary: "#4A1B0C",
      primaryDark: "#2A0F06",
      accent: "#D85A30",
      textPrimary: "#1F1410",
      textSecondary: "#6B5B53",
    },
    radius: "20px",
    fontDisplay: "Fraunces",
    fontBody: "Geist",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Noir + blanc + accent. Sobre et premium. Pour boutiques mode & photographes.",
    colors: {
      background: "#FFFFFF",
      surface: "#FAFAFA",
      primary: "#0F0F0F",
      primaryDark: "#000000",
      accent: "#FF4D2C",
      textPrimary: "#0F0F0F",
      textSecondary: "#666666",
    },
    radius: "8px",
    fontDisplay: "Fraunces",
    fontBody: "Geist",
  },
  {
    id: "soft",
    name: "Soft",
    description: "Pastel rose + beige. Doux et féminin. Onglerie, beauté, fleuriste.",
    colors: {
      background: "#FBF6F4",
      surface: "#FFFFFF",
      primary: "#722C3E",
      primaryDark: "#4A1A28",
      accent: "#F2A8B7",
      textPrimary: "#2A1620",
      textSecondary: "#7A5A66",
    },
    radius: "32px",
    fontDisplay: "Fraunces",
    fontBody: "Geist",
  },
  {
    id: "night",
    name: "Night",
    description: "Sombre + accent fluo. Nocturne, urbain. Bars, restos branchés.",
    colors: {
      background: "#0A0E0C",
      surface: "#151B18",
      primary: "#E7FFD2",
      primaryDark: "#A6FF4D",
      accent: "#A6FF4D",
      textPrimary: "#F7FBF4",
      textSecondary: "#9CA89A",
    },
    radius: "20px",
    fontDisplay: "Fraunces",
    fontBody: "Geist",
  },
];

export function getThemePreset(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) ?? THEME_PRESETS[0];
}
