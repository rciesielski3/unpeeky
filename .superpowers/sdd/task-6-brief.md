# Task 6: Update ChildScreen to Use activeChildId

**Files:**
- Modify: `src/screens/ChildScreen.tsx:1-50` (filter goal by activeChildId)

**Interfaces:**
- Consumes: `activeChildId: string`, `goal`
- Produces: Filtered goal display (verify goal.childId === activeChildId)

---

## Step 1: Write failing test

```typescript
it("should not display goal if activeChildId doesn't match", () => {
  const goal = { id: "g1", childId: "child-1", childName: "Alex", ... };

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

- [ ] **Step 5: Commit**

```bash
git add src/screens/ChildScreen.tsx
git commit -m "feat: add activeChildId safety check to ChildScreen

- Verify goal belongs to active child before rendering
- Show error if mismatch (shouldn't happen, but safety guard)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```
