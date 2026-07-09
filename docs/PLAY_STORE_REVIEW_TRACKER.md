# Google Play Review Tracker — v0.1.8

> Internal engineering/release document (English). Not user-facing, so not translated.
> For user-facing release notes see `docs/RELEASE_NOTES_v0.1.8.md`.

## Review Timeline

- **Build uploaded:** 2026-07-08 (v0.1.8, versionCode 8, Edit ID: 11833252890418030451)
- **Track:** Internal testing (also promoted to Closed testing / alpha)
- **Status:** ✅ **Live on testing tracks** — release status `completed` on both `internal` and `alpha` (verified via Play Developer API on 2026-07-09; see "Actual Findings" below)

### Status Check (perform in Play Store Console)

**How to check (manual, UI):**

1. Go to https://play.google.com/console/u/0/developers/
2. Click "Unpeeky" app
3. Navigate to "Release" → "Testing" → "Internal testing"
4. Locate v0.1.8 (versionCode 8) release

**How to check (automated, API — used for this tracker):**
A repo-local service account (`google-play-service-account.json`, gitignored,
`unpeeky-play-submit@unpeeky.iam.gserviceaccount.com`) has `androidpublisher`
scope. Flow: sign a JWT with the SA private key → exchange at
`oauth2.googleapis.com/token` → create an edit at
`androidpublisher.googleapis.com/.../applications/com.adateo.unpeeky/edits` →
`GET .../edits/{editId}/tracks/{track}`. The release `status` field reports
`draft` / `inProgress` / `halted` / `completed`.

**Fields to document:**

- Current state: [draft / inProgress / halted / completed / rejected]
- Review status messages (if any)
- Required changes (if any)
- Timeline estimate (if provided)

## Actual Findings (2026-07-09, automated API check)

| Track      | Release | versionCode | Status      |
| ---------- | ------- | ----------- | ----------- |
| internal   | 0.1.8   | 8           | `completed` |
| alpha      | 0.1.8   | 8           | `completed` |
| beta       | —       | —           | no release  |
| production | —       | —           | no release  |

- **Interpretation:** `completed` means the rollout on that track is finished and
  the build is available to testers. Internal and closed (alpha) testing tracks do
  **not** go through Google's content/policy review the way a production release
  does, so there is no separate "in review" state to wait on here. The build is
  effectively approved and installable on both testing tracks.
- **App details:** defaultLanguage `pl-PL`, contactEmail `adateorc@gmail.com`,
  contactWebsite `https://rciesielski.dev/app-ads.txt`.
- **No blocking messages or required changes were returned by the API** for these tracks.
- **Note / discrepancy to review:** the release notes attached to the v0.1.8 Play
  release describe the Premium screen, RevenueCat, and AdMob work (copy from an
  earlier cut), which differs from `docs/RELEASE_NOTES_v0.1.8.md` (Export Lite +
  domain tests + docs). Worth reconciling the store listing copy before promoting
  to a public track. Not a review blocker.

## Shipped in v0.1.8

### Features

- **Export Lite:** Users can back up goals and settings from the Settings screen (shared via the device share sheet).
- **Domain Tests:** Unit tests covering the goal state machine and tile-grid / reward logic.
- **CI/CD Gate:** PRs must pass typecheck, lint, format, and test before merge.
- **Docs:** Improved documentation structure and developer guidance.

### Compliance Notes

- No new permissions added (uses existing `RECORD_AUDIO`; camera and notifications as already declared).
- No third-party SDKs added beyond those already declared (Expo, RevenueCat, AdMob).
- No storage schema changes (backward compatible with v0.1.7 data).

## Response Decision Tree

### If Review Status = "Approved" / release `completed` / "Ready to Publish" ← **current state**

→ Can promote from internal/alpha testing to beta/production.
→ Decision: gather user feedback on the Export feature before a wider launch, or promote now.
→ Suggested action: keep on testing tracks for user feedback; promote to beta for ~1 week, then production.

### If Review Status = "Changes Requested"

→ Document each required change.
→ Determine scope: code fix vs. metadata/copy update.
→ Build v0.1.9 if code changes are needed, or update the listing if copy-only.
→ Re-upload and re-submit.

### If Review Status = "In Review" / "Pending" / release `inProgress`

→ No action; check again in 24–48 hours.
→ Document timestamp.
→ Set a reminder for follow-up.

### If Review Status = "Rejected" / release `halted`

→ Document the rejection reason.
→ Assess severity: blocker vs. fixable.
→ Plan a response sprint.
→ Prepare v0.1.9 or v0.1.10 with fixes.

## Recommended Action

**Status is green.** v0.1.8 is `completed` (live) on both the internal and alpha
testing tracks with no required changes returned by the API — this maps to the
"Approved / Ready to Publish" branch above.

Concrete next steps, in order:

1. **Reconcile store listing copy** for v0.1.8: the Play release notes describe the
   Premium/RevenueCat/AdMob work, while `docs/RELEASE_NOTES_v0.1.8.md` describes
   Export Lite + tests + docs. Align these before any promotion to a public track.
2. **Collect tester feedback** on the Export feature from the internal/alpha cohort.
3. **Do not promote to production yet** — hold on testing tracks for ~1 week of
   feedback, then promote to beta, then production if clean.
4. **Keep v0.1.9 warm** (versionCode 9 already bumped in `android/gradle.properties`)
   so it can ship quickly if feedback surfaces fixes.

## Next Release Planning

**v0.1.9 readiness:** PIN QoL enhancements merged, versionCode bumped to 9
(`UNPEEKY_VERSION_CODE=9`, `UNPEEKY_VERSION_NAME=0.1.9`), ready to build and upload
if v0.1.8 feedback requires changes.

**v0.1.10+:** Depends on Play Store and user feedback on the Export feature. Possible directions:

- Import (restore from backup JSON)
- Multiple children per parent account
- Tablet mode
- iOS support

---

**Last checked:** 2026-07-09 (automated Play Developer API check)
**Checked by:** release automation (service account `unpeeky-play-submit`)
