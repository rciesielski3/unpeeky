import type * as FileSystemModule from "expo-file-system";
import type * as SharingModule from "expo-sharing";

import type { AppSettings, Goal } from "../domain/goal";
import type * as AppStorageModule from "../storage/appStorage";

export const EXPORT_VERSION = 1;

export type ExportData = {
  version: number;
  exportedAt: string;
  goals: Goal[];
  settings: AppSettings;
};

export type ExportDependencies = {
  cacheDirectory: string | null;
  isAvailableAsync: () => Promise<boolean>;
  loadGoals: () => Promise<Goal[]>;
  loadSettings: () => Promise<AppSettings>;
  now: () => Date;
  shareAsync: (uri: string, options?: { dialogTitle?: string; mimeType?: string; UTI?: string }) => Promise<void>;
  writeAsStringAsync: (uri: string, contents: string) => Promise<void>;
};

const REQUIRED_DEPENDENCY_KEYS: (keyof ExportDependencies)[] = [
  "cacheDirectory",
  "isAvailableAsync",
  "loadGoals",
  "loadSettings",
  "now",
  "shareAsync",
  "writeAsStringAsync"
];

function hasAllDependencies(dependencies: Partial<ExportDependencies>): dependencies is ExportDependencies {
  return REQUIRED_DEPENDENCY_KEYS.every((key) => dependencies[key] !== undefined);
}

// Loaded lazily (and only when a caller relies on the real, on-device implementations) via
// require() so that pulling in expo-file-system/expo-sharing/AsyncStorage doesn't break
// non-RN test environments that never exercise this code path.
/* eslint-disable @typescript-eslint/no-var-requires */
function createDefaultDependencies(): ExportDependencies {
  const FileSystem = require("expo-file-system") as typeof FileSystemModule;
  const Sharing = require("expo-sharing") as typeof SharingModule;
  const { loadGoals, loadSettings } = require("../storage/appStorage") as typeof AppStorageModule;

  return {
    cacheDirectory: FileSystem.cacheDirectory,
    isAvailableAsync: Sharing.isAvailableAsync,
    loadGoals,
    loadSettings,
    now: () => new Date(),
    shareAsync: (uri, options) => Sharing.shareAsync(uri, options),
    writeAsStringAsync: (uri, contents) =>
      FileSystem.writeAsStringAsync(uri, contents, { encoding: FileSystem.EncodingType.UTF8 })
  };
}
/* eslint-enable @typescript-eslint/no-var-requires */

export function buildExportData(goals: Goal[], settings: AppSettings, now: Date): ExportData {
  return {
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    goals,
    settings
  };
}

export function getExportFileName(now: Date): string {
  const isoDate = now.toISOString().slice(0, 10);

  return `unpeeky-backup-${isoDate}.json`;
}

export async function exportGoals(dependencies: Partial<ExportDependencies> = {}): Promise<void> {
  const deps: ExportDependencies = hasAllDependencies(dependencies)
    ? dependencies
    : { ...createDefaultDependencies(), ...dependencies };

  if (!deps.cacheDirectory) {
    throw new Error("Export directory is unavailable on this device.");
  }

  const [goals, settings] = await Promise.all([deps.loadGoals(), deps.loadSettings()]);
  const now = deps.now();
  const exportData = buildExportData(goals, settings, now);
  const fileName = getExportFileName(now);
  const fileUri = `${deps.cacheDirectory}${fileName}`;

  await deps.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));

  const isSharingAvailable = await deps.isAvailableAsync();

  if (!isSharingAvailable) {
    throw new Error("Sharing is not available on this device.");
  }

  await deps.shareAsync(fileUri, {
    dialogTitle: fileName,
    mimeType: "application/json",
    UTI: "public.json"
  });
}
