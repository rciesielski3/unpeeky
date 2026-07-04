# Unpeeky Release Runbook

Step-by-step procedure for shipping an Android release via GitHub Actions.

- **Package:** `com.adateo.unpeeky`
- **Version source of truth:** `android/gradle.properties`
  (`UNPEEKY_VERSION_CODE`, `UNPEEKY_VERSION_NAME`)
- **Build:** EAS Build (cloud) → AAB stored as a GitHub Actions artifact (30-day retention)
- **Publish:** `r0adkll/upload-google-play` → Google Play Console

One-time secret/env setup is documented in
[`.github/WORKFLOW_SETUP.md`](../.github/WORKFLOW_SETUP.md).

---

## Overview of the workflows

| Workflow | File | Trigger | Purpose |
| --- | --- | --- | --- |
| Bump Version | `.github/workflows/bump-version.yml` | Manual | Increment `versionCode`, set `versionName`, commit + tag `vX.Y.Z`. |
| EAS Build Android | `.github/workflows/eas-build.yml` | Tag push `vX.Y.Z` **or** manual | Build the AAB and store it as artifact `unpeeky-aab-<tag>`. |
| Upload to Play Store | `.github/workflows/upload-to-play-store.yml` | Manual | Reuse (or rebuild) the AAB and upload to a Play track. |

---

## Standard release procedure

### 1. Bump the version
Actions → **Bump Version** → Run workflow → enter the new `version_name`
(e.g. `0.2.0`, no leading `v`).

This increments `UNPEEKY_VERSION_CODE` by 1, sets `UNPEEKY_VERSION_NAME`, commits
to the default branch, and pushes tag `v0.2.0`.

> If `main` is protected and the push is rejected, bump manually instead:
> edit `android/gradle.properties` (bump both values), open a PR, merge, then
> `git tag -a v0.2.0 -m "Release v0.2.0" && git push origin v0.2.0`.

### 2. Build the AAB
Pushing the `v0.2.0` tag automatically triggers **EAS Build Android**.

- Watch it under the Actions tab. On success it uploads an artifact named
  `unpeeky-aab-v0.2.0`.
- To build without a tag (e.g. a test build), run **EAS Build Android** manually
  and pick the `internal` or `production` profile.

### 3. (Optional) Add release notes
For a GitHub Release with real notes, commit a file at the tag:
`docs/RELEASE_NOTES_v0.2.0.md`. If absent, a placeholder body is used.

### 4. Upload to Play Store
Actions → **Upload to Play Store** → Run workflow:

| Input | Typical value | Notes |
| --- | --- | --- |
| `version_tag` | `v0.2.0` | Must match an existing tag and the build artifact name. |
| `track` | `internal` → later `production` | See track strategy below. |
| `status` | `draft` first, then `completed` | `draft` lets you review in Play Console before going live. |
| `create_github_release` | `false` | Auto-`true` on the `production` track. |

The workflow reuses the `unpeeky-aab-v0.2.0` artifact if it still exists
(within 30 days); otherwise it rebuilds from source with EAS.

### 5. Verify in Play Console
Open Play Console → Unpeeky → the target track and confirm the new
`versionCode`/`versionName`, then roll out.

---

## Recommended track strategy

1. **internal** (`status: completed`) — smoke test with your internal testers.
2. **beta**/**alpha** — wider testing if needed.
3. **production** (`status: draft` → review → roll out) — public release. This
   also creates a GitHub Release with the AAB attached.

---

## Rebuilding an old release
If the 30-day artifact has expired, just run **Upload to Play Store** for that
tag — it detects the missing artifact and rebuilds from source automatically.
The version is whatever is committed at that tag, so it stays correct.

---

## Quick reference (git)
```bash
# Manual tag (if not using the Bump Version workflow)
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0

# Delete a mistaken tag (local + remote)
git tag -d v0.2.0
git push origin :refs/tags/v0.2.0
```

See [`GITHUB_ACTIONS_TROUBLESHOOTING.md`](./GITHUB_ACTIONS_TROUBLESHOOTING.md)
if anything fails.
