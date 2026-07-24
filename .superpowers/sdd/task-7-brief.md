# Task 7: Goal Migration and Orphaned Goal Cleanup

**Files:**
- Modify: `src/storage/appStorage.ts:70-120` (goal migration on app load)
- Modify: `App.tsx:hydrateApp` (cleanup orphaned goals)
- Test: `src/storage/appStorage.test.ts` (migration tests)

**Interfaces:**
- Consumes: Old goals (some with childId, some without), migrated settings
- Produces: All goals have valid childId, orphaned goals removed

---

## Step 1: Write failing test for goal migration

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

```bash
npm test -- appStorage.test.ts 2>&1 | grep FAIL
```

- [ ] **Step 3: Add goal migration functions to appStorage.ts**

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

- [ ] **Step 6: Commit**

```bash
git add src/storage/appStorage.ts App.tsx
git commit -m "feat: add goal migration and orphaned goal cleanup

- Migrate v0.1.12 goals (assign childId from first child)
- Remove orphaned goals (childId no longer in children list)
- Run cleanup during app hydration

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```
