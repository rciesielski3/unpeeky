import { Platform } from "react-native";

export const colors = {
  background: "#F8FAFC",
  parentBackground: "#F1EDFF",
  addBackground: "#FFF5D8",
  childBackground: "#EAF5FF",
  settingsBackground: "#EEF8DF",
  surface: "#FFFFFF",
  surfaceMuted: "#F2F4FF",
  primary: "#8B5CF6",
  primaryDark: "#5B35D5",
  accent: "#7AC943",
  accentDark: "#4C9F24",
  warning: "#FFB703",
  warningDark: "#E67700",
  text: "#101828",
  textMuted: "#667085",
  border: "#E4E7EC",
  tile: "#C8A7F2",
  successSurface: "#F0FBE7",
  successBorder: "#B7E987",
  confettiYellow: "#FFD43B",
  confettiBlue: "#74C0FC",
  confettiPink: "#FAA2C1",
  confettiGreen: "#8CE99A"
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999
} as const;

export const fonts = {
  heading: Platform.OS === "android" ? "sans-serif-rounded" : undefined
} as const;
