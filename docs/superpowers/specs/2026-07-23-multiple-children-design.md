# Multiple Children Support — Design Specification

> **Status:** Ready for implementation planning  
> **Date:** 2026-07-23  
> **Version:** v0.1.13 (planned release, current: v0.1.12)

## Goal

Enable a single parent account to manage goals for 2+ children independently. Each child has separate goals, customizable parent label, notification time, and tile color. Parent switches between children via UI selector within the app (no logout). All data remains local; architecture prepared for cloud sync in future two-device mode.

## Architecture

**Pattern:** Keep existing root state management (App.tsx). Add `activeChildId` state to track which child is currently displayed. No Context introduced; minimal pattern shift from v0.1.10 codebase.

**Data structure:** Replace single-child `childName` in `AppSettings` with multi-child `children` array. Global settings (PIN, subscription, export) stay separate. Migration is transparent on first launch; v0.1.12 single-child data auto-wraps into first child entry.

**Child switching:** Parent selects child via dropdown/tab on GoalsScreen. Selection updates `activeChildId` in root state. All child-dependent screens (GoalsScreen, ChildScreen, SettingsScreen) receive `activeChildId` via props and filter/display data accordingly.

## Tech Stack

- React Native 0.74.5 + Expo
- TypeScript 5.3.3 (strict mode)
- AsyncStorage (local persistence, no backend)
- Existing patterns: useState root state, prop drilling (no Context)

## Global Constraints

- **Scope:** Multi-child data model + UI for child management. No new features beyond child switching and per-child settings.
- **Backward compatibility:** v0.1.12 single-child data must migrate without data loss or user action.
- **No breaking changes:** Existing Goal logic, ApproveTaskScreen, AddGoalScreen, reward flow unchanged.
- **Timeline:** v0.1.13 release (target: end of August 2026, after API 36 migration in v0.1.12).
- **Testing:** Unit + integration + E2E covering migration, child isolation, settings per-child.

---

## Data Schema

### AppSettings (Updated)

```typescript
type AppSettings = {
  children: Array<{
    id: string;                          // Unique child ID: "child-{timestamp}"
    name: string;                        // Child's display name (e.g., "Alex")
    settings: ChildSettings;
  }>;
  globalSettings: GlobalSettings;
};

type ChildSettings = {
  parentLabel: string;                   // What child calls parent (e.g., "Mom", "Dad")
  notificationTime: string;              // HH:MM format (e.g., "18:00")
  tileColorId: TileColorId;             // Color for this child's goal tiles
};

type GlobalSettings = {
  pin: string;                           // Parent's authentication PIN (unchanged)
  isPremium: boolean;                    // Account-level subscription status
  exportData: Goal[];                    // All children's goals for backup
  appMode: AppMode;                      // "singleDevice" or "twoDevices"
  // ... other global settings
};

type TileColorId = "lavender" | "mint" | "peach" | "rose" | "sky" | "vanilla" | "lilac" | "lime";
type AppMode = "singleDevice" | "twoDevices";
```

### Goal (UPDATED - CRITICAL CHANGE)

**Goal structure MUST be updated to add `childId` field:**

```typescript
type Goal = {
  id: string;
  childId: string;                         // NEW: Links goal to specific child ("child-{timestamp}")
  childName: string;                       // (existing)
  rewardName: string;                      // (existing)
  imageUri: string;                        // (existing)
  totalTasks: TileCount;                   // (existing)
  completedTasks: number;                  // (existing)
  revealOrder: number[];                   // (existing)
  avatarId: AvatarId;                      // (existing)
  createdAt: string;                       // (existing)
  completed: boolean;                      // (existing)
};
```

**Migration (v0.1.12 → v0.1.13):** All existing goals get assigned to the migrated child:

```typescript
function migrateGoalsV1ToV2(oldGoals: Goal[], migratedChildId: string): Goal[] {
  return oldGoals.map(goal => ({
    ...goal,
    childId: migratedChildId  // Assign all existing goals to first (migrated) child
  }));
}
```

**Querying:** Filter by `childId`:
- "Get all goals for active child" → `goals.filter(g => g.childId === activeChildId)`
- Delete child → Remove all goals where `g.childId === childId`

### Migration: v0.1.12 → v0.1.13

When app detects v0.1.12 schema on first launch:

```typescript
function migrateSettingsV1ToV2(oldSettings: AppSettingsV1): AppSettings {
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
      pin: oldSettings.pin,
      isPremium: oldSettings.isPremium,
      exportData: oldSettings.exportData || [],
      appMode: oldSettings.appMode
      // ... other globals
    }
  };
}
```

Goals are automatically associated with the migrated child (no explicit update needed; query by childId).

---

## UI Changes

### GoalsScreen (Modified)

