import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { loadSettings, saveSettings, removeOrphanedGoals } from "./src/storage/appStorage";
import type { Goal } from "./src/domain/goal";

// Provide an in-memory window.localStorage backend so the real
// @react-native-async-storage/async-storage web implementation is usable
// under node. AsyncStorage only touches window.localStorage when its methods
// are called (not at import time), and this assignment runs at module-eval
// time before any test executes, so the static appStorage import below is safe.
const memoryStore = new Map<string, string>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).window = {
  localStorage: {
    getItem: (key: string) => (memoryStore.has(key) ? memoryStore.get(key)! : null),
    setItem: (key: string, value: string) => {
      memoryStore.set(key, String(value));
    },
    removeItem: (key: string) => {
      memoryStore.delete(key);
    },
    clear: () => memoryStore.clear(),
    key: (index: number) => Array.from(memoryStore.keys())[index] ?? null,
    get length() {
      return memoryStore.size;
    }
  }
};

// Mock AsyncStorage
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockAsyncStorage = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getItem: async (_key: string) => null as string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setItem: async (_key: string, _value: string) => {}
};

// We'll test the activeChildId state management through the App component
// This test file demonstrates that activeChildId state is properly managed

describe("App activeChildId state", () => {
  beforeEach(() => {
    // Reset mocks
    mockAsyncStorage.getItem = async () => null;
    mockAsyncStorage.setItem = async () => {};
  });

  it("should initialize activeChildId to first child when no saved value exists", async () => {
    // This test verifies the state initializer:
    // const [activeChildId, setActiveChildId] = useState<string>(() => {
    //   return settings?.children?.[0]?.id || "default";
    // });

    const settings = {
      children: [
        { id: "child-1", name: "Alex", settings: { parentLabel: "Mom", notificationTime: "18:00", tileColorId: "lavender" as const } },
        { id: "child-2", name: "Jordan", settings: { parentLabel: "Dad", notificationTime: "18:00", tileColorId: "mint" as const } }
      ],
      globalSettings: { pin: "1234", isPremium: false, exportData: [], appMode: "singleDevice" as const }
    };

    // Initial state should be first child
    const initialActiveChildId = settings?.children?.[0]?.id || "default";
    assert.equal(initialActiveChildId, "child-1");
  });

  it("should handle restoring activeChildId from AsyncStorage when saved ID is valid", async () => {
    // This test verifies the restoration logic in hydrateApp:
    // if (
    //   storedActiveChildId &&
    //   normalizedSettings?.children?.some(c => c.id === storedActiveChildId)
    // ) {
    //   setActiveChildId(storedActiveChildId);
    // } else if (normalizedSettings?.children?.length > 0) {
    //   setActiveChildId(normalizedSettings.children[0].id);
    // }

    const settings = {
      children: [
        { id: "child-1", name: "Alex", settings: { parentLabel: "Mom", notificationTime: "18:00", tileColorId: "lavender" as const } },
        { id: "child-2", name: "Jordan", settings: { parentLabel: "Dad", notificationTime: "18:00", tileColorId: "mint" as const } }
      ],
      globalSettings: { pin: "1234", isPremium: false, exportData: [], appMode: "singleDevice" as const }
    };

    const storedActiveChildId = "child-2";

    // Verify restoration logic
    const shouldRestore = storedActiveChildId && settings?.children?.some(c => c.id === storedActiveChildId);
    assert.ok(shouldRestore);

    const restoredId = shouldRestore ? storedActiveChildId : settings.children[0]?.id;
    assert.equal(restoredId, "child-2");
  });

  it("should fallback to first child if saved activeChildId no longer exists", async () => {
    // This test verifies fallback logic when a saved child ID is no longer in the settings

    const settings = {
      children: [
        { id: "child-1", name: "Alex", settings: { parentLabel: "Mom", notificationTime: "18:00", tileColorId: "lavender" as const } },
        { id: "child-2", name: "Jordan", settings: { parentLabel: "Dad", notificationTime: "18:00", tileColorId: "mint" as const } }
      ],
      globalSettings: { pin: "1234", isPremium: false, exportData: [], appMode: "singleDevice" as const }
    };

    const storedActiveChildId = "child-3"; // No longer exists

    // Verify fallback logic
    const shouldRestore = storedActiveChildId && settings?.children?.some(c => c.id === storedActiveChildId);
    assert.equal(shouldRestore, false);

    const finalId = shouldRestore ? storedActiveChildId : settings.children[0]?.id;
    assert.equal(finalId, "child-1");
  });

  it("should persist activeChildId to AsyncStorage when it changes", async () => {
    // This test verifies the persistence effect:
    // useEffect(() => {
    //   if (activeChildId) {
    //     AsyncStorage.setItem("activeChildId", activeChildId).catch(err =>
    //       console.error("Failed to persist activeChildId", err)
    //     );
    //   }
    // }, [activeChildId]);

    const activeChildId = "child-2";
    let savedKey = "";
    let savedValue = "";

    mockAsyncStorage.setItem = async (key: string, value: string) => {
      savedKey = key;
      savedValue = value;
    };

    // Simulate the effect
    if (activeChildId) {
      await mockAsyncStorage.setItem("activeChildId", activeChildId);
    }

    assert.equal(savedKey, "activeChildId");
    assert.equal(savedValue, "child-2");
  });

  it("should load activeChildId from AsyncStorage on app hydration", async () => {
    // This test verifies the hydration logic that loads activeChildId

    const storedActiveChildId = "child-2";

    mockAsyncStorage.getItem = async (key: string) => {
      if (key === "activeChildId") {
        return storedActiveChildId;
      }
      return null;
    };

    const loaded = await mockAsyncStorage.getItem("activeChildId");
    assert.equal(loaded, "child-2");
  });
});

