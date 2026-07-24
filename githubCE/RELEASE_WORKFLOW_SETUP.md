# Release Workflow Setup

## Two-Workflow Architecture

The release pipeline is split into two independent workflows:

| Workflow             | File                       | Trigger                |
| -------------------- | -------------------------- | ---------------------- |
| Build Release Bundle | `build-release-bundle.yml` | Tag push **or** manual |
| Upload to Play Store | `upload-to-play-store.yml` | Manual only            |

This lets you build once and promote the same binary across tracks (internal → alpha → beta → production) without rebuilding. If a pre-built artifact is still within its 30-day retention window, the upload workflow reuses it; otherwise it falls back to a full build automatically.

---

## Required GitHub Secrets

Configure these under **Settings → Secrets and variables → Actions**:

| Secret                             | Description                                                                                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ANDROID_KEYSTORE_BASE64`          | Base64-encoded release keystore (`@adateo__car-explorer.jks`). Generate with: `base64 -i /path/to/@adateo__car-explorer.jks`                                   |
| `KEYSTORE_PASSWORD`                | Keystore password from `.env.release.local`                                                                                                                    |
| `KEY_ALIAS`                        | Key alias from `.env.release.local`                                                                                                                            |
| `KEY_PASSWORD`                     | Key password from `.env.release.local`                                                                                                                         |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON`  | Service account JSON for Google Play. See https://github.com/r0adkll/upload-google-play#setup                                                                  |
| `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` | Production AdMob App ID (`ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`). Required for Play Store policy compliance — build falls back to Google's test ID if unset. |

Keystore certificate SHA1 (for reference): `AC:F5:2A:DD:61:C8:8B:AA:B7:54:74:F9:B2:D5:6E:7E:9F:00:A4:E3`

---

## Workflow 1 — Build Release Bundle

**File:** `.github/workflows/build-release-bundle.yml`

### Triggers

**Automatic — on tag push:**

```bash
git tag -a v2.0.8 -m "Release version 2.0.8"
git push origin v2.0.8
```

The tag must match the pattern `v[0-9]+.[0-9]+.[0-9]+`.

**Manual — via GitHub Actions UI:**
Go to **Actions → Build Release Bundle → Run workflow**.

Inputs:

- `version_tag` — tag name for artifact naming (e.g. `v2.0.8`). If blank, a timestamp is used.
- `build_type` — `bundle` (AAB only), `apk` (APK only), or `both`.

### Output

A signed AAB (and optionally APK) is uploaded as a GitHub Actions artifact named `release-bundle-<tag>` with 30-day retention.

Example artifact name: `release-bundle-v2.0.8`

The artifact is NOT automatically submitted to the Play Store — use Workflow 2 for that.

---

## Workflow 2 — Upload to Play Store

**File:** `.github/workflows/upload-to-play-store.yml`

### Trigger

Manual only — **Actions → Upload to Play Store → Run workflow**.

### Inputs

| Input                   | Required | Description                                                                                       |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `version_tag`           | Yes      | Tag to upload, e.g. `v2.0.8`. The workflow checks out this tag and looks for a matching artifact. |
| `track`                 | Yes      | Play Store track: `internal`, `alpha`, `beta`, or `production`.                                   |
| `status`                | Yes      | `draft` (reviewable but not live) or `completed` (goes live / needs review).                      |
| `create_github_release` | No       | Force a GitHub Release even on non-production tracks. Production always creates one.              |

### Artifact reuse vs. fallback build

1. The workflow looks for a GitHub Actions artifact named `release-bundle-<version_tag>` produced by `build-release-bundle.yml`.
2. If found (within 30-day retention), that pre-built AAB is downloaded and used directly.
3. If not found (artifact expired or build was never run), a full build is performed automatically before uploading.

### GitHub Release creation

A GitHub Release is created when:

- `track` is `production`, **or**
- `create_github_release` is set to `true`.

The release body is read from `RELEASE_NOTES_<version_tag>.md` in the repo root. If that file does not exist at the checked-out tag, a placeholder body is used instead.

Release notes file naming convention: `RELEASE_NOTES_v2.0.8.md` (include the `v` prefix to match the tag exactly).

---

## Typical Release Flow

### Promote through all tracks

```bash
# 1. Tag and push — triggers an automatic build
git tag -a v2.0.8 -m "Release version 2.0.8"
git push origin v2.0.8

# 2. Once the build job completes, dispatch the upload workflow:
#    track: internal, status: draft
#    → review in Play Console, then promote manually to alpha/beta/production

# 3. For production upload (creates GitHub Release automatically):
#    track: production, status: completed
```

### Quick internal test (no tag)

Run **Build Release Bundle** manually with a custom `version_tag` (e.g. `v2.0.8-rc1`), then upload with the same tag.

### Re-upload same binary to a different track

If the artifact is still within 30 days, run **Upload to Play Store** again with a different `track` — no rebuild needed.

---

## Known issues / follow-ups

- `dawidd6/action-download-artifact@v3` is used for cross-workflow artifact download. Pin to a newer version if the action's maintainer releases one with relevant fixes.
- The `r0adkll/upload-google-play@v1` action does not support Play Store release names or rollout percentages. Upgrade to a newer action version if these are needed.
- `softprops/action-gh-release@v2` replaced the archived `actions/create-release@v1` that was used in the previous single-workflow setup.