**New elements:**
- Child selector at top: dropdown or horizontal tab switcher displaying child's name and tile color
- Tapping selector opens child list → parent selects active child

**Behavior:**
- Display only goals for `activeChildId`
- "Add Goal" button creates goal for active child
- Delete goal removes from active child only
- No change to existing goal cards or completion flow

**Code flow:**
```typescript
<GoalsScreen 
  activeChildId={activeChildId} 
  onSelectChild={setActiveChildId}
  children={children}
  goals={goals.filter(g => g.childId === activeChildId)}
/>
```

### ChildScreen (Minimal Change)

**Change:** Filter displayed goals by `activeChildId`. No other changes; reward flow, tile reveal, completion logic unchanged.

```typescript
<ChildScreen 
  activeChildId={activeChildId}
  goal={goals.find(g => g.id === selectedGoalId && g.childId === activeChildId)}
/>
```

### SettingsScreen (Restructured)

**Sections:**

1. **Global Settings** (unchanged)
   - PIN setup/change
   - Premium subscription status (read-only; managed via RevenueCat)
   - Tile color selector (applies to active child)

2. **Manage Children** (new)
   - **Child list:** Display all children by name, sort by creation order
   - **Edit child button:** Opens modal with:
     - Name (text input, changeable)
     - Parent label (e.g., "Mom", "Dad") — per-child
     - Notification time (time picker) — per-child
     - Tile color (color picker) — per-child
   - **Delete child button:** 
     - Confirmation dialog: "Delete [child name] and all goals?"
     - On confirm: Remove child + all associated goals
     - If last child deleted: Create default child ("Child")
   - **Add child button:** 
     - Prompt: "What is the new child's name?"
     - Input: Name
     - Create child with ID, default settings (parentLabel: "Parent", time: "18:00", color: "lavender")

### ModeSelectionScreen (Unchanged)

No changes. Works as-is; mode applies to entire account.

### AddGoalScreen, ApproveTaskScreen (Unchanged)

No changes. Use active child context implicitly (child filtering handled at GoalsScreen level).

---

## State Management (App.tsx)

**Add to root state:**

```typescript
const [activeChildId, setActiveChildId] = useState<string>(() => {
  // Load from AsyncStorage (persisted across app restarts)
  // Falls back to first child on first launch
  return settings?.children?.[0]?.id || "default";
});
```

**Persist activeChildId on change:**

```typescript
useEffect(() => {
  // Save activeChildId to AsyncStorage whenever it changes
  AsyncStorage.setItem("activeChildId", activeChildId).catch(err => 
    console.error("Failed to persist activeChildId", err)
  );
}, [activeChildId]);
```

**Load activeChildId on app hydration (in existing hydrateApp effect):**

```typescript
async function hydrateApp() {
  try {
    const [storedGoals, storedSettings, storedActiveChildId] = await Promise.all([
      loadGoals(),
      loadSettings(),
      AsyncStorage.getItem("activeChildId")
    ]);
    
    // ... existing hydration logic ...
    
    // Restore activeChildId if it exists and is still valid
    if (storedActiveChildId && storedSettings?.children?.some(c => c.id === storedActiveChildId)) {
      setActiveChildId(storedActiveChildId);
    } else if (storedSettings?.children?.length > 0) {
      setActiveChildId(storedSettings.children[0].id);
    }
  } catch { /* ... */ }
}
```

**Pass to relevant screens:**

```typescript
<GoalsScreen 
  activeChildId={activeChildId} 
  onSelectChild={setActiveChildId}
  children={settings?.children || []}
/>
```

---

## Storage Layer (appStorage.ts)

**Updates:**

1. **loadSettings():** Detect schema version; run migration if v0.1.12 detected
2. **saveSettings():** Save new AppSettings structure
3. **Migration function:** `migrateSettingsV1ToV2()` (see Data Schema section)
4. **Goals storage:** No change; goals still stored/loaded by ID; queries filter by childId

**Backward compatibility:**
- Export (v0.1.12): Single goal array → Imported as first child
- Import (v0.1.13): Multi-child structure → Display all children

---

## Error Handling

**Edge cases:**

1. **No children found on load:** Create default child ("Child") with placeholder settings
2. **activeChildId no longer exists:** Reset to first child
3. **Delete last child:** Prevent deletion via UI (show "At least one child required"); or auto-create new default child
4. **Migration fails:** Log error, create default schema, alert user ("Data structure reset; please re-enter child data")
5. **Orphaned goals:** On app launch, remove any goals with invalid childId

---

## Testing Strategy

### Unit Tests

1. **Schema migration (migrateSettingsV1ToV2):**
   - v0.1.12 single-child → v0.1.13 multi-child array ✓
   - Empty/missing fields handled gracefully ✓
   - Non-destructive (old data preserved) ✓

