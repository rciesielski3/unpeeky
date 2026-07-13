# Unpeeky Feature Roadmap — v0.1.10+

## Status as of 2026-07-13

**v0.1.8:** Live in Play Store internal/alpha testing (completed, no changes required)
**v0.1.9:** PIN QoL enhancements merged, prepared as fallback fix
**v0.1.10:** Development cycle initiated (versionCode 10, in progress)

## Decision Gates

### Gate 1: Play Store Review Outcome

Determines if next build is mandatory fix (v0.1.9) or optional enhancement (v0.1.10).

**If v0.1.8 approved:**
→ Can proceed with v0.1.10 features (optional enhancements)
→ Timeline: Start v0.1.10 planning after 1 week of v0.1.8 in beta/production

**If v0.1.8 requires changes:**
→ Build v0.1.9 (with PIN QoL + any required fixes)
→ Upload v0.1.9 to Play Store
→ After v0.1.9 approved, proceed with v0.1.10 (timeline: +1 week)

**If v0.1.8 rejected:**
→ Urgent: Fix and resubmit as v0.1.9
→ No new features until approved
→ Timeline: +3-5 days for fix/resubmit cycle

### Gate 2: User Feedback

Once v0.1.8 is live in beta/production, collect 1 week of user feedback:

- Export feature usage rate
- Error feedback from new PIN UI
- Feature requests (import, multiple children, etc.)

## Next Feature Options (Priority Order)

### Option A: Data Import (Complement to Export)

**Effort:** 6-8 hours
**Risk:** Medium (file parsing, data validation)
**Value:** Enables backup restore workflow; completes Export Lite feature
**Files:** exportService.ts (add import fn), SettingsScreen.tsx (add import button)
**Blocker:** None (independent feature)
**Recommended:** If Export usage is 10%+ of active users

### Option B: Multiple Children per Parent Account

**Effort:** 8-10 hours
**Risk:** High (storage schema, navigation restructure)
**Value:** Addresses FAQ "can I manage both my kids?"
**Files:** appStorage.ts (schema update), GoalsScreen.tsx, ChildScreen.tsx
**Blocker:** Requires migration test for data from v0.1.8 → v0.1.9+
**Recommended:** If user feedback requests 5+ times

### Option C: Tablet Mode

**Effort:** 4-5 hours
**Risk:** Low (layout-only changes)
**Value:** Better UX on iPad/large screens
**Files:** ChildScreen.tsx, GoalsScreen.tsx (responsive layout)
**Blocker:** None (feature flag can gate if needed)
**Recommended:** If Play Store review mentions "tablet compatibility"

### Option D: iOS Support

**Effort:** 20+ hours (build, app store setup, testing)
**Risk:** High (new platform, review process)
**Value:** Double addressable market
**Files:** All (iOS-specific build, signing, submission)
**Blocker:** Must wait for confirmed Android traction (1000+ downloads)
**Recommended:** Q4 2026 at earliest, after Android success

## Recommended Next Steps

1. **Implement Gate 1:** Monitor Play Store review status (Task 2 tracker)
2. **If approved:** Start v0.1.10 planning with Option A (Import) or Option C (Tablet Mode)
3. **If requires changes:** Focus on v0.1.9 build/submit, then plan v0.1.10
4. **Collect user feedback:** Set 1-week timer after v0.1.8 goes live
5. **Revisit this doc:** Update based on feedback + Play Store status

## Release Cadence

- All v0.1.10+ work requires CI gates to pass (tests, lint, format, typecheck)
- Target: 1-2 features per release, staggered by Play Store approval time (~5 days per cycle)
- Export/Import should be bundled (v0.1.10 should include both)

---

**Last updated:** 2026-07-13
**Decision owner:** r.ciesielski3@gmail.com
