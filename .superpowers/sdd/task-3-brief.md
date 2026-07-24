# Task 3: Update App.tsx State Management

**Files:**
- Modify: `App.tsx:33-100` (root state, hydration, rendering)
- Modify: `App.tsx:useEffect` (add activeChildId persistence)
- Test: `App.test.tsx` (integration test for state)

**Interfaces:**
- Consumes: Updated AppSettings with children array (from Task 2)
- Produces: `activeChildId: string` state, `setActiveChildId(id)` function, AsyncStorage save/load

---

## Step 1: Write failing test for activeChildId state

Create or extend `App.test.tsx`:

```typescript
describe("App activeChildId state", () => {
  it("should initialize activeChildId to first child", async () => {
    const settings: AppSettings = {
      children: [
        { id: "child-1", name: "Alex", settings: { parentLabel: "Mom", notificationTime: "18:00", tileColorId: "lavender" } },
        { id: "child-2", name: "Jordan", settings: { parentLabel: "Dad", notificationTime: "18:00", tileColorId: "mint" } }
      ],
      globalSettings: { pin: "1234", isPremium: false, exportData: [], appMode: "singleDevice" }
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
cd /Users/rafalciesielski/Developer/unpeeky
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
