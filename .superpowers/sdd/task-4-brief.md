# Task 4: Implement GoalsScreen Child Selector

**Files:**
- Modify: `src/screens/GoalsScreen.tsx:1-150` (add child selector, filter goals)
- Test: `src/screens/GoalsScreen.test.tsx` (filtering tests)

**Interfaces:**
- Consumes: `activeChildId: string`, `children: ChildSettings[]`, `onSelectChild(id)`
- Produces: Rendered child selector UI, goals filtered by activeChildId

---

## Step 1: Write failing test for child selector

```typescript
describe("GoalsScreen", () => {
  it("should filter goals by activeChildId", () => {
    const goals = [
      { id: "g1", childId: "child-1", childName: "Alex", rewardName: "Cake", ... },
      { id: "g2", childId: "child-2", childName: "Jordan", rewardName: "Cookies", ... }
    ];

    render(
      <GoalsScreen
        activeChildId="child-1"
        goals={goals}
        // ... other props
      />
    );

    // Assert only g1 is displayed
    expect(screen.queryByText(/Cake/i)).toBeInTheDocument();
    expect(screen.queryByText(/Cookies/i)).not.toBeInTheDocument();
  });

  it("should display child selector with active child name", () => {
    const children = [
      { id: "child-1", name: "Alex", settings: { ... } },
      { id: "child-2", name: "Jordan", settings: { ... } }
    ];

    render(
      <GoalsScreen
        activeChildId="child-1"
        childrenList={children}
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
        childrenList={children}
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
  childrenList: Array<{ id: string; name: string; settings: ChildSettings }>;
  goals: Goal[];
  // ... existing props
};

export function GoalsScreen({
  activeChildId,
  onSelectChild,
  childrenList,
  goals,
  // ... rest of props
}: GoalsScreenProps) {
  const activeChild = childrenList.find(c => c.id === activeChildId);

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
              childrenList.map(child => ({
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
            {childrenList.length > 1 ? "Tap to switch" : ""}
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

- [ ] **Step 4: Ensure createGoal calls pass activeChildId**

In `AddGoalScreen`, update goal creation to pass activeChildId:

```typescript
const goal = createGoal(draft, activeChildId);
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
