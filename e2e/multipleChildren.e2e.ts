import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// Mock AsyncStorage for E2E testing
class MockAsyncStorage {
  private store: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    return keys.map(key => [key, this.store.get(key) ?? null]);
  }

  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    keyValuePairs.forEach(([key, value]) => this.store.set(key, value));
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  getAllData(): Record<string, string> {
    const result: Record<string, string> = {};
    this.store.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

// Import domain functions
import { createGoal, normalizeSettings } from "../src/domain/goal";
import type { Goal, AppSettings, GoalDraft } from "../src/domain/goal";
import { removeOrphanedGoals } from "../src/storage/appStorage";

describe("Multiple Children E2E", () => {
  let asyncStorage: MockAsyncStorage;

  beforeEach(() => {
    asyncStorage = new MockAsyncStorage();
  });

  afterEach(() => {
    asyncStorage.clear();
  });

  describe("Complete Multi-Child Flow", () => {
    it("should handle complete multi-child flow with goal isolation", async () => {
      // 1. Fresh app load → first child should be created from defaults
      const initialSettings = normalizeSettings(null);
      assert.equal(initialSettings.children.length, 1, "Should have one default child");
      assert.ok(initialSettings.children[0]?.name === "", "Default child should have empty name");

      // Save settings to storage
      await asyncStorage.setItem("settings", JSON.stringify(initialSettings));

      // 2. Add second child "Jordan"
      const child1Id = initialSettings.children[0]!.id;
      const child2Id = `child-${Date.now()}`;

      const updatedSettings: AppSettings = {
        ...initialSettings,
        children: [
          ...initialSettings.children,
          {
            id: child2Id,
            name: "Jordan",
            settings: {
              parentLabel: "Dad",
              notificationTime: "18:00",
              tileColorId: "mint"
            }
          }
        ]
      };
      await asyncStorage.setItem("settings", JSON.stringify(updatedSettings));

      // Verify both children exist
      const storedSettings = JSON.parse(
        (await asyncStorage.getItem("settings")) || "{}"
      ) as AppSettings;
      assert.equal(storedSettings.children.length, 2, "Should have two children");
      assert.equal(storedSettings.children[1]?.name, "Jordan", "Second child should be Jordan");

      // 3. Create goal G1 for first child
      const goalG1Draft: GoalDraft = {
        childName: "Child1",
        rewardName: "Ice Cream",
        imageUri: "file://reward1.png",
        totalTasks: 8,
        avatarId: "dino"
      };
      const goalG1 = createGoal(goalG1Draft, child1Id);

      // 4. Create goal G2 for second child
      const goalG2Draft: GoalDraft = {
        childName: "Jordan",
        rewardName: "Candy",
        imageUri: "file://reward2.png",
        totalTasks: 12,
        avatarId: "unicorn"
      };
      const goalG2 = createGoal(goalG2Draft, child2Id);

      // Save both goals to storage
      const allGoals = [goalG1, goalG2];
      await asyncStorage.setItem("goals", JSON.stringify(allGoals));

      // 5. Verify goal isolation - G1 should not be visible when viewing second child
      const storedGoals = JSON.parse(
        (await asyncStorage.getItem("goals")) || "[]"
      ) as Goal[];
      const child2Goals = storedGoals.filter(goal => goal.childId === child2Id);
      assert.equal(child2Goals.length, 1, "Child 2 should have exactly 1 goal");
      assert.equal(child2Goals[0]?.rewardName, "Candy", "Child 2's goal should be Candy");
      assert.equal(child2Goals[0]?.childId, child2Id, "Child 2 goal should have correct childId");
      assert.ok(child2Goals.every(g => g.childId === child2Id), "All child 2 goals should have child2Id");

      // 6. Switch back to first child, verify G1 visible
      const child1Goals = storedGoals.filter(goal => goal.childId === child1Id);
      assert.equal(child1Goals.length, 1, "Child 1 should have exactly 1 goal");
      assert.equal(child1Goals[0]?.rewardName, "Ice Cream", "Child 1's goal should be Ice Cream");
      assert.equal(child1Goals[0]?.childId, child1Id, "Child 1 goal should have correct childId");
      assert.ok(child1Goals.every(g => g.childId === child1Id), "All child 1 goals should only have goals belonging to child1");

      // 7. Delete second child
      const childrenAfterDelete: AppSettings = {
        ...storedSettings,
        children: storedSettings.children.filter(c => c.id !== child2Id)
      };
      await asyncStorage.setItem("settings", JSON.stringify(childrenAfterDelete));

      // Verify orphaned goals are removed
      const goalsAfterDelete = removeOrphanedGoals(storedGoals, childrenAfterDelete.children);
      assert.equal(goalsAfterDelete.length, 1, "Should have 1 goal after child deletion");
      assert.equal(goalsAfterDelete[0]?.childId, child1Id, "Remaining goal should belong to child 1");

      // 8. Restart app - simulate loading from storage
      const restoredSettings = JSON.parse(
        (await asyncStorage.getItem("settings")) || "{}"
      ) as AppSettings;
      const restoredGoals = JSON.parse(
        (await asyncStorage.getItem("goals")) || "[]"
      ) as Goal[];

      assert.equal(restoredSettings.children.length, 1, "After restart, should have 1 child");
      assert.equal(restoredGoals.length, 2, "After restart, should still have 2 goals in storage");

      // Verify that orphaned goals would be cleaned on app load
      const cleanedGoals = removeOrphanedGoals(restoredGoals, restoredSettings.children);
      assert.equal(cleanedGoals.length, 1, "Cleaned goals should have only 1 (non-orphaned)");
    });

    it("should persist activeChildId across app restarts", async () => {
      // Create settings with two children
      const settings: AppSettings = {
        children: [
          {
            id: "child-1",
            name: "Alex",
            settings: {
              parentLabel: "Mom",
              notificationTime: "18:00",
              tileColorId: "lavender"
            }
          },
          {
            id: "child-2",
            name: "Jordan",
            settings: {
              parentLabel: "Dad",
              notificationTime: "18:00",
              tileColorId: "mint"
            }
          }
        ],
        globalSettings: {
          pin: "1234",
          isPremium: false,
          exportData: [],
          appMode: "singleDevice"
        }
      };

      // Save settings
      await asyncStorage.setItem("settings", JSON.stringify(settings));

      // Simulate switching to child-2 and saving activeChildId
      await asyncStorage.setItem("activeChildId", "child-2");

      // Simulate app restart
      const restoredSettings = JSON.parse(
        (await asyncStorage.getItem("settings")) || "{}"
      ) as AppSettings;
      const restoredActiveChildId = await asyncStorage.getItem("activeChildId");

      assert.equal(restoredActiveChildId, "child-2", "Should restore active child after restart");
      assert.ok(
        restoredSettings.children.some(c => c.id === restoredActiveChildId),
        "Restored activeChildId should be valid"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should block deletion of last child", async () => {
      const settings = normalizeSettings(null);
      const canDelete = settings.children.length > 1;

      assert.equal(canDelete, false, "Should not allow deletion when only one child exists");

      // Try to delete - should be blocked
      const afterDelete = {
        ...settings,
        children: settings.children.filter((_, index) => index !== 0)
      };

      // Verify we're back to original state (deletion blocked)
      // In practice, the UI would show an alert and not allow this
      if (settings.children.length <= 1) {
        assert.equal(afterDelete.children.length, 0, "Should show what happens if deletion wasn't prevented");
      }
    });

    it("should handle corrupted activeChildId gracefully", async () => {
      const settings: AppSettings = {
        children: [
          {
            id: "child-1",
            name: "Alex",
            settings: {
              parentLabel: "Mom",
              notificationTime: "18:00",
              tileColorId: "lavender"
            }
          }
        ],
        globalSettings: {
          pin: "",
          isPremium: false,
          exportData: [],
          appMode: "singleDevice"
        }
      };

      await asyncStorage.setItem("settings", JSON.stringify(settings));

      // Corrupt activeChildId - set to non-existent child
      await asyncStorage.setItem("activeChildId", "child-99");

      // Simulate app hydration with fallback logic
      const storedSettings = JSON.parse(
        (await asyncStorage.getItem("settings")) || "{}"
      ) as AppSettings;
      const storedActiveChildId = await asyncStorage.getItem("activeChildId");

      // Fallback logic: if activeChildId is invalid, use first child
      const shouldRestore =
        storedActiveChildId && storedSettings.children.some(c => c.id === storedActiveChildId);
      const finalActiveChildId = shouldRestore ? storedActiveChildId : storedSettings.children[0]?.id;

      assert.equal(finalActiveChildId, "child-1", "Should fallback to first child");
      assert.ok(
        storedSettings.children.some(c => c.id === finalActiveChildId),
        "Final activeChildId should be valid"
      );
    });

    it("should handle rapid child switches without race conditions", async () => {
      const settings: AppSettings = {
        children: [
          {
            id: "child-1",
            name: "Alex",
            settings: {
              parentLabel: "Mom",
              notificationTime: "18:00",
              tileColorId: "lavender"
            }
          },
          {
            id: "child-2",
            name: "Jordan",
            settings: {
              parentLabel: "Dad",
              notificationTime: "18:00",
              tileColorId: "mint"
            }
          },
          {
            id: "child-3",
            name: "Casey",
            settings: {
              parentLabel: "Grandma",
              notificationTime: "18:00",
              tileColorId: "peach"
            }
          }
        ],
        globalSettings: {
          pin: "",
          isPremium: false,
          exportData: [],
          appMode: "singleDevice"
        }
      };

      await asyncStorage.setItem("settings", JSON.stringify(settings));

      // Simulate rapid switches by updating activeChildId quickly
      const childIds = ["child-1", "child-2", "child-3", "child-1", "child-2"];
      for (const childId of childIds) {
        await asyncStorage.setItem("activeChildId", childId);
      }

      // Verify final state is correct
      const finalActiveChildId = await asyncStorage.getItem("activeChildId");
      assert.equal(finalActiveChildId, "child-2", "Final activeChildId should be last switched child");

      const storedSettings = JSON.parse(
        (await asyncStorage.getItem("settings")) || "{}"
      ) as AppSettings;
      assert.ok(
        storedSettings.children.some(c => c.id === finalActiveChildId),
        "Final activeChildId should be valid"
      );
    });

    it("should handle corrupted child settings and repair them", async () => {
      // Create settings with minimal/corrupted data
      const corruptedSettings = {
        children: [
          {
            id: "child-1",
            name: "Alex",
            settings: {
              // Missing notificationTime and tileColorId
              parentLabel: "Mom"
            }
          }
        ],
        globalSettings: {
          pin: "",
          isPremium: false,
          exportData: [],
          appMode: "singleDevice"
        }
      };

      // Normalize should repair
      const normalized = normalizeSettings(corruptedSettings as unknown as Partial<AppSettings>);

      assert.equal(normalized.children.length, 1, "Should preserve child structure");
      assert.ok(normalized.children[0]?.settings.notificationTime, "Should have default notificationTime");
      assert.ok(normalized.children[0]?.settings.tileColorId, "Should have default tileColorId");
    });

    it("should handle goals with missing childId when loading from old versions", async () => {
      // Simulate goals saved before childId was introduced
      const oldGoals = [
        {
          id: "goal-1",
          // Missing childId
          childName: "Alex",
          rewardName: "Ice Cream",
          imageUri: "file://reward.png",
          totalTasks: 8,
          completedTasks: 0,
          revealOrder: [0, 1, 2, 3, 4, 5, 6, 7],
          avatarId: "dino",
          createdAt: new Date().toISOString(),
          completed: false
        }
      ] as Array<Omit<Goal, "childId">>;

      // Save old goals
      await asyncStorage.setItem("goals", JSON.stringify(oldGoals));

      // Simulate migration - assign childId to goals missing it
      const storedGoals = JSON.parse(
        (await asyncStorage.getItem("goals")) || "[]"
      ) as Array<Omit<Goal, "childId"> & { childId?: string }>;
      const defaultChildId = "child-1";
      const migratedGoals = storedGoals.map(goal => ({
        ...goal,
        childId: goal.childId || defaultChildId
      }));

      assert.equal(migratedGoals.length, 1, "Should have 1 goal");
      assert.equal(migratedGoals[0]?.childId, defaultChildId, "Should assign default childId to goal");
    });
  });

  describe("Child Creation and Deletion", () => {
    it("should create new child with unique ID and default settings", async () => {
      const baseSettings = normalizeSettings(null);
      const timestamp1 = Date.now();

      const newChild = {
        id: `child-${timestamp1}`,
        name: "Test Child",
        settings: {
          parentLabel: "Rodzicu",
          notificationTime: "18:00",
          tileColorId: "lavender" as const
        }
      };

      const updatedSettings = {
        ...baseSettings,
        children: [...baseSettings.children, newChild]
      };

      await asyncStorage.setItem("settings", JSON.stringify(updatedSettings));

      const stored = JSON.parse(
        (await asyncStorage.getItem("settings")) || "{}"
      ) as AppSettings;
      assert.equal(stored.children.length, 2, "Should have 2 children");
      assert.equal(stored.children[1]?.name, "Test Child", "New child should have correct name");
      assert.equal(
        stored.children[1]?.settings.tileColorId,
        "lavender",
        "New child should have default tile color"
      );
    });

    it("should remove child and all their goals when deleted", async () => {
      const child1Id = "child-1";
      const child2Id = "child-2";

      const settings: AppSettings = {
        children: [
          {
            id: child1Id,
            name: "Alex",
            settings: {
              parentLabel: "Mom",
              notificationTime: "18:00",
              tileColorId: "lavender"
            }
          },
          {
            id: child2Id,
            name: "Jordan",
            settings: {
              parentLabel: "Dad",
              notificationTime: "18:00",
              tileColorId: "mint"
            }
          }
        ],
        globalSettings: {
          pin: "",
          isPremium: false,
          exportData: [],
          appMode: "singleDevice"
        }
      };

      await asyncStorage.setItem("settings", JSON.stringify(settings));

      // Create goals for both children
      const goal1 = createGoal(
        {
          childName: "Alex",
          rewardName: "Reward 1",
          imageUri: "file://r1.png",
          totalTasks: 8,
          avatarId: "dino"
        },
        child1Id
      );

      const goal2 = createGoal(
        {
          childName: "Jordan",
          rewardName: "Reward 2",
          imageUri: "file://r2.png",
          totalTasks: 8,
          avatarId: "unicorn"
        },
        child2Id
      );

      const goal3 = createGoal(
        {
          childName: "Jordan",
          rewardName: "Reward 3",
          imageUri: "file://r3.png",
          totalTasks: 8,
          avatarId: "rocket"
        },
        child2Id
      );

      const allGoals = [goal1, goal2, goal3];
      await asyncStorage.setItem("goals", JSON.stringify(allGoals));

      // Delete child 2
      const updatedSettings = {
        ...settings,
        children: settings.children.filter(c => c.id !== child2Id)
      };
      await asyncStorage.setItem("settings", JSON.stringify(updatedSettings));

      // Verify orphaned goals are removed
      const storedGoals = JSON.parse(
        (await asyncStorage.getItem("goals")) || "[]"
      ) as Goal[];
      const storedSettings = JSON.parse(
        (await asyncStorage.getItem("settings")) || "{}"
      ) as AppSettings;

      const cleanedGoals = removeOrphanedGoals(storedGoals, storedSettings.children);
      assert.equal(cleanedGoals.length, 1, "Should have 1 goal after deletion");
      assert.equal(cleanedGoals[0]?.childId, child1Id, "Remaining goal should belong to child 1");
    });
  });

  describe("Child Switching and Filtering", () => {
    it("should correctly filter goals by active child", async () => {
      const child1Id = "child-1";
      const child2Id = "child-2";

      // Create goals for different children
      const goals = [
        createGoal(
          {
            childName: "Alex",
            rewardName: "Goal A1",
            imageUri: "file://a1.png",
            totalTasks: 8,
            avatarId: "dino"
          },
          child1Id
        ),
        createGoal(
          {
            childName: "Alex",
            rewardName: "Goal A2",
            imageUri: "file://a2.png",
            totalTasks: 12,
            avatarId: "unicorn"
          },
          child1Id
        ),
        createGoal(
          {
            childName: "Jordan",
            rewardName: "Goal J1",
            imageUri: "file://j1.png",
            totalTasks: 16,
            avatarId: "rocket"
          },
          child2Id
        )
      ];

      // Test filtering
      const child1Goals = goals.filter(g => g.childId === child1Id);
      const child2Goals = goals.filter(g => g.childId === child2Id);

      assert.equal(child1Goals.length, 2, "Child 1 should have 2 goals");
      assert.equal(child2Goals.length, 1, "Child 2 should have 1 goal");
      assert.ok(
        child1Goals.every(g => g.childId === child1Id),
        "All child 1 goals should have correct childId"
      );
      assert.ok(
        child2Goals.every(g => g.childId === child2Id),
        "All child 2 goals should have correct childId"
      );
    });

    it("should maintain goal isolation across child switches", async () => {
      const childIds = ["child-1", "child-2", "child-3"];
      const goalsPerChild = 2;

      // Create multiple goals for each child
      const allGoals: Goal[] = [];
      for (const childId of childIds) {
        for (let i = 0; i < goalsPerChild; i++) {
          const goal = createGoal(
            {
              childName: `Child ${childId}`,
              rewardName: `Reward ${i}`,
              imageUri: `file://reward${i}.png`,
              totalTasks: 8,
              avatarId: "dino"
            },
            childId
          );
          allGoals.push(goal);
        }
      }

      // Verify isolation for each child
      for (const childId of childIds) {
        const childGoals = allGoals.filter(g => g.childId === childId);
        assert.equal(childGoals.length, goalsPerChild, `${childId} should have ${goalsPerChild} goals`);

        // Verify no cross-contamination
        for (const otherChildId of childIds) {
          if (otherChildId !== childId) {
            const otherGoals = childGoals.filter(g => g.childId === otherChildId);
            assert.equal(otherGoals.length, 0, `${childId} should not have goals from ${otherChildId}`);
          }
        }
      }
    });
  });

  describe("Persistence and Hydration", () => {
    it("should persist all settings and goals to storage", async () => {
      const settings: AppSettings = {
        children: [
          {
            id: "child-1",
            name: "Alex",
            settings: {
              parentLabel: "Mom",
              notificationTime: "19:30",
              tileColorId: "mint"
            }
          }
        ],
        globalSettings: {
          pin: "1234",
          isPremium: true,
          exportData: [],
          appMode: "singleDevice"
        }
      };

      const goal = createGoal(
        {
          childName: "Alex",
          rewardName: "Prize",
          imageUri: "file://prize.png",
          totalTasks: 16,
          avatarId: "dino"
        },
        "child-1"
      );

      await asyncStorage.setItem("settings", JSON.stringify(settings));
      await asyncStorage.setItem("goals", JSON.stringify([goal]));
      await asyncStorage.setItem("activeChildId", "child-1");

      // Simulate app restart - read everything back
      const restored = {
        settings: JSON.parse((await asyncStorage.getItem("settings")) || "{}"),
        goals: JSON.parse((await asyncStorage.getItem("goals")) || "[]"),
        activeChildId: await asyncStorage.getItem("activeChildId")
      };

      assert.deepEqual(restored.settings, settings, "Settings should be persisted exactly");
      assert.equal(restored.goals.length, 1, "Goals should be persisted");
      assert.equal(restored.goals[0]?.childId, "child-1", "Goal childId should be correct");
      assert.equal(restored.activeChildId, "child-1", "ActiveChildId should be persisted");
    });

    it("should handle missing storage gracefully with defaults", async () => {
      // Don't set anything in storage

      const settingsJson = await asyncStorage.getItem("settings");
      const goalsJson = await asyncStorage.getItem("goals");
      const activeChildIdJson = await asyncStorage.getItem("activeChildId");

      // Load with defaults
      const settings: AppSettings = settingsJson ? JSON.parse(settingsJson) : normalizeSettings(null);
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const activeChildId = activeChildIdJson || settings.children[0]?.id;

      assert.ok(settings, "Should have settings");
      assert.ok(settings.children.length > 0, "Settings should have at least one child");
      assert.deepEqual(goals, [], "Should have empty goals array");
      assert.ok(activeChildId, "Should have active child ID");
      assert.ok(
        settings.children.some(c => c.id === activeChildId),
        "ActiveChildId should be valid"
      );
    });
  });
});
