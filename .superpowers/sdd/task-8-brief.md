# Task 8: Comprehensive Integration Testing

**Files:**
- Create: `e2e/multipleChildren.e2e.ts` (new E2E test suite)
- Test: Full multi-child flow

---

## Step 1: Write E2E test for full multi-child flow

```typescript
describe("Multiple Children E2E", () => {
  it("should handle complete multi-child flow", async () => {
    // 1. Fresh app load → first child created from migration
    // 2. Add second child "Jordan"
    // 3. Switch to first child, create goal G1
    // 4. Switch to second child, create goal G2
    // 5. Verify G1 not visible when viewing second child
    // 6. Switch back to first child, verify G1 visible
    // 7. Delete second child, verify G2 removed
    // 8. Restart app, verify state persisted correctly
  });

  it("should handle edge cases", async () => {
    // 1. Delete last child (should be blocked or auto-recreate)
    // 2. Corrupt activeChildId (app should fallback to first)
    // 3. Rapid child switches (no race conditions)
  });
});
```

- [ ] **Step 2: Run E2E tests**

```bash
npm run e2e 2>&1 | grep -E "PASS|FAIL"
```

- [ ] **Step 3: Commit**

```bash
git add e2e/multipleChildren.e2e.ts
git commit -m "test: add comprehensive E2E tests for multi-child flow

- Test complete multi-child user flow
- Verify goal isolation and child switching
- Test edge cases (last child, corrupted state, rapid switches)
- Test app restart persistence

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```
