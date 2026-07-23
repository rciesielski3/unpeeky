# Task 1: Update Goal Type with childId Field

**Files:**
- Modify: `src/domain/goal.ts:23-35` (Goal type definition)
- Modify: `src/domain/goal.ts:55-75` (PersistedGoal type, migration helpers)
- Test: `src/domain/goal.test.ts` (new file)

**Interfaces:**
- Consumes: Existing Goal type structure
- Produces: Updated `Goal` type with `childId: string` field; `migrateGoalV1ToV2(oldGoal, childId): Goal` function

---

## Step 1: Write failing test for Goal.childId

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
