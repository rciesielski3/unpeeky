# Multiple Children Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable parent accounts to independently manage goals for 2+ children, with per-child customization (parent label, notifications, tile color) and transparent migration from single-child v0.1.12 data.

**Architecture:** Add `childId` to Goal model, restructure AppSettings with children array, track active child via root state + AsyncStorage persistence. Migration is transparent (no UI prompts); v0.1.12 single-child data wraps into first child on app launch.

**Tech Stack:** React Native 0.74.5, Expo, AsyncStorage, TypeScript 5.3.3 (strict mode)

## Global Constraints

- **No breaking changes** to Goal logic, AddGoalScreen, ApproveTaskScreen, reward flow
- **Backward compatible** v0.1.12 → v0.1.13 migration (transparent, auto-wrapping)
- **Root state pattern** (no Context; prop drilling)
- **All tests pass** before commit
- **Frequent commits** (one per task)
- **Target release:** v0.1.13 by end of August 2026

---

## Task 1: Update Goal Type with childId Field

**Files:**
- Modify: `src/domain/goal.ts:23-35` (Goal type definition)
- Modify: `src/domain/goal.ts:55-75` (PersistedGoal type, migration helpers)
- Test: `src/domain/goal.test.ts` (new file)

**Interfaces:**
- Consumes: Existing Goal type structure
- Produces: Updated `Goal` type with `childId: string` field; `migrateGoalV1ToV2(oldGoal, childId): Goal` function

---

### Step 1: Write failing test for Goal.childId

Create `src/domain/goal.test.ts`:

```typescript
describe("Goal", () => {
  describe("Goal.childId", () => {
    it("should have childId field", () => {
      const goal = createGoal({
        childName: "Alex",
        rewardName: "Ice Cream",
        imageUri: "...",
        totalTasks: 16,
        avatarId: "avatar-1"
      });
      expect(goal).toHaveProperty("childId");
      expect(typeof goal.childId).toBe("string");
    });

    it("migrateGoalV1ToV2 should assign childId to goal", () => {
      const oldGoal: any = {
        id: "goal-123",
        childName: "Alex",
        rewardName: "Cake",
        imageUri: "...",
        totalTasks: 12,
        completedTasks: 0,
        revealOrder: [0, 1, 2],
        avatarId: "avatar-1",
        createdAt: new Date().toISOString(),
        completed: false
      };
      const migratedGoal = migrateGoalV1ToV2(oldGoal, "child-12345");
      expect(migratedGoal.childId).toBe("child-12345");
      expect(migratedGoal.id).toBe(oldGoal.id);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/rafalciesielski/Developer/unpeeky
npm test -- src/domain/goal.test.ts 2>&1 | head -30
```

Expected: FAIL — "Goal type does not have childId property"

- [ ] **Step 3: Update Goal type to add childId**

Edit `src/domain/goal.ts`, line 23:

```typescript
export type Goal = {
  id: string;
  childId: string;                    // NEW: Links goal to specific child
  childName: string;
  rewardName: string;
  imageUri: string;
  totalTasks: TileCount;
  completedTasks: number;
  revealOrder: number[];
  avatarId: AvatarId;
  createdAt: string;
  completed: boolean;
};
```

- [ ] **Step 4: Add migrateGoalV1ToV2 function**

Add to `src/domain/goal.ts` after createGoal function:

```typescript
export function migrateGoalV1ToV2(oldGoal: Omit<Goal, "childId">, childId: string): Goal {
  return {
    ...oldGoal,
    childId
  };
}
```

- [ ] **Step 5: Update createGoal to require childId (for new goals)**

Edit createGoal signature:

```typescript
export function createGoal(draft: GoalDraft, childId: string, now = new Date()): Goal {
  return {
    ...draft,
    childId,  // NEW: Caller must provide childId
    id: `${now.getTime()}`,
    completedTasks: 0,
    revealOrder: shuffleTileIds(draft.totalTasks),
    createdAt: now.toISOString(),
    completed: false
  };
}
```

Update GoalDraft if needed (likely no change).

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test -- src/domain/goal.test.ts 2>&1 | grep -E "PASS|FAIL|Tests:"
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/domain/goal.ts src/domain/goal.test.ts
git commit -m "feat: add childId field to Goal type

- Add childId: string to Goal model
- Add migrateGoalV1ToV2() helper for migration
- Update createGoal to require childId parameter
- Add tests for childId assignment and migration

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Add AppSettings Schema Migration

