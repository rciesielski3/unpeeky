import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildExportData, EXPORT_VERSION, exportGoals, getExportFileName } from "./exportService";
import { DEFAULT_APP_SETTINGS } from "../domain/goal";
import type { Goal } from "../domain/goal";

const sampleGoal: Goal = {
  id: "1",
  childName: "Kuba",
  rewardName: "Hulajnoga",
  imageUri: "file://reward.jpg",
  totalTasks: 16,
  completedTasks: 4,
  revealOrder: [0, 1, 2, 3],
  avatarId: "dino",
  createdAt: "2026-01-01T00:00:00.000Z",
  completed: false
};

describe("exportService", () => {
  it("builds export data with version, timestamp, goals and settings", () => {
    const now = new Date("2026-07-08T12:00:00.000Z");
    const exportData = buildExportData([sampleGoal], DEFAULT_APP_SETTINGS, now);

    assert.equal(exportData.version, EXPORT_VERSION);
    assert.equal(exportData.exportedAt, now.toISOString());
    assert.deepEqual(exportData.goals, [sampleGoal]);
    assert.deepEqual(exportData.settings, DEFAULT_APP_SETTINGS);
  });

  it("names the backup file after today's date", () => {
    const now = new Date("2026-07-08T12:00:00.000Z");

    assert.equal(getExportFileName(now), "unpeeky-backup-2026-07-08.json");
  });

  it("writes the export JSON to the cache directory and shares it via the OS share sheet", async () => {
    const writtenFiles: { uri: string; contents: string }[] = [];
    const sharedCalls: { uri: string; options: unknown }[] = [];

    await exportGoals({
      cacheDirectory: "file:///cache/",
      isAvailableAsync: async () => true,
      loadGoals: async () => [sampleGoal],
      loadSettings: async () => DEFAULT_APP_SETTINGS,
      now: () => new Date("2026-07-08T12:00:00.000Z"),
      shareAsync: async (uri, options) => {
        sharedCalls.push({ uri, options });
      },
      writeAsStringAsync: async (uri, contents) => {
        writtenFiles.push({ uri, contents });
      }
    });

    assert.equal(writtenFiles.length, 1);
    assert.equal(writtenFiles[0]?.uri, "file:///cache/unpeeky-backup-2026-07-08.json");

    const parsed = JSON.parse(writtenFiles[0]?.contents ?? "{}");

    assert.equal(parsed.version, EXPORT_VERSION);
    assert.equal(parsed.exportedAt, "2026-07-08T12:00:00.000Z");
    assert.deepEqual(parsed.goals, [sampleGoal]);
    assert.deepEqual(parsed.settings, DEFAULT_APP_SETTINGS);

    assert.equal(sharedCalls.length, 1);
    assert.equal(sharedCalls[0]?.uri, "file:///cache/unpeeky-backup-2026-07-08.json");
  });

  it("throws when the OS share sheet is unavailable", async () => {
    await assert.rejects(() =>
      exportGoals({
        cacheDirectory: "file:///cache/",
        isAvailableAsync: async () => false,
        loadGoals: async () => [],
        loadSettings: async () => DEFAULT_APP_SETTINGS,
        now: () => new Date("2026-07-08T12:00:00.000Z"),
        shareAsync: async () => {},
        writeAsStringAsync: async () => {}
      })
    );
  });

  it("throws when the cache directory is unavailable", async () => {
    await assert.rejects(() =>
      exportGoals({
        cacheDirectory: null,
        isAvailableAsync: async () => true,
        loadGoals: async () => [],
        loadSettings: async () => DEFAULT_APP_SETTINGS,
        now: () => new Date("2026-07-08T12:00:00.000Z"),
        shareAsync: async () => {},
        writeAsStringAsync: async () => {}
      })
    );
  });
});
