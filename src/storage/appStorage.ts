import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeGoal } from "../domain/goal";
import type { AppSettings, Goal, PersistedGoal } from "../domain/goal";

const STORAGE_KEYS = {
  goals: "goals",
  settings: "settings"
} as const;

export async function loadGoals(): Promise<Goal[]> {
  const goals = await readJson<PersistedGoal[]>(STORAGE_KEYS.goals, []);

  return goals.map(normalizeGoal);
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
}

export async function loadSettings(): Promise<AppSettings> {
  return readJson<AppSettings>(STORAGE_KEYS.settings, {
    isPremium: false,
    notificationTime: "18:00",
    childName: ""
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const rawValue = await AsyncStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}