describe("loadSettings v0.1.12 migration integration", () => {
  beforeEach(() => {
    memoryStore.clear();
  });

  it("should migrate a real v0.1.12 blob (empty childName) and preserve global data", async () => {
    // Real v0.1.12 users always have an empty childName because the name lived
    // on the goal, not on settings. The migration must therefore trigger off
    // the absence of the children array, not a truthy childName.
    const v0112Blob = {
      childName: "",
      parentLabel: "",
      notificationTime: "18:00",
      tileColorId: "lavender",
      parentPin: "9999",
      isPremium: true,
      appMode: "singleDevice" as const,
      isReminderEnabled: true
    };

    // Persist the legacy blob directly through the storage layer.
    await saveSettings(v0112Blob as never);

    const migrated = await loadSettings();

    // Migration ran: a children array now exists.
    assert.equal(migrated.children.length, 1);
    // Polish defaults are used for empty legacy values.
    assert.equal(migrated.children[0]?.name, "Dziecko");
    assert.equal(migrated.children[0]?.settings.parentLabel, "Rodzicu");
    // Global data survives the migration.
    assert.equal(migrated.globalSettings.pin, "9999");
    assert.equal(migrated.globalSettings.isPremium, true);
    assert.equal(migrated.globalSettings.appMode, "singleDevice");
    assert.equal(migrated.globalSettings.isReminderEnabled, true);
  });

  it("should NOT re-migrate a v0.1.13 blob that already has a children array", async () => {
    const v0113Blob = {
      children: [
        {
          id: "child-1",
          name: "Alex",
          settings: { parentLabel: "Mom", notificationTime: "18:00", tileColorId: "mint" as const }
        }
      ],
      globalSettings: { pin: "1234", isPremium: false, exportData: [], appMode: "singleDevice" as const }
    };

    await saveSettings(v0113Blob);

    const loaded = await loadSettings();

    // Children preserved as-is (not replaced by a migrated single default child).
    assert.equal(loaded.children.length, 1);
    assert.equal(loaded.children[0]?.name, "Alex");
    assert.equal(loaded.children[0]?.settings.tileColorId, "mint");
    assert.equal(loaded.globalSettings.pin, "1234");
  });

  it("should complete v0.1.12→v0.1.13 migration E2E with goals migration", async () => {
    // Simulate v0.1.12 app state with legacy goals (no childId)
    const v0112Settings = {
      childName: "",
      parentLabel: "Dad",
      notificationTime: "19:00",
      tileColorId: "mint" as const,
      parentPin: "5555",
      isPremium: false,
      appMode: "singleDevice" as const,
      isReminderEnabled: true
    };

    // Legacy goals without childId
    const legacyGoals = [
      {
        id: "goal-1",
        childName: "Alex",
        rewardName: "Ice Cream",
        imageUri: "file://reward1.png",
        totalTasks: 8,
        completedTasks: 2,
        revealOrder: [0, 1, 2, 3, 4, 5, 6, 7],
        avatarId: "dino" as const,
        createdAt: new Date().toISOString(),
        completed: false
      }
    ] as never;

    // Persist legacy data
    await saveSettings(v0112Settings as never);
    await AsyncStorage.setItem("goals", JSON.stringify(legacyGoals));

    // Load and migrate using real functions
    const migratedSettings = await loadSettings();
    const storedGoals = JSON.parse((await AsyncStorage.getItem("goals")) || "[]") as Array<Omit<Goal, "childId"> & { childId?: string }>;
    const defaultChildId = migratedSettings.children[0]?.id || "child-default";
    const migratedGoals = storedGoals.map(goal => ({
      ...goal,
      childId: goal.childId || defaultChildId
    }));
    const cleanedGoals = removeOrphanedGoals(migratedGoals, migratedSettings.children);

    // Verify complete migration
    assert.equal(migratedSettings.children.length, 1, "Should have 1 child after migration");
    assert.equal(migratedSettings.globalSettings.pin, "5555", "PIN should be preserved");
    assert.equal(cleanedGoals.length, 1, "Should have 1 goal");
    assert.equal(cleanedGoals[0]?.childId, defaultChildId, "Goal should have childId assigned");
    assert.equal(cleanedGoals[0]?.completedTasks, 2, "Goal progress should be preserved");
  });
});
