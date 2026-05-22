import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeGoal, normalizeSettings } from "../domain/goal";
import type { AppSettings, Goal, PersistedGoal } from "../domain/goal";

const STORAGE_KEYS = {
  goals: "goals",
  settings: "settings"
} as const;

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
  const settings = await readJson<Partial<AppSettings> | null>(STORAGE_KEYS.settings, null);
  const normalizedSettings = normalizeSettings(settings);

  if (JSON.stringify(settings) !== JSON.stringify(normalizedSettings)) {
    await saveSettings(normalizedSettings);
  }

  return normalizedSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
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
