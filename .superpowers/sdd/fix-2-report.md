# Fix 2: Child Selector Modal (Critical) — Report

## Status: COMPLETE

## Problem
`GoalsScreen` used `Alert.alert()` for the child selector. Android's native
alert dialog only renders up to 3 buttons and silently drops any beyond that.
Families with 3+ children could not select every child.

## Changes
File: `src/screens/GoalsScreen.tsx`
- Removed `Alert` import; added `ScrollView`.
- Added `isChildPickerOpen` state.
- The "Select Child" button now opens a Modal instead of calling `Alert.alert()`.
- New `ChildPickerModal` component renders the full `childrenList` via `.map()`
  as `Pressable` rows inside a `ScrollView` (no button-count ceiling). Each row
  calls `onSelectChild(childId)` and closes the modal. The active child is
  highlighted with a checkmark. Tapping the overlay or Cancel dismisses.
- Styling reuses theme tokens (`colors`, `spacing`, `radii`, `fonts`) and the
  existing `modalOverlay` pattern, matching `InfoModal`.

File: `src/screens/GoalsScreen.test.tsx`
- Added a "child picker (Modal, not Alert)" suite: parametrized tests for
  2, 3, 4, 5, and 8 children asserting every child stays selectable (the last
  child is present regardless of count), plus onSelectChild wiring and
  active-child marking.

## Verification
- `npm run typecheck` — passed (no errors).
- `npx eslint src/screens/GoalsScreen.tsx` — clean.
- `npm test` — all green:
  - test:unit: 83 tests, 83 pass, 0 fail (22 suites)
  - test:e2e: 13 tests, 13 pass, 0 fail
  - Total: 96 tests passing (exceeds the 89+ target)

## Commit
- `18ac0d422549ccf3fdcd9c58710d4cc9b29dde11`
  fix: replace Alert picker with Modal for 3+ children Android support
