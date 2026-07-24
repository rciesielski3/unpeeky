# Mode Selection Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix incomplete mode selection feature: remove illusory mode-switching widget from SettingsScreen, add functional "Change Mode" button to restart mode selection, and prepare architecture for future `twoDevices` implementation without breaking current flow.

**Architecture:** 
- Mode selection is a one-time initialization gate (shown when `appMode === null`). Currently it can only be set once. 
- Solution: Allow resetting `appMode` to `null` to re-show ModeSelectionScreen at runtime.
- SettingsScreen will remove the non-functional mode widget and add a "Change Mode" button that sets `appMode` to `null` and navigates to settings (triggering the mode selection gate on next render).
- Future `twoDevices` implementation will be isolated to conditional rendering—no architectural changes needed.

**Tech Stack:** React Native, TypeScript, Expo

## Global Constraints

- No breaking changes to existing `appMode` storage format
- `singleDevice` mode (current default) must continue working unchanged
- Mode reset must be user-initiated (not accidental)
- All changes must pass existing test suite (47/47 ✅)

---

## File Structure

| File | Responsibility |
|------|-----------------|
| `src/i18n/strings.ts` | Add mode reset UI strings |
| `src/screens/SettingsScreen.tsx` | Remove non-functional mode widget; add "Change Mode" button that resets mode |
| `App.tsx` | Document mode reset logic (routing already supports it) |

---

## Task 1: Add String Resources for Mode Reset

**Files:**
- Modify: `src/i18n/strings.ts` (add strings for "Change Mode" button and section)

**Interfaces:**
- Produces: `strings.settings.changeModeTitle`, `strings.settings.changeModeMeta`, `strings.settings.changeModeButton`, `strings.settings.changeModeConfirmTitle`, `strings.settings.changeModeConfirmMeta`

- [ ] **Step 1: Open strings.ts and locate the settings section**

```bash
grep -n "appModeTitle\|exportData" /Users/rafalciesielski/Developer/unpeeky/src/i18n/strings.ts | head -5
```

Expected output shows line numbers where `appModeTitle` and nearby settings strings are defined.

- [ ] **Step 2: Read the current settings section to understand structure**

Read `src/i18n/strings.ts` around the line where `appModeTitle` is defined. Note the pattern for section titles and button labels.

- [ ] **Step 3: Add new strings before the `appModeTitle` section**

Add these exact strings to the `settings` object in `strings.ts`:

```typescript
changeModeTitle: "Zmień tryb działania",
changeModeMeta: "Pozwala wybrać ponownie między trybem jednego i dwóch telefonów.",
changeModeButton: "Zmień tryb",
changeModeConfirmTitle: "Zmienić tryb działania?",
changeModeConfirmMeta: "Spowoduje powrót do ekranu wyboru trybu. Twoje cele zostają zachowane.",
```

These should be added to the `settings` object, before the existing `appModeTitle` property.

- [ ] **Step 4: Verify strings are placed correctly**

```bash
grep -A 2 "changeModeTitle" /Users/rafalciesielski/Developer/unpeeky/src/i18n/strings.ts
```

Expected: New strings appear in the file with correct formatting.

