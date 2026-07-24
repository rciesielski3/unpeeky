import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { migrateSettingsV1ToV2, migrateGoalsV1ToV2, removeOrphanedGoals } from "./appStorage";
import type { Goal } from "../domain/goal";

describe("AppSettings migration", () => {
  it("should migrate v0.1.12 single-child to v0.1.13 multi-child schema", () => {
    const oldSettings = {
      childName: "Alex",
      parentLabel: "Mom",
      notificationTime: "18:00",
      parentPin: "1234",
      isPremium: false,
      tileColorId: "lavender",
      appMode: "singleDevice" as const
    };

    const migrated = migrateSettingsV1ToV2(oldSettings);

    assert.equal(migrated.children.length, 1);
    assert.equal(migrated.children[0]?.name, "Alex");
    assert.equal(migrated.children[0]?.settings.parentLabel, "Mom");
    assert.equal(migrated.globalSettings.pin, "1234");
  });

  it("should handle missing childName gracefully", () => {
    const oldSettings = {
      parentLabel: "Parent",
      notificationTime: "18:00",
      parentPin: "1234",
      isPremium: false,
      tileColorId: "lavender",
      appMode: "singleDevice" as const
    };

    const migrated = migrateSettingsV1ToV2(oldSettings);
    assert.equal(migrated.children[0]?.name, "Dziecko"); // Polish fallback
  });
});

describe("Goal migration", () => {
  it("should assign childId to goals from v0.1.12 migration", () => {
    const oldGoals = [
      {
        id: "g1",
        childName: "Alex",
        rewardName: "Cake",
        imageUri: "uri",
        totalTasks: 16,
        completedTasks: 0,
        revealOrder: [0, 1, 2],
        avatarId: "dino",
        createdAt: "2026-01-01T00:00:00Z",
        completed: false
        // No childId
      }
    ] as Omit<Goal, "childId">[];
    const migratedChildId = "child-12345";

    const migratedGoals = migrateGoalsV1ToV2(oldGoals, migratedChildId);

    assert.equal(migratedGoals.length, 1);
    assert.equal(migratedGoals[0]?.childId, migratedChildId);
  });

  it("should preserve existing childId if already present", () => {
    const oldGoals = [
      {
        id: "g1",
        childId: "child-existing",
        childName: "Alex",
        rewardName: "Cake",
        imageUri: "uri",
        totalTasks: 16,
        completedTasks: 0,
        revealOrder: [0, 1, 2],
        avatarId: "dino",
        createdAt: "2026-01-01T00:00:00Z",
        completed: false
      }
    ] as Goal[];
    const migratedChildId = "child-12345";

    const migratedGoals = migrateGoalsV1ToV2(oldGoals, migratedChildId);

    assert.equal(migratedGoals[0]?.childId, "child-existing");
  });

  it("should remove orphaned goals (childId doesn't exist in children)", () => {
    const goals = [
      {
        id: "g1",
        childId: "child-1",
        childName: "Alex",
        rewardName: "Cake",
        imageUri: "uri",
        totalTasks: 16,
        completedTasks: 0,
        revealOrder: [0, 1, 2],
        avatarId: "dino",
        createdAt: "2026-01-01T00:00:00Z",
        completed: false
      },
      {
        id: "g2",
        childId: "child-orphan",
        childName: "Bob",
        rewardName: "Cookies",
        imageUri: "uri",
        totalTasks: 12,
        completedTasks: 2,
        revealOrder: [0, 1, 2],
        avatarId: "dino",
        createdAt: "2026-01-01T00:00:00Z",
        completed: false
      }
    ] as Goal[];
    const children = [
      {
        id: "child-1",
        name: "Alex",
        settings: { parentLabel: "Parent", notificationTime: "18:00", tileColorId: "lavender" as const }
      }
    ];

    const cleaned = removeOrphanedGoals(goals, children);

    assert.equal(cleaned.length, 1);
    assert.equal(cleaned[0]?.id, "g1");
  });

  it("should keep all goals if all childIds are valid", () => {
    const goals = [
      {
        id: "g1",
        childId: "child-1",
        childName: "Alex",
        rewardName: "Cake",
        imageUri: "uri",
        totalTasks: 16,
        completedTasks: 0,
        revealOrder: [0, 1, 2],
        avatarId: "dino",
        createdAt: "2026-01-01T00:00:00Z",
        completed: false
      },
      {
        id: "g2",
        childId: "child-2",
        childName: "Bob",
        rewardName: "Cookies",
        imageUri: "uri",
        totalTasks: 12,
        completedTasks: 2,
        revealOrder: [0, 1, 2],
        avatarId: "dino",
        createdAt: "2026-01-01T00:00:00Z",
        completed: false
      }
    ] as Goal[];
    const children = [
      {
        id: "child-1",
        name: "Alex",
        settings: { parentLabel: "Parent", notificationTime: "18:00", tileColorId: "lavender" as const }
      },
      {
        id: "child-2",
        name: "Bob",
        settings: { parentLabel: "Parent", notificationTime: "18:00", tileColorId: "lavender" as const }
      }
    ];

    const cleaned = removeOrphanedGoals(goals, children);

    assert.equal(cleaned.length, 2);
  });
});
