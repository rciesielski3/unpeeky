import type { TileColorId } from "../domain/goal";

export type AppTheme = {
  accent: string;
  accentDark: string;
  accentSoft: string;
  addBackground: string;
  childBackground: string;
  parentBackground: string;
  settingsBackground: string;
  tile: string;
};

const APP_THEMES: Record<TileColorId, AppTheme> = {
  lavender: {
    accent: "#7C5CF6",
    accentDark: "#5B4FCF",
    accentSoft: "#EDE8FF",
    addBackground: "#FFF8E6",
    childBackground: "#EEF7FF",
    parentBackground: "#FAF8FF",
    settingsBackground: "#F1FAE6",
    tile: "#6366F1"
  },
  mint: {
    accent: "#14B8A6",
    accentDark: "#0F766E",
    accentSoft: "#CCFBF1",
    addBackground: "#F4FFF8",
    childBackground: "#ECFEFF",
    parentBackground: "#F2FFFB",
    settingsBackground: "#F0FDFA",
    tile: "#5EEAD4"
  },
  peach: {
    accent: "#F97316",
    accentDark: "#C2410C",
    accentSoft: "#FFEDD5",
    addBackground: "#FFF7ED",
    childBackground: "#FFF4E6",
    parentBackground: "#FFF8F1",
    settingsBackground: "#FFF7ED",
    tile: "#FDBA74"
  },
  rose: {
    accent: "#F43F5E",
    accentDark: "#BE123C",
    accentSoft: "#FFE4E6",
    addBackground: "#FFF1F5",
    childBackground: "#FFF1F7",
    parentBackground: "#FFF7FA",
    settingsBackground: "#FFF1F5",
    tile: "#FDA4AF"
  },
  sky: {
    accent: "#38BDF8",
    accentDark: "#0369A1",
    accentSoft: "#E0F2FE",
    addBackground: "#F0F9FF",
    childBackground: "#EFF6FF",
    parentBackground: "#F8FBFF",
    settingsBackground: "#F0F9FF",
    tile: "#93C5FD"
  },
  vanilla: {
    accent: "#FACC15",
    accentDark: "#A16207",
    accentSoft: "#FEF9C3",
    addBackground: "#FFFBEB",
    childBackground: "#FFFBEA",
    parentBackground: "#FFFDF4",
    settingsBackground: "#FEFCE8",
    tile: "#FDE68A"
  },
  lilac: {
    accent: "#A78BFA",
    accentDark: "#6D28D9",
    accentSoft: "#F3E8FF",
    addBackground: "#FAF5FF",
    childBackground: "#F5F3FF",
    parentBackground: "#FCF7FF",
    settingsBackground: "#FAF5FF",
    tile: "#C4B5FD"
  },
  lime: {
    accent: "#84CC16",
    accentDark: "#4D7C0F",
    accentSoft: "#ECFCCB",
    addBackground: "#F7FEE7",
    childBackground: "#F0FDF4",
    parentBackground: "#FAFFF2",
    settingsBackground: "#F7FEE7",
    tile: "#BEF264"
  }
};

export function getAppTheme(tileColorId: TileColorId): AppTheme {
  return APP_THEMES[tileColorId] ?? APP_THEMES.lavender;
}

export const defaultAppTheme = getAppTheme("lavender");
