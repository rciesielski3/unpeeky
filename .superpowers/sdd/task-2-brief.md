# Task 2: Add AppSettings Schema Migration

**Files:**
- Modify: `src/domain/goal.ts:36-65` (AppSettings, ChildSettings, GlobalSettings types)
- Modify: `src/storage/appStorage.ts:1-50` (migration functions, version detection)
- Test: `src/storage/appStorage.test.ts` (new file)

**Interfaces:**
- Consumes: Old AppSettings from v0.1.12 (childName, parentLabel, etc.)
- Produces: New AppSettings type with children array; `migrateSettingsV1ToV2(oldSettings): AppSettings` function

---

## Step 1: Write failing migration test

Create `src/storage/appStorage.test.ts`:

```typescript
describe("AppSettings migration", () => {
  it("should migrate v0.1.12 single-child to v0.1.13 multi-child schema", () => {
    const oldSettings = {
      childName: "Alex",
      parentLabel: "Mom",
      notificationTime: "18:00",
      pin: "1234",
      isPremium: false,
      tileColorId: "lavender",
      appMode: "singleDevice"
    };

    const migrated = migrateSettingsV1ToV2(oldSettings as any);

    expect(migrated.children).toHaveLength(1);
    expect(migrated.children[0].name).toBe("Alex");
    expect(migrated.children[0].settings.parentLabel).toBe("Mom");
    expect(migrated.globalSettings.pin).toBe("1234");
  });

  it("should handle missing childName gracefully", () => {
    const oldSettings = {
      parentLabel: "Parent",
      notificationTime: "18:00",
      pin: "1234",
      isPremium: false,
      tileColorId: "lavender",
      appMode: "singleDevice"
    };

    const migrated = migrateSettingsV1ToV2(oldSettings as any);
    expect(migrated.children[0].name).toBe("Child"); // fallback
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/rafalciesielski/Developer/unpeeky
npm test -- src/storage/appStorage.test.ts 2>&1 | head -30
```

Expected: FAIL — "migrateSettingsV1ToV2 is not defined"

- [ ] **Step 3: Add AppSettings types to src/domain/goal.ts**

Edit `src/domain/goal.ts` after Goal type (around line 36):

```typescript
export type ChildSettings = {
  parentLabel: string;
  notificationTime: string;
  tileColorId: TileColorId;
};

export type GlobalSettings = {
  pin: string;
  isPremium: boolean;
  exportData: Goal[];
  appMode: AppMode;
  isReminderEnabled?: boolean;
};

export type AppSettings = {
  children: Array<{
    id: string;
    name: string;
    settings: ChildSettings;
  }>;
  globalSettings: GlobalSettings;
};
```

- [ ] **Step 4: Add migrateSettingsV1ToV2 to appStorage.ts**

Add to `src/storage/appStorage.ts`:

```typescript
export function migrateSettingsV1ToV2(oldSettings: any): AppSettings {
  const childId = `child-${Date.now()}`;
  return {
    children: [
      {
        id: childId,
        name: oldSettings.childName || "Child",
        settings: {
          parentLabel: oldSettings.parentLabel || "Parent",
          notificationTime: oldSettings.notificationTime || "18:00",
          tileColorId: oldSettings.tileColorId || "lavender"
        }
      }
    ],
    globalSettings: {
      pin: oldSettings.pin || "",
      isPremium: oldSettings.isPremium || false,
      exportData: oldSettings.exportData || [],
      appMode: oldSettings.appMode || "singleDevice",
      isReminderEnabled: oldSettings.isReminderEnabled !== undefined ? oldSettings.isReminderEnabled : false
    }
  };
}
```

- [ ] **Step 5: Update loadSettings to detect and migrate schema**

Edit `src/storage/appStorage.ts` loadSettings function:

```typescript
export async function loadSettings(): Promise<AppSettings> {
  try {
    const settings = await AsyncStorage.getItem("appSettings");
    if (!settings) {
      return normalizeSettings(null);
    }

    const parsed = JSON.parse(settings);

    // Detect v0.1.12 schema (has childName, not children array)
    if (parsed.childName && !parsed.children) {
      return migrateSettingsV1ToV2(parsed);
    }

    // v0.1.13+ schema (has children array)
    return normalizeSettings(parsed);
  } catch (error) {
    console.error("Failed to load settings, creating default", error);
    return normalizeSettings(null);
  }
}
```

- [ ] **Step 6: Update normalizeSettings for new schema**

Edit normalizeSettings to use new AppSettings type. Ensure it returns AppSettings (with children array).

- [ ] **Step 7: Run tests to verify they pass**

```bash
npm test -- src/storage/appStorage.test.ts 2>&1 | grep -E "PASS|FAIL"
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/domain/goal.ts src/storage/appStorage.ts src/storage/appStorage.test.ts
git commit -m "feat: add AppSettings migration v0.1.12 to v0.1.13

- Add ChildSettings and GlobalSettings types
- Update AppSettings to use children array
- Add migrateSettingsV1ToV2() for transparent migration
- Update loadSettings() to detect and migrate old schema
- Add migration tests

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```