**Files:**
- Modify: `src/domain/goal.ts:36-65` (AppSettings, ChildSettings, GlobalSettings types)
- Modify: `src/storage/appStorage.ts:1-50` (migration functions, version detection)
- Test: `src/storage/appStorage.test.ts` (new file)

**Interfaces:**
- Consumes: Old AppSettings from v0.1.12 (childName, parentLabel, etc.)
- Produces: New AppSettings type with children array; `migrateSettingsV1ToV2(oldSettings): AppSettings` function

---

### Step 1: Write failing migration test

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
npm test -- src/storage/appStorage.test.ts 2>&1 | head -30
```

Expected: FAIL — "migrateSettingsV1ToV2 is not defined"

- [ ] **Step 3: Add AppSettings types to src/domain/goal.ts**

Edit `src/domain/goal.ts` after Goal type:

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

---

## Task 3: Update App.tsx State Management

**Files:**
- Modify: `App.tsx:33-100` (root state, hydration, rendering)
- Modify: `App.tsx:useEffect` (add activeChildId persistence)
- Test: `App.test.tsx` (integration test for state)

**Interfaces:**
- Consumes: Updated AppSettings with children array
- Produces: `activeChildId: string` state, `setActiveChildId(id)` function, AsyncStorage save/load

---

### Step 1: Write failing test for activeChildId state

Create `App.test.tsx` (or extend existing):

```typescript
describe("App activeChildId state", () => {
  it("should initialize activeChildId to first child", async () => {
    const settings: AppSettings = {
      children: [
        { id: "child-1", name: "Alex", settings: { ... } },
        { id: "child-2", name: "Jordan", settings: { ... } }
      ],
      globalSettings: { ... }
    };

    // Mock AsyncStorage to return no saved activeChildId
    AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

    // Render App with settings
    // Assert activeChildId is "child-1"
  });

  it("should restore activeChildId from AsyncStorage on app launch", async () => {
    AsyncStorage.getItem = jest.fn().mockResolvedValue("child-2");
    
    // Render App
    // Assert activeChildId is "child-2" after hydration
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- App.test.tsx 2>&1 | head -30
```

Expected: FAIL (state not yet implemented)

- [ ] **Step 3: Add activeChildId state to App.tsx**

Edit `App.tsx` in AppContent, add to useState declarations:

```typescript
const [activeChildId, setActiveChildId] = useState<string>(() => {
  // Initialize to first child; will be overridden by AsyncStorage load
  return settings?.children?.[0]?.id || "default";
});
```

- [ ] **Step 4: Add AsyncStorage persistence effect**

Add new useEffect after the existing hydration useEffect:

```typescript
useEffect(() => {
  if (activeChildId) {
    AsyncStorage.setItem("activeChildId", activeChildId).catch(err =>
      console.error("Failed to persist activeChildId", err)
    );
  }
}, [activeChildId]);
```

- [ ] **Step 5: Add AsyncStorage load to hydration**

Edit the existing hydrateApp function to load activeChildId:

```typescript
async function hydrateApp() {
  try {
    const [storedGoals, storedSettings, storedActiveChildId] = await Promise.all([
      loadGoals(),
      loadSettings(),
      AsyncStorage.getItem("activeChildId")
    ]);

    const normalizedSettings = normalizeSettings(storedSettings);
    setGoals(storedGoals);
    setSettings(normalizedSettings);

    // Restore activeChildId if valid
    if (
      storedActiveChildId &&
      normalizedSettings?.children?.some(c => c.id === storedActiveChildId)
    ) {
      setActiveChildId(storedActiveChildId);
    } else if (normalizedSettings?.children?.length > 0) {
      setActiveChildId(normalizedSettings.children[0].id);
    }

    // ... rest of hydration ...
  } catch (error) {
    // ... existing error handling ...
  }
}
```

- [ ] **Step 6: Pass activeChildId to screens**

Update screen renders to pass activeChildId:

```typescript
{route === "goals" ? (
  <GoalsScreen
    activeChildId={activeChildId}
    onSelectChild={setActiveChildId}
    children={settings?.children || []}
    // ... other props
  />
) : null}

{route === "child" && activeGoal ? (
  <ChildScreen
    activeChildId={activeChildId}
    // ... other props
  />
) : null}

{route === "settings" ? (
  <SettingsScreen
    activeChildId={activeChildId}
    onSelectChild={setActiveChildId}
    children={settings?.children || []}
    onSettingsChange={setSettings}
    // ... other props
  />
) : null}
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npm test -- App.test.tsx 2>&1 | grep -E "PASS|FAIL"
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add App.tsx App.test.tsx
git commit -m "feat: add activeChildId state management with AsyncStorage persistence

- Add activeChildId state initialized to first child
- Save activeChildId to AsyncStorage on change
- Restore activeChildId from AsyncStorage on app launch
- Fallback to first child if saved ID no longer exists
- Pass activeChildId to screens

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Implement GoalsScreen Child Selector

**Files:**
- Modify: `src/screens/GoalsScreen.tsx:1-150` (add child selector, filter goals)
- Test: `src/screens/GoalsScreen.test.tsx` (filtering tests)

**Interfaces:**
- Consumes: `activeChildId: string`, `children: ChildSettings[]`, `onSelectChild(id)`
- Produces: Rendered child selector UI, goals filtered by activeChildId

---

### Step 1: Write failing test for child selector

```typescript
describe("GoalsScreen", () => {
  it("should filter goals by activeChildId", () => {
    const goals = [
      { id: "g1", childId: "child-1", childName: "Alex", ... },
      { id: "g2", childId: "child-2", childName: "Jordan", ... }
    ];

    render(
      <GoalsScreen
        activeChildId="child-1"
        goals={goals}
        // ... other props
      />
    );

    // Assert only g1 is displayed
    expect(screen.queryByText("Goal for g1")).toBeInTheDocument();
    expect(screen.queryByText("Goal for g2")).not.toBeInTheDocument();
  });

  it("should display child selector with active child name", () => {
    const children = [
      { id: "child-1", name: "Alex", settings: { ... } },
      { id: "child-2", name: "Jordan", settings: { ... } }
    ];

    render(
      <GoalsScreen
        activeChildId="child-1"
        children={children}
        // ... other props
      />
    );

    expect(screen.getByText("Alex")).toBeInTheDocument(); // active child name
  });

  it("should call onSelectChild when switching children", () => {
    const onSelectChild = jest.fn();
    const children = [
      { id: "child-1", name: "Alex", ... },
      { id: "child-2", name: "Jordan", ... }
    ];

    render(
      <GoalsScreen
        activeChildId="child-1"
        children={children}
        onSelectChild={onSelectChild}
        // ... other props
      />
    );

    fireEvent.press(screen.getByText("Jordan"));
    expect(onSelectChild).toHaveBeenCalledWith("child-2");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- GoalsScreen.test.tsx 2>&1 | head -30
```

Expected: FAIL (child selector not yet implemented)

- [ ] **Step 3: Add child selector to GoalsScreen**

Edit `src/screens/GoalsScreen.tsx` at the top (after header):

```typescript
type GoalsScreenProps = {
  activeChildId: string;
  onSelectChild: (childId: string) => void;
  children: Array<{ id: string; name: string; settings: ChildSettings }>;
  // ... existing props
};

export function GoalsScreen({
  activeChildId,
  onSelectChild,
  children,
  goals,
  // ... rest of props
}: GoalsScreenProps) {
  const activeChild = children.find(c => c.id === activeChildId);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Child Selector */}
      <View style={styles.childSelector}>
        <Pressable
          onPress={() => {
            // Show child picker (dropdown or modal)
            // For now, simple picker
            Alert.alert(
              "Select Child",
              undefined,
              children.map(child => ({
                text: child.name,
                onPress: () => onSelectChild(child.id)
              }))
            );
          }}
          style={styles.childButton}
        >
          <Text style={styles.childButtonText}>
            {activeChild?.name || "Select Child"}
          </Text>
          <Text style={styles.childButtonSubtitle}>
            {children.length > 1 ? "Tap to switch" : ""}
          </Text>
        </Pressable>
      </View>

      {/* Existing goals list, filtered by activeChildId */}
      <FlatList
        data={goals.filter(g => g.childId === activeChildId)}
        // ... rest of FlatList props
      />
    </SafeAreaView>
  );
}
```

Add styles:

```typescript
const styles = StyleSheet.create({
  childSelector: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  childButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted
  },
  childButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text
  },
  childButtonSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs
  }
  // ... existing styles
});
```

- [ ] **Step 4: Update goals parameter to accept childId**

Ensure all goals have childId. Update any createGoal calls in AddGoalScreen to pass activeChildId:

In `AddGoalScreen`, pass childId to createGoal:

```typescript
const goal = createGoal(draft, activeChildId);  // New: pass activeChildId
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- GoalsScreen.test.tsx 2>&1 | grep -E "PASS|FAIL"
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/screens/GoalsScreen.tsx src/screens/GoalsScreen.test.tsx
git commit -m "feat: add child selector and goal filtering in GoalsScreen

- Add child selector at top of GoalsScreen
- Filter goals by activeChildId
- Update goal creation to assign childId
- Add tests for filtering and child switching

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Implement SettingsScreen Child Management

**Files:**
- Modify: `src/screens/SettingsScreen.tsx:1-300` (add "Manage Children" section)
- Test: `src/screens/SettingsScreen.test.tsx` (CRUD tests)

**Interfaces:**
- Consumes: `children`, `onSettingsChange(settings)`, `activeChildId`, `onSelectChild`
- Produces: Child management UI (list, add, edit, delete)

---

### Step 1: Write failing tests for child management

```typescript
describe("SettingsScreen - Manage Children", () => {
  it("should display list of children", () => {
    const children = [
      { id: "c1", name: "Alex", settings: { ... } },
      { id: "c2", name: "Jordan", settings: { ... } }
    ];

    render(<SettingsScreen children={children} ... />);

    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("Jordan")).toBeInTheDocument();
  });

  it("should add new child when user provides name", async () => {
    const onSettingsChange = jest.fn();
    render(<SettingsScreen onSettingsChange={onSettingsChange} ... />);

    const addButton = screen.getByText("Add Child");
    fireEvent.press(addButton);

    // User enters name in prompt
    const input = await screen.findByDisplayValue("");
    fireEvent.changeText(input, "Sam");
    fireEvent.press(screen.getByText("Add"));

    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        children: expect.arrayContaining([
          expect.objectContaining({ name: "Sam" })
        ])
      })
    );
  });

  it("should edit child name and settings", () => {
    // Test edit flow: press edit button, change name/label/time/color, save
  });

  it("should delete child and associated goals", () => {
    // Test delete flow: press delete, confirm, child removed
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- SettingsScreen.test.tsx 2>&1 | head -30
```

Expected: FAIL (functionality not yet implemented)

- [ ] **Step 3: Add Manage Children section to SettingsScreen**

Edit `src/screens/SettingsScreen.tsx`, add after existing settings sections:

```typescript
{/* Manage Children Section */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Manage Children</Text>

  {/* Child list */}
  {settings.children.map(child => (
    <View key={child.id} style={styles.childItem}>
      <View>
        <Text style={styles.childName}>{child.name}</Text>
        <Text style={styles.childLabel}>
          {child.settings.parentLabel} • {child.settings.notificationTime}
        </Text>
      </View>
      <View style={styles.childActions}>
        <Pressable
          onPress={() => openEditChildModal(child)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </Pressable>
        {settings.children.length > 1 && (
          <Pressable
            onPress={() => deleteChild(child.id)}
            style={[styles.button, styles.deleteButton]}
          >
            <Text style={styles.buttonTextDelete}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  ))}

  {/* Add child button */}
  <Pressable
    onPress={() => openAddChildModal()}
    style={[styles.button, styles.addButton]}
  >
    <Text style={styles.buttonText}>+ Add Child</Text>
  </Pressable>
</View>
```

- [ ] **Step 4: Implement add child modal**

```typescript
const [addChildModalVisible, setAddChildModalVisible] = useState(false);
const [newChildName, setNewChildName] = useState("");

function openAddChildModal() {
  setNewChildName("");
  setAddChildModalVisible(true);
}

function addChild() {
  if (!newChildName.trim()) return;

  const newChild = {
    id: `child-${Date.now()}`,
    name: newChildName,
    settings: {
      parentLabel: "Parent",
      notificationTime: "18:00",
      tileColorId: "lavender" as TileColorId
    }
  };

  const updated = {
    ...settings,
    children: [...settings.children, newChild]
  };

  onSettingsChange(updated);
  setAddChildModalVisible(false);
}

// Modal JSX (at end of SettingsScreen):
<Modal visible={addChildModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Add Child</Text>
      <TextInput
        style={styles.input}
        placeholder="Child's name"
        value={newChildName}
        onChangeText={setNewChildName}
      />
      <View style={styles.modalActions}>
        <Pressable onPress={() => setAddChildModalVisible(false)}>
          <Text>Cancel</Text>
        </Pressable>
        <Pressable onPress={addChild}>
          <Text>Add</Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
```

- [ ] **Step 5: Implement edit child modal**

```typescript
const [editingChild, setEditingChild] = useState<Child | null>(null);

function openEditChildModal(child: Child) {
  setEditingChild({ ...child });
}

function saveEditChild() {
  if (!editingChild) return;

  const updated = {
    ...settings,
    children: settings.children.map(c =>
      c.id === editingChild.id ? editingChild : c
    )
  };

  onSettingsChange(updated);
  setEditingChild(null);
}

// Edit modal with TextInput, TimePicker, ColorPicker for each field
<Modal visible={Boolean(editingChild)} transparent>
  {editingChild && (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Edit {editingChild.name}</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={editingChild.name}
          onChangeText={name => setEditingChild({ ...editingChild, name })}
        />

        <Text style={styles.label}>Parent Label</Text>
        <TextInput
          style={styles.input}
          value={editingChild.settings.parentLabel}
          onChangeText={label =>
            setEditingChild({
              ...editingChild,
              settings: { ...editingChild.settings, parentLabel: label }
            })
          }
        />

        <Text style={styles.label}>Notification Time</Text>
        {/* TimePicker or similar */}

        <Text style={styles.label}>Tile Color</Text>
        {/* ColorPicker showing TILE_COLOR_OPTIONS */}

        <View style={styles.modalActions}>
          <Pressable onPress={() => setEditingChild(null)}>
            <Text>Cancel</Text>
          </Pressable>
          <Pressable onPress={saveEditChild}>
            <Text>Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )}
</Modal>
```

- [ ] **Step 6: Implement delete child**

```typescript
function deleteChild(childId: string) {
  Alert.alert(
    "Delete Child?",
    "All goals for this child will be deleted.",
    [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: () => {
          const updated = {
            ...settings,
            children: settings.children.filter(c => c.id !== childId)
          };

          // Delete all goals for this child
          const remainingGoals = goals.filter(g => g.childId !== childId);

          onSettingsChange(updated);
          // TODO: Also update goals in App.tsx
        }
      }
    ]
  );
}
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npm test -- SettingsScreen.test.tsx 2>&1 | grep -E "PASS|FAIL"
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/screens/SettingsScreen.tsx src/screens/SettingsScreen.test.tsx
git commit -m "feat: add child management UI to SettingsScreen

- Add child list with edit/delete buttons
- Implement add child modal with name input
- Implement edit child modal (name, label, time, color)
- Implement delete child with confirmation
- Add tests for CRUD operations

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update ChildScreen to Use activeChildId

**Files:**
- Modify: `src/screens/ChildScreen.tsx:1-50` (filter goal by activeChildId)

**Interfaces:**
- Consumes: `activeChildId: string`, `goal`
- Produces: Filtered goal display (verify goal.childId === activeChildId)

---

### Step 1: Write failing test

```typescript
it("should not display goal if activeChildId doesn't match", () => {
  const goal = { id: "g1", childId: "child-1", ... };

  render(
    <ChildScreen
      activeChildId="child-2"  // Different child
      goal={goal}
      ...
    />
  );

  // Should show error or blank screen, not the goal
  expect(screen.queryByText(goal.rewardName)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- ChildScreen.test.tsx 2>&1 | grep FAIL
```

- [ ] **Step 3: Update ChildScreen component**

Edit `src/screens/ChildScreen.tsx`:

```typescript
type ChildScreenProps = {
  activeChildId: string;
  goal: Goal | null;
  // ... existing props
};

export function ChildScreen({
  activeChildId,
  goal,
  // ... rest of props
}: ChildScreenProps) {
  // Safety check: ensure goal belongs to active child
  if (!goal || goal.childId !== activeChildId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Goal not found</Text>
      </View>
    );
  }

  return (
    // ... rest of existing render
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- ChildScreen.test.tsx 2>&1 | grep -E "PASS|FAIL"
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/screens/ChildScreen.tsx
git commit -m "feat: add activeChildId safety check to ChildScreen

- Verify goal belongs to active child before rendering
- Show error if mismatch (shouldn't happen, but safety guard)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Goal Migration and Orphaned Goal Cleanup

**Files:**
- Modify: `src/storage/appStorage.ts:70-120` (goal migration on app load)
- Modify: `App.tsx:hydrateApp` (cleanup orphaned goals)
- Test: `src/storage/appStorage.test.ts` (migration tests)

**Interfaces:**
- Consumes: Old goals (some with childId, some without), migrated settings
- Produces: All goals have valid childId, orphaned goals removed

---

### Step 1: Write failing test for goal migration

```typescript
it("should assign childId to goals from v0.1.12 migration", () => {
  const oldGoals = [
    { id: "g1", childName: "Alex", rewardName: "Cake", ... }  // No childId
  ];
  const migratedChildId = "child-12345";

  const migratedGoals = migrateGoalsV1ToV2(oldGoals, migratedChildId);

  expect(migratedGoals[0].childId).toBe(migratedChildId);
});

it("should remove orphaned goals (childId doesn't exist in children)", () => {
  const goals = [
    { id: "g1", childId: "child-1", ... },
    { id: "g2", childId: "child-orphan", ... }  // No such child
  ];
  const children = [{ id: "child-1", name: "Alex", ... }];

  const cleaned = removeOrphanedGoals(goals, children);

  expect(cleaned).toHaveLength(1);
  expect(cleaned[0].id).toBe("g1");
});
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Add goal migration functions**

Add to `src/storage/appStorage.ts`:

```typescript
export function migrateGoalsV1ToV2(
  oldGoals: any[],
  defaultChildId: string
): Goal[] {
  return oldGoals.map(goal => ({
    ...goal,
    childId: goal.childId || defaultChildId
  }));
}

export function removeOrphanedGoals(
  goals: Goal[],
  children: Array<{ id: string }>
): Goal[] {
  const validChildIds = new Set(children.map(c => c.id));
  return goals.filter(goal => validChildIds.has(goal.childId));
}
```

- [ ] **Step 4: Update hydrateApp to use migration and cleanup**

Edit `App.tsx` hydrateApp:

```typescript
async function hydrateApp() {
  try {
    const [storedGoals, storedSettings, storedActiveChildId] = await Promise.all([
      loadGoals(),
      loadSettings(),
      AsyncStorage.getItem("activeChildId")
    ]);

    const normalizedSettings = normalizeSettings(storedSettings);

    // Migrate goals (assign childId if missing)
    const migratedGoals = migrateGoalsV1ToV2(
      storedGoals,
      normalizedSettings.children[0]?.id || "child-default"
    );

    // Remove orphaned goals
    const cleanedGoals = removeOrphanedGoals(
      migratedGoals,
      normalizedSettings.children
    );

    setGoals(cleanedGoals);
    setSettings(normalizedSettings);

    // ... rest of hydration
  } catch (error) {
    // ... error handling
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- appStorage.test.ts 2>&1 | grep -E "PASS|FAIL"
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/storage/appStorage.ts App.tsx
git commit -m "feat: add goal migration and orphaned goal cleanup

- Migrate v0.1.12 goals (assign childId from first child)
- Remove orphaned goals (childId no longer in children list)
- Run cleanup during app hydration

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Comprehensive Integration Testing

**Files:**
- Create: `e2e/multipleChildren.e2e.ts` (new E2E test suite)
- Test: Full multi-child flow

---

### Step 1: Write E2E test for full multi-child flow

```typescript
describe("Multiple Children E2E", () => {
  it("should handle complete multi-child flow", async () => {
    // 1. Fresh app load → first child created from migration
    // 2. Add second child "Jordan"
    // 3. Switch to first child, create goal G1
    // 4. Switch to second child, create goal G2
    // 5. Verify G1 not visible when viewing second child
    // 6. Switch back to first child, verify G1 visible
    // 7. Delete second child, verify G2 removed
    // 8. Restart app, verify state persisted correctly
  });

  it("should handle edge cases", async () => {
    // 1. Delete last child (should be blocked or auto-recreate)
    // 2. Corrupt activeChildId (app should fallback to first)
    // 3. Rapid child switches (no race conditions)
  });
});
```

- [ ] **Step 2: Run E2E tests**

```bash
npm run e2e 2>&1 | grep -E "PASS|FAIL"
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add e2e/multipleChildren.e2e.ts
git commit -m "test: add comprehensive E2E tests for multi-child flow

- Test complete multi-child user flow
- Verify goal isolation and child switching
- Test edge cases (last child, corrupted state, rapid switches)
- Test app restart persistence

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Summary

**Total effort:** ~12-14 hours (with TDD approach)

**Files modified:** 6  
**Files created/tested:** 8+ test files  
**Key milestones:**
1. ✅ Goal.childId type & migration
2. ✅ AppSettings schema & migration
3. ✅ activeChildId state & persistence
4. ✅ GoalsScreen child selector & filtering
5. ✅ SettingsScreen child management UI
6. ✅ ChildScreen safety check
7. ✅ Goal migration & cleanup
8. ✅ E2E integration testing

**Risk:** Low (additive changes, backward compatible, transparent migration)

---

Plan complete and saved to `docs/superpowers/plans/2026-07-23-multiple-children-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?