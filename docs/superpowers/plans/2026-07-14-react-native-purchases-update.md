# React-Native-Purchases Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update react-native-purchases from v10.2.0 to v10.4.2 to resolve Google Play warning about unnecessary API calls in the transitive com.revenuecat.purchases:purchases dependency.

**Architecture:** 
This is a straightforward dependency update. The minor version bump (10.2.0 → 10.4.2) should not introduce breaking changes. The approach: update package.json, install dependencies, verify existing premium purchase flow still works (syncPremiumEntitlement, purchasePremium functions), and commit.

**Tech Stack:** React Native, Expo, react-native-purchases

## Global Constraints

- No breaking changes to existing premium purchase flow (syncPremiumEntitlement, purchasePremium must work unchanged)
- All 47 existing tests must pass
- No changes to premium purchase logic, UI, or user flow
- Update must resolve Google Play warning about unnecessary API calls

---

## File Structure

| File | Responsibility |
|------|-----------------|
| `package.json` | Declare react-native-purchases@10.4.2 |
| `package-lock.json` | Auto-generated; locked versions after `npm install` |
| `src/premium/premiumPurchase.ts` | Existing premium purchase logic (read-only for verification) |
| `src/App.tsx` | Existing syncPremiumEntitlement call (read-only for verification) |

---

## Task 1: Update Dependency

**Files:**
- Modify: `package.json` (react-native-purchases version)

**Interfaces:**
- Produces: `react-native-purchases@10.4.2` installed and ready

- [ ] **Step 1: Read package.json to locate react-native-purchases**

```bash
grep "react-native-purchases" /Users/rafalciesielski/Developer/unpeeky/package.json
```

Expected: Line shows `"react-native-purchases": "^10.2.0"`

- [ ] **Step 2: Update version in package.json**

Change line from:
```json
"react-native-purchases": "^10.2.0",
```

To:
```json
"react-native-purchases": "^10.4.2",
```

(Keep the `^` caret — allows patches and minor updates)

- [ ] **Step 3: Verify the change**

```bash
grep "react-native-purchases" /Users/rafalciesielski/Developer/unpeeky/package.json
```

Expected: Line shows `"react-native-purchases": "^10.4.2"`

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

Expected: npm resolves and installs react-native-purchases@10.4.2 and updates package-lock.json. No errors.

- [ ] **Step 5: Verify installation**

```bash
npm list react-native-purchases
```

Expected: Shows `react-native-purchases@10.4.2`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: update react-native-purchases to 10.4.2"
```

---

## Task 2: Verify Premium Purchase Flow

**Files:**
- Read: `src/premium/premiumPurchase.ts` (syncPremiumEntitlement, purchasePremium functions)
- Read: `src/App.tsx` (syncPremiumEntitlement call in useEffect)
- Test: Run full test suite

**Interfaces:**
- Consumes: react-native-purchases@10.4.2 installed from Task 1
- Produces: Verification that premium purchase flow unchanged and tests pass

- [ ] **Step 1: Verify TypeScript compilation**

```bash
npm run typecheck
```

Expected: No TypeScript errors. The update should be type-compatible (minor version).

- [ ] **Step 2: Run full test suite**

```bash
npm run test:unit
```

Expected: All 47 tests pass (same as before). No new failures introduced by the dependency bump.

- [ ] **Step 3: Verify lint (no new issues)**

```bash
npm run lint
```

Expected: No lint errors or warnings (same as before).

- [ ] **Step 4: Verify format check**

```bash
npm run format:check
```

Expected: No formatting issues (same as before).

- [ ] **Step 5: Spot-check premium purchase logic**

Read `src/premium/premiumPurchase.ts` (around lines 1-50) and verify:
- `syncPremiumEntitlement()` function exists and signature unchanged
- `purchasePremium()` function exists and signature unchanged
- No compilation errors shown by TypeScript

Expected: Both functions are present and unchanged.

- [ ] **Step 6: Verify App.tsx still calls syncPremiumEntitlement**

```bash
grep -n "syncPremiumEntitlement" /Users/rafalciesielski/Developer/unpeeky/src/App.tsx
```

Expected: Line 69 shows `void syncPremiumEntitlement().then(…)` — unchanged.

- [ ] **Step 7: Commit verification (or skip if nothing to commit)**

All changes from Task 1 already committed. No new code changes needed for this task. Just verification that everything still works.

---

## Task 3: Cleanup and Documentation

**Files:**
- None to modify

**Interfaces:**
- Consumes: Task 1 & 2 complete, all tests passing

- [ ] **Step 1: Verify no uncommitted changes**

```bash
git status
```

Expected: Working tree clean (only untracked files from superpowers config, if any).

- [ ] **Step 2: Verify branch is clean**

```bash
git log --oneline -1
```

Expected: Latest commit shows "chore: update react-native-purchases to 10.4.2"

- [ ] **Step 3: Final verification run**

```bash
npm run typecheck && npm run lint && npm run format:check && npm run test:unit
```

Expected: All gates pass (typecheck, lint, format, 47/47 tests).

---

## Summary of Changes

| Component | Change |
|-----------|--------|
| `package.json` | `react-native-purchases: ^10.2.0` → `^10.4.2` |
| `package-lock.json` | Auto-updated by npm install |
| **Premium purchase flow** | No changes (read-only verification) |
| **Tests** | All 47 passing (no new failures) |
| **Google Play warning** | Resolved (transitive com.revenuecat.purchases:purchases updated to 10.6.1+) |
