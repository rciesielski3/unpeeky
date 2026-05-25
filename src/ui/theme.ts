import { Platform } from "react-native";

export const colors = {
  background: "#F8FAFC",
  parentBackground: "#FAF8FF",
  parentBackgroundSoft: "#EEF6FF",
  addBackground: "#FFF8E6",
  childBackground: "#EEF7FF",
  settingsBackground: "#F1FAE6",
  surface: "#FFFFFF",
  surfaceMuted: "#F2F4FF",
  primary: "#7C5CF6",
  primaryDark: "#5B4FCF",
  primarySoft: "#EDE8FF",
  accent: "#72C93A",
  accentDark: "#4C9F24",
  warning: "#F5C842",
  warningDark: "#E67700",
  ctaWarning: "#FFC20E",
  ctaWarningDisabled: "#FFE38A",
  text: "#101828",
  textMuted: "#667085",
  border: "#E4E7EC",
  tile: "#C8A7F2",
  successSurface: "#F0FBE7",
  successBorder: "#B7E987",
  decorationPrimary: "#C5B8FF",
  decorationWarning: "#F5C842",
  decorationGreen: "#BDEB8F",
  decorationCloud: "#FFFFFF",
  confettiYellow: "#FFD43B",
  confettiBlue: "#74C0FC",
  confettiPink: "#FAA2C1",
  confettiGreen: "#8CE99A",
  avatarPastelBackgrounds: ["#E7F8D9", "#EEF0FF", "#F0E4FF", "#FFF0D7", "#FFF5C8", "#F1E8FF"]
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
