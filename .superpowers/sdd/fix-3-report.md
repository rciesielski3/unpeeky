# Fix 3: Per-Child Notifications & Polish Defaults — Report

## Status: DONE

## Problem
Per-child notification times were UI-only. The OS held a single `daily-reminder`
that was never rescheduled when a child's time changed or when the active child
switched, so only one global reminder time ever fired.

## Changes

### `src/domain/goal.ts`
- Added pure helper `resolveReminderTimeForActiveChild(settings, activeChildId)`:
  returns the active child's `notificationTime` when reminders are enabled,
  falling back to the first child; returns `null` when reminders are disabled
  (signals the reminder should be cancelled). Native-free so it is unit testable.

### `App.tsx`
- Imported the helper and `scheduleDaily`.
- Added a central reconciling effect. The OS holds only one `daily-reminder`, so
  it is kept in sync with the active child. `activeReminderTime` is derived via
  the helper and the effect (deps `[activeReminderTime, isHydrated]`) schedules
  or cancels accordingly. Covers hydration, active-child switching
  (`setActiveChildId` on GoalsScreen), and edits to the active child's time.

### `src/screens/SettingsScreen.tsx`
- `saveEditChild` now reschedules the OS reminder when the edited child is the
  active child and reminders are enabled (immediate effect + feedback).
- Documented that `handleChangeEditingChildNotificationTime` only updates the
  edit-modal draft; rescheduling happens on save so cancelling leaves the
  reminder untouched.
- Fixed TimePickerModal fallback from `18:30` to `18:00` for consistency with the
  `18:00` Polish default.

### Defaults (verified, item 4)
- `DEFAULT_CHILD_SETTINGS`: `parentLabel: "Rodzicu"`, `notificationTime: "18:00"`.
- `normalizeParentLabel` already falls back to `"Rodzicu"`. Add-child modal seeds
  `"Rodzicu"` / `"18:00"`. No change needed beyond the picker fallback above.

## Tests
Added `describe("per-child reminder scheduling")` to `src/domain/settings.test.ts`:
- uses the active child's notification time when scheduling
- reschedules to the new active child's time when the active child switches
- falls back to the first child when the active id is unknown
- returns null (cancel reminder) when reminders are disabled

### Test output
```
# unit
# tests 87
# pass 87
# fail 0
# e2e
# tests 13
# pass 13
# fail 0
```
Total: 100 passing (89+ requirement met). `tsc --noEmit` clean, eslint clean on
changed files.

## Commit
`fix: wire per-child notification scheduling and use Polish defaults`
Commit hash: `313943b`