- [ ] **Step 5: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No TypeScript errors related to strings.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/strings.ts
git commit -m "feat: add strings for mode reset functionality"
```

---

## Task 2: Remove Mode Widget from SettingsScreen

**Files:**
- Modify: `src/screens/SettingsScreen.tsx` (remove mode options widget, add "Change Mode" button)

**Interfaces:**
- Consumes: `strings.settings.changeModeTitle`, `strings.settings.changeModeMeta`, `strings.settings.changeModeButton` (from Task 1)
- Produces: SettingsScreen component with mode widget removed and new "Change Mode" button/section

- [ ] **Step 1: Read SettingsScreen.tsx to locate the mode selection widget**

Lines 383-406 contain the mode options widget. Understand its structure (card → title/meta → mode options).

- [ ] **Step 2: Add handler for "Change Mode" button in SettingsScreen**

Inside the SettingsScreen function body (after line 175), add:

```typescript
function handleChangeMode() {
  updateSettings({ appMode: null });
  onBack();
}
```

This resets `appMode` to `null` (triggering ModeSelectionScreen on next render) and returns to goals screen.

- [ ] **Step 3: Replace the mode options card with a "Change Mode" card**

Remove lines 383-406 (the mode options widget with its modeOptions styles).

Replace with:

```typescript
<View style={styles.card}>
  <View>
    <Text style={styles.rowTitle}>{strings.settings.changeModeTitle}</Text>
    <Text style={styles.rowMeta}>{strings.settings.changeModeMeta}</Text>
  </View>
  <Pressable
    accessibilityRole="button"
    onPress={handleChangeMode}
    style={styles.changeModeButton}
  >
    <Text style={styles.changeModeButtonText}>{strings.settings.changeModeButton}</Text>
  </Pressable>
</View>
```

This replaces the old mode selector with a simple button.

- [ ] **Step 4: Add styles for the new "Change Mode" button**

In the `StyleSheet.create()` section at the end of SettingsScreen.tsx, remove the `modeOptions`, `modeOption`, `modeTitle`, `modeMeta`, `selectedModeText`, `selectedModeMeta` style objects (lines ~686-777).

Add instead:

```typescript
changeModeButton: {
  alignItems: "center",
  alignSelf: "stretch",
  backgroundColor: colors.accent,
  borderRadius: radii.pill,
  justifyContent: "center",
  minHeight: 52,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm
},
changeModeButtonText: {
  color: colors.surface,
  fontSize: 16,
  fontWeight: "800"
}
```

- [ ] **Step 5: Remove unused MODE_OPTIONS constant**

Delete line 37: `const MODE_OPTIONS: AppMode[] = ["singleDevice", "twoDevices"];`

It's no longer needed.

- [ ] **Step 6: Remove unused handler**

Remove the old `handleChangeMode` function that was at lines 153-155 (the one that only updated settings inline). 
**Note:** You added a NEW `handleChangeMode` in Step 2—that's the one that stays.

- [ ] **Step 7: Remove getModeTitle and getModeMeta helper functions**

Delete the `getModeTitle` and `getModeMeta` functions at the end of the file (around lines 1305-1310):

```typescript
function getModeTitle(appMode: AppMode): string { ... }
function getModeMeta(appMode: AppMode): string { ... }
```

These are no longer used.

- [ ] **Step 8: Verify SettingsScreen still compiles**

```bash
npm run typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 9: Run tests to ensure nothing broke**

```bash
npm run test:unit
```

Expected: All 47 tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/screens/SettingsScreen.tsx
git commit -m "refactor: replace mode selector widget with Change Mode button"
```

---

## Task 3: Enable Mode Reset in App.tsx

**Files:**
- Modify: `App.tsx` (update mode-reset logic to allow re-selection at any time)

**Interfaces:**
- Consumes: `appMode` from settings, `handleSelectMode` callback
- Produces: ModeSelectionScreen shown whenever `appMode === null` (including after reset)

- [ ] **Step 1: Verify current mode selection logic in App.tsx**

Read lines 217-219:

```typescript
const screen = !settings.appMode ? (
  <ModeSelectionScreen initialMode={settings.appMode} onSelectMode={handleSelectMode} />
) : (
```

This already shows ModeSelectionScreen when `appMode` is falsy. No changes needed here—the logic is correct.

- [ ] **Step 2: Verify handleSelectMode handler**

Read lines 194-201. It currently:
1. Sets `appMode` to the selected value
2. Navigates to "goals" route

This is correct and doesn't need changes.

- [ ] **Step 3: Verify BottomNav condition**

Read line 280:

```typescript
const shouldShowBottomNav = Boolean(settings.appMode) && route !== "addGoal" && route !== "approveTask";
```

This correctly hides BottomNav during mode selection. No changes needed.

- [ ] **Step 4: Add comment documenting mode reset behavior**

Above the screen rendering logic (around line 215), add:

```typescript
// Mode selection is shown when appMode is null.
// Users can reset mode via Settings → "Change Mode" button,
// which sets appMode to null and returns to goals screen.
// This triggers ModeSelectionScreen on next render.
```

- [ ] **Step 5: Verify App.tsx still compiles**

```bash
npm run typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add App.tsx
git commit -m "docs: document mode reset flow in App.tsx"
```

---

## Task 4: Test Mode Reset Flow

**Files:**
- Test: `App.tsx` (manual end-to-end test)

**Interfaces:**
- Consumes: SettingsScreen, ModeSelectionScreen, App.tsx routing
- Produces: Verified mode reset behavior

- [ ] **Step 1: Start the app**

```bash
npm start
```

Expected: App loads, ModeSelectionScreen shown (appMode is null on first run or after reset).

- [ ] **Step 2: Select a mode (e.g., "Jeden telefon")**

Tap "Jeden telefon" on ModeSelectionScreen.

Expected: Mode selected, navigated to GoalsScreen, BottomNav visible.

- [ ] **Step 3: Navigate to Settings**

Tap Settings icon in BottomNav.

Expected: SettingsScreen opens. **Verify:**
  - Old mode selection widget is gone
  - New "Zmień tryb działania" section with "Zmień tryb" button is visible

- [ ] **Step 4: Tap "Change Mode" button**

Tap the "Zmień tryb" button.

Expected:
  - Navigates back to GoalsScreen briefly
  - Then ModeSelectionScreen appears (because appMode was reset to null)
  - Can select mode again

- [ ] **Step 5: Select a different mode (e.g., "Dwa telefony") to verify it works**

Tap "Dwa telefony".

Expected: Mode changes, GoalsScreen shown.

- [ ] **Step 6: Verify goals are persisted**

Create a test goal before resetting mode.

Expected: Goal still exists after mode reset (mode is independent of goals).

- [ ] **Step 7: Run full test suite to ensure nothing broke**

```bash
npm run test:unit
```

Expected: All 47 tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "test: verify mode reset flow end-to-end"
```

---

## Task 5: Cleanup and Documentation

**Files:**
- Modify: `README.md` or docs (if mode selection is documented)
- Verify: No unused imports or dead code

**Interfaces:**
- Consumes: Completed Tasks 1-4
- Produces: Clean codebase, updated documentation

- [ ] **Step 1: Check for unused imports in modified files**

```bash
grep -n "appMode\|getModeTitle\|getModeMeta\|MODE_OPTIONS" /Users/rafalciesielski/Developer/unpeeky/src/screens/SettingsScreen.tsx
```

Expected: No results (all removed).

- [ ] **Step 2: Check App.tsx for any unused mode-related code**

```bash
grep -n "MODE_OPTIONS" /Users/rafalciesielski/Developer/unpeeky/App.tsx
```

Expected: No results (never existed there).

- [ ] **Step 3: Verify no console errors in dev mode**

Run app and check console:

```bash
npm start
```

Navigate through: Mode Selection → Goals → Settings → Change Mode → Mode Selection. 
Expected: No errors, smooth transitions.

- [ ] **Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore: cleanup after mode reset implementation"
```

---

## Summary of Changes

| Component | Change |
|-----------|--------|
| `strings.ts` | Add strings for "Change Mode" button |
| `SettingsScreen.tsx` | Remove non-functional mode widget; add "Change Mode" button that resets `appMode` |
| `App.tsx` | Document mode reset flow (no logic changes—routing already supports it) |
| **Behavior** | Users can now reset mode selection at any time via Settings |
| **Future-Ready** | `twoDevices` implementation can be added to conditional rendering without breaking `singleDevice` |
