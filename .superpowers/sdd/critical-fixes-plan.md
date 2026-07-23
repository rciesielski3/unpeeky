# Critical Fixes Plan - Multiple Children Support PR #75

## Overview
Four critical and important issues found by code review. Fixes coordinate across 5 files.

## Fix Assignments

### Fix 1: v0.1.12 Migration Logic + Integration Tests
**Agent:** Opus
**Files:** src/storage/appStorage.ts, App.test.tsx, e2e/multipleChildren.e2e.ts
**Work:**
1. Change migration detection: `if (!parsed.childName && !parsed.children)` → `if (!parsed.children)`
2. Add Polish defaults to migrateSettingsV1ToV2: "Rodzicu" instead of "Parent", "Dziecko" instead of "Child"
3. Add integration test in App.test.tsx that calls real loadSettings() with v0.1.12 blob
4. Run tests to verify: 89+ tests pass, migration path covered
5. Commit fix

**Risk:** Migration is core to v0.1.13 feature. Fix is critical.

---

### Fix 2: Replace Alert Picker with Modal (3+ Children Android)
**Agent:** Opus
**Files:** src/screens/GoalsScreen.tsx
**Work:**
1. Replace Alert.alert() child selector with Modal-based picker
2. Show list of children in Modal with Pressable buttons
3. Each button calls onSelectChild(childId)
4. Keep existing styling/theme integration
5. Test with 2, 3, 4+ children to verify no Android button limit issues
6. Run tests to verify: 89+ tests pass, GoalsScreen tests cover modal paths
7. Commit fix

**Risk:** GoalsScreen child selector is primary UI for feature. Must work for all family sizes.

---

### Fix 3: Per-Child Notification Scheduling + Polish Defaults
**Agent:** Opus
**Files:** src/screens/SettingsScreen.tsx, src/services/notificationService.ts
**Work:**
1. Wire handleChangeEditingChildNotificationTime to reschedule OS reminder for active child
2. Wire child switching (setActiveChildId in App.tsx) to reschedule reminder for new active child
3. Verify notification times per-child are honored by OS scheduler
4. Use Polish default "18:00" consistently
5. Add test coverage: switching children reschedules reminder correctly
6. Run tests to verify: 89+ tests pass
7. Commit fix

**Risk:** Per-child notifications is a stated feature. Users expect it to work.

---

### Fix 4: Test Implementation Fixes (App.test.tsx, e2e/multipleChildren.e2e.ts)
**Agent:** Haiku
**Files:** App.test.tsx, e2e/multipleChildren.e2e.ts
**Work:**
1. Fix App.test.tsx: Stop re-implementing hydration logic. Mount real App component, call hydrateApp, assert on results
2. Fix App.test.tsx: Hydration init should match implementation ("default" → "default", not children[0].id)
3. Fix e2e tests: Import and call real loadSettings(), migrateSettingsV1ToV2(), removeOrphanedGoals() - don't re-implement
4. Add v0.1.12→v0.1.13 migration E2E test that drives full flow with real settings blob
5. Run `npm test` to verify: 89+ tests pass, no regressions
6. Commit fix

**Risk:** Tests are the safety net. They must test real code, not shadows of it.

---

## Execution Order

All fixes are independent (different files, different concerns). Can execute in parallel:
- Fix 1 (migration) → independent
- Fix 2 (modal) → independent
- Fix 3 (notifications) → independent
- Fix 4 (tests) → depends on fixes 1-3 being in place

**Strategy:** Dispatch Fixes 1, 2, 3 in parallel. Once any complete, they can be tested. Fix 4 runs last to validate all fixes together.

---

## Success Criteria

After all fixes:
- [ ] `npm run typecheck` → 0 errors
- [ ] `npm run lint` → 0 errors
- [ ] `npm test` → 89+ tests passing, migration path covered
- [ ] v0.1.12 users can upgrade without settings wipe
- [ ] 3+ children families can switch children on Android
- [ ] Per-child notifications are actually scheduled
- [ ] Tests drive real code paths (not reimplemented logic)

---

## Branch & Commit

- **Branch:** chore/api36-upgrade (already pushed)
- **Commits:** One per fix (4 commits total) + test verification
- **After all fixes:** Force-push branch, re-review PR #75

---

## Rollback Plan

If any fix breaks tests or introduces new issues:
1. Agent will report BLOCKED with specific error
2. I'll dispatch fix agent to resolve
3. Re-test and retry

No user action needed — fixes are self-contained and can be applied incrementally.