2. **Child management:**
   - Add child → childId generated, settings initialized ✓
   - Edit child → name/label/time/color updated ✓
   - Delete child → goals removed, state consistent ✓
   - Delete last child → blocked or auto-create ✓

3. **Goal childId assignment:**
   - Migration: all goals get childId from migrated child ✓
   - New goals created with correct childId ✓
   - Orphaned goals (invalid childId) cleaned up on launch ✓

### Integration Tests

1. **Multi-child flow:**
   - Create child A → create goal G1
   - Switch to child B → create goal G2
   - Switch to child A → G1 visible, G2 not visible ✓
   - Delete child B → G2 gone, G1 persists ✓

2. **Settings isolation:**
   - Set parent label "Mom" for child A
   - Set parent label "Dad" for child B
   - Switch between children → correct label displayed ✓
   - Notification times per-child verified ✓

3. **Export/Import:**
   - Export with 2 children → file contains all goals ✓
   - Import on fresh install → children + goals restored ✓
   - Import v0.1.12 export → data wraps correctly ✓

4. **activeChildId persistence:**
   - Set activeChildId to child B → AsyncStorage.getItem returns child B ✓
   - Close and reopen app → activeChildId restored to child B ✓
   - Delete active child → fallback to first child on restart ✓

5. **Concurrent writes (edge case):**
   - Switch child while creating goal → goal assigned to correct child ✓
   - Rapid child switches → no race conditions, goals isolated ✓

### E2E Tests

1. **Full user flow:**
   - Fresh install → migrate or create first child ✓
   - Parent creates goals for 2 children ✓
   - Child switches, completes task → only active child's tile reveals ✓
   - Settings reflect per-child customization ✓

2. **Persistence across app lifecycle:**
   - Create 2 children with customized settings ✓
   - Kill and restart app → activeChildId restored, settings intact ✓
   - Delete child, restart → fallback child restored correctly ✓

---

## Implementation Scope

**Files modified:**

| File | Scope | Effort |
|------|-------|--------|
| `src/domain/goal.ts` | Update AppSettings type; add ChildSettings, GlobalSettings | 1h |
| `src/storage/appStorage.ts` | Migration logic; version detection; load/save multi-child | 2h |
| `App.tsx` | Add activeChildId state; migration call; pass to screens | 1.5h |
| `src/screens/GoalsScreen.tsx` | Child selector UI; filter goals by activeChildId | 2h |
| `src/screens/SettingsScreen.tsx` | Restructure: add "Manage Children" section (edit/delete/add) | 3h |
| `src/screens/ChildScreen.tsx` | Filter by activeChildId (minimal) | 0.5h |

**New files:** None (keep existing patterns; no Context)

**Tests:** 2-3 hours (unit + integration + E2E)

**Total effort:** 10-12 hours

---

## Risk Assessment

**Risk level:** Low

**Rationale:**
- Schema change is additive (existing Goal logic untouched)
- Root state pattern = minimal codebase disruption
- Migration is transparent (no new UI flows)
- Per-child data isolation prevents cross-contamination
- Backward compatibility preserved (v0.1.12 data auto-upgrades)

**Mitigation:**
- Thorough migration tests (cover edge cases)
- Internal track testing before alpha/beta promotion
- Export/import tests with v0.1.12 data
- Monitor crash reports post-launch

---

## Success Criteria

- ✅ Parent creates/manages 2+ children independently
- ✅ Goals isolated per child (no leakage between children)
- ✅ Per-child settings (parent label, notifications, tile color) customizable
- ✅ v0.1.12 data migrates without user action or data loss
- ✅ All tests passing (unit, integration, E2E)
- ✅ No regression in existing features (reward flow, goal creation, completion)
- ✅ Performance unchanged (state updates, goal filtering fast)

---

## Future Work (Out of Scope)

- **Two-device sync:** Pair child device to parent, sync goal state + notifications across devices
- **Child profiles:** Avatar, birthdate, preferences
- **Reward sharing:** Goals shared between siblings with joint progress tracking
- **Admin controls:** Parent dashboard, child activity monitoring
- **Export per-child:** Export single child's data (currently all-or-nothing)

---

## Appendix: Type Changes

### Before (v0.1.12)

```typescript
type AppSettings = {
  isPremium: boolean;
  childName: string;
  parentLabel: string;
  parentPin: string;
  tileColorId: TileColorId;
  notificationTime: string;
  appMode: AppMode;
};
```

### After (v0.1.13)

```typescript
type AppSettings = {
  children: Array<{
    id: string;
    name: string;
    settings: {
      parentLabel: string;
      notificationTime: string;
      tileColorId: TileColorId;
    };
  }>;
  globalSettings: {
    pin: string;
    isPremium: boolean;
    exportData: Goal[];
    appMode: AppMode;
  };
};
```

---

**Spec complete.** Ready for implementation planning and development.
