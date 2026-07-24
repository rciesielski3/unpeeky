import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeGoal, normalizeSettings } from "../domain/goal";
import type { AppMode, AppSettings, Goal, PersistedGoal, TileColorId } from "../domain/goal";

const STORAGE_KEYS = {
  goals: "goals",
  settings: "settings"
} as const;

type LegacySettingsInput = {
  childName?: string;
  parentLabel?: string;
  notificationTime?: string;
  tileColorId?: string;
  parentPin?: string;
  pin?: string;
  isPremium?: boolean;
  exportData?: Goal[];
  appMode?: AppMode | null;
  isReminderEnabled?: boolean;
};

type LegacyGoalInput = Omit<Goal, "childId"> & { childId?: string };

export function migrateSettingsV1ToV2(oldSettings: LegacySettingsInput): AppSettings {
  const childId = `child-${Date.now()}`;
  return {
    children: [
      {
        id: childId,
        name: oldSettings.childName || "Dziecko",
        settings: {
          parentLabel: oldSettings.parentLabel || "Rodzicu",
          notificationTime: oldSettings.notificationTime || "18:00",
          tileColorId: (oldSettings.tileColorId as TileColorId) || "lavender"
        }
      }
    ],
    globalSettings: {
      pin: oldSettings.parentPin || oldSettings.pin || "",
      isPremium: oldSettings.isPremium || false,
      exportData: oldSettings.exportData || [],
      appMode: oldSettings.appMode || null,
      isReminderEnabled: oldSettings.isReminderEnabled !== undefined ? oldSettings.isReminderEnabled : false
    }
  };
}

export async function loadGoals(): Promise<Goal[]> {
  const goals = await readJson<PersistedGoal[]>(STORAGE_KEYS.goals, []);

  if (!Array.isArray(goals)) {
    return [];
  }

  return goals.flatMap((goal) => {
    try {
      return [normalizeGoal(goal)];
    } catch {
      return [];
    }
  });
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.settings);
    if (!settings) {
      return normalizeSettings(null);
    }

    const parsed = JSON.parse(settings);

    // Detect v0.1.12 schema (no children array). Real v0.1.12 blobs always
    // have an empty childName, so we must key migration off the absence of the
    // children array rather than a truthy childName.
    if (!parsed.children) {
      return migrateSettingsV1ToV2(parsed);
    }

    // v0.1.13+ schema (has children array)
    return normalizeSettings(parsed);
  } catch (error) {
    console.error("Failed to load settings, creating default", error);
    return normalizeSettings(null);
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function migrateGoalsV1ToV2(oldGoals: LegacyGoalInput[], defaultChildId: string): Goal[] {
  return oldGoals.map((goal) => ({
    ...goal,
    childId: goal.childId || defaultChildId
  }));
}

export function removeOrphanedGoals(goals: Goal[], children: Array<{ id: string }>): Goal[] {
  const validChildIds = new Set(children.map((c) => c.id));
  return goals.filter((goal) => validChildIds.has(goal.childId));
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  let rawValue: string | null;

  try {
    rawValue = await AsyncStorage.getItem(key);
  } catch {
    return fallback;
  }

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}
