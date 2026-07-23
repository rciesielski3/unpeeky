# Critical Fixes Report — pre v0.1.13

Status: COMPLETE. `typecheck`, `lint`, and full test suite all green.

## Verification results
- `npm run typecheck` → PASS (0 errors; was 28)
- `npm run lint` → PASS (0 errors; was 18)
- `npm test` → PASS (89 tests: 76 unit + 13 e2e, 0 fail)

## Fixes applied

### 1. Rules-of-Hooks violation in ChildScreen.tsx (crash risk)
Moved the "goal belongs to active child" guard to AFTER all hooks. Hooks now
run unconditionally on every render (null-safe against a null `goal`), and the
early `return` happens only once hook order is stable. The error copy now uses
`strings.child.goalNotFound` instead of hardcoded English.

### 2. SettingsScreen edits the wrong child (logic bug)
`SettingsScreen` now destructures `activeChildId` and resolves
`activeChild = settings.children.find(c => c.id === activeChildId) ?? children[0]`
instead of hardcoding `children[0]`. Top cards (tile color, parent label,
notification time) now edit the child the parent is actually viewing.

### 3. Unused import
Removed unused `ChildSettings` import from SettingsScreen.tsx.

### 4. i18n regression — hardcoded English
Added Polish strings and wired them up:
- `strings.child.goalNotFound`
- `strings.goals.{selectChildLabel,selectChildTitle,selectChildFallback,switchChildHint,selectChildCancel}` (GoalsScreen child switcher)
- `strings.settings.manageChildren.*` (section title, add/edit/delete buttons,
  add/edit modals, field labels, delete-confirm and cannot-delete alerts,
  no-children fallback)
SettingsScreen.tsx and GoalsScreen.tsx updated to consume them.

### 5. typecheck failures (28) — test fixtures + prod types
- Added missing `childId` to Goal/PersistedGoal fixtures in goal.test.ts and
  exportService.test.ts.
- Fixed invalid `avatarId` values ("default", "avatar-1", "bird", "dragon") to
  valid AvatarId members in goal.test.ts, appStorage.test.ts, e2e.
- Handled `noUncheckedIndexedAccess` undefined access on `children[0]` /
  `goals[0]` in settings.test.ts and appStorage.test.ts (`!` / `?.`).
- Typed `appStorage.ts` migration helpers (`LegacySettingsInput`,
  `LegacyGoalInput`) replacing production `any`.

### 6. lint failures (18)
- 5 resolved by fix #1 (rules-of-hooks).
- Removed unused `ChildSettings` import (fix #3) and unused `childIdToDelete`
  var in SettingsScreen.test.tsx.
- Replaced all `any` (prod `appStorage.ts` + test/e2e casts) with concrete
  types or `unknown`.

## Files changed
Production: ChildScreen.tsx, SettingsScreen.tsx, GoalsScreen.tsx,
storage/appStorage.ts, i18n/strings.ts
Tests: domain/goal.test.ts, domain/settings.test.ts,
services/exportService.test.ts, storage/appStorage.test.ts,
screens/SettingsScreen.test.tsx, e2e/multipleChildren.e2e.ts
