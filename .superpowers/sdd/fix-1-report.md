# Fix 1: v0.1.12 Migration Logic (Critical) — Report

**Status:** COMPLETE
**Commit:** `9527b5b228eccaac8a1878f7b8054e21916d5e92`
**Branch:** `chore/api36-upgrade`

## Problem

Migration never ran for real v0.1.12 users. Their persisted settings blob always
has an **empty** `childName` (the child's name lived on the goal object, not on
settings), so the guard `if (parsed.childName && !parsed.children)` short-circuited
on the falsy empty string. The code then fell through to `normalizeSettings(parsed)`,
which — seeing no `children` array — returned `DEFAULT_APP_SETTINGS`, silently
discarding the user's `pin`, `isPremium`, `appMode`, and `isReminderEnabled`.

## Changes

1. **`src/storage/appStorage.ts` — `loadSettings()`**
   Migration detection changed from `if (parsed.childName && !parsed.children)` to
   `if (!parsed.children)`. Migration now keys off the absence of the `children`
   array, which is the true v0.1.12 signal.

2. **`src/storage/appStorage.ts` — `migrateSettingsV1ToV2()`**
   (Note: this function lives in `appStorage.ts`, not `goal.ts` as the brief
   stated.) Fallback defaults switched to Polish: `"Dziecko"` (was `"Child"`) for
   the child name and `"Rodzicu"` (was `"Parent"`) for the parent label.

3. **`App.test.tsx` — integration tests**
   Added a `describe("loadSettings v0.1.12 migration integration")` block with two
   tests that drive the real `loadSettings()` / `saveSettings()` through
   AsyncStorage (backed by an in-memory `window.localStorage` shim, since Node 18
   lacks `mock.module`):
   - A real v0.1.12 blob with **empty** `childName` migrates, produces a `children`
     array, applies Polish defaults, and **preserves** `pin` (9999), `isPremium`
     (true), `appMode`, and `isReminderEnabled`.
   - A v0.1.13 blob that already has a `children` array is **not** re-migrated
     (children/pin preserved as-is).

4. **`src/storage/appStorage.test.ts`**
   Updated the existing "missing childName" assertion from `"Child"` to `"Dziecko"`
   to match the new Polish fallback.

## Verification

- `npm run typecheck` — clean
- `npm run lint` (changed files) — clean
- `npm test` — all green:
  - Unit: **89 pass / 0 fail** (24 suites) — up from 87 baseline (+2 new integration tests)
  - E2E: **13 pass / 0 fail**
  - Total: **102 pass / 0 fail**

Meets the "89+ tests" bar (89 unit alone; 102 total).
