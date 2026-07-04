# GitHub Actions — Troubleshooting

Common failures for the Unpeeky release workflows and how to fix them.

---

## Authentication / secrets

### `eas build` fails with "Not logged in" / 401
- `EXPO_TOKEN` secret is missing, expired, or scoped to the wrong account.
- Fix: regenerate at expo.dev → **Settings → Access tokens** and update the
  `EXPO_TOKEN` repository secret.

### Play Store upload fails: 401 / 403 / "The caller does not have permission"
- The service account lacks Play Console permissions, or the JSON is malformed.
- Fix: in Play Console → **Setup → API access**, grant the service account the
  **Release** permission for `com.adateo.unpeeky`. Re-paste the **entire** JSON
  file into `PLAY_STORE_SERVICE_ACCOUNT_JSON` (no surrounding quotes/whitespace).

### Play Store: "APK/AAB is not signed" or "package not found"
- Signing is handled by EAS credentials. If the app has never been uploaded,
  Play needs the **first** AAB uploaded manually once to register the app and app
  signing, after which the workflow works.
- Confirm `packageName` is exactly `com.adateo.unpeeky`.

---

## Version problems

### Play Console rejects the upload: "Version code N has already been used"
- `UNPEEKY_VERSION_CODE` was not incremented.
- Fix: run **Bump Version** (auto-increments) or manually raise
  `UNPEEKY_VERSION_CODE` in `android/gradle.properties`, commit, re-tag, rebuild.

### Build warning: "Tag does not match UNPEEKY_VERSION_NAME"
- You tagged `v0.2.0` but `gradle.properties` still says a different
  `UNPEEKY_VERSION_NAME`.
- Fix: run **Bump Version** before tagging, or align the two values. The build
  still uses the committed value (source of truth), not the tag string.

---

## Artifacts

### Upload workflow rebuilds even though I just built
- The artifact name must match `unpeeky-aab-<version_tag>`. `version_tag` in the
  upload run must equal the tag used by the build (e.g. `v0.2.0`).
- Artifacts expire after **30 days** — after that a rebuild is expected.

### "Artifact not found" warning in the upload log
- This is expected when no matching artifact exists; the workflow falls back to
  building from source. Only a hard failure (non-zero exit) is a real problem.

### `find . -name "*.aab"` finds nothing
- Cloud EAS builds are **not** auto-downloaded. The workflows resolve the
  artifact URL from the build JSON and `curl` it to `app-release.aab`. If the
  download step fails, check the printed `eas-build-result.json` — the
  `artifacts.applicationArchiveUrl`/`buildUrl` field should be populated.

---

## EAS build issues

### Build fails: missing `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- For **cloud** builds this must be set on the EAS side, not just as a GitHub
  secret. Set it per environment:
  ```bash
  eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value "<key>" --environment preview   --visibility plaintext
  eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value "<key>" --environment production --visibility plaintext
  ```
  (`internal` profile → `preview`, `production` profile → `production`.)

### Build succeeds on EAS but the workflow step errors during download
- eas-cli version differences: some versions expose the AAB URL as
  `applicationArchiveUrl`, others as `buildUrl`. The workflows try both and fall
  back to `eas build:list` + `eas build:view`. If both are empty, open the build
  in the EAS dashboard and confirm it actually produced an app-bundle artifact.

### Queue/timeout on the free EAS tier
- Cloud builds can queue. `--wait` blocks the runner; a long queue can approach
  the job timeout. Re-run, or upgrade the EAS plan for priority builds.

---

## bump-version.yml

### Push rejected: "protected branch" / "required status checks"
- The workflow pushes directly to the default branch. If it's protected, this
  fails.
- Fix: bump the version via a normal PR instead (edit `gradle.properties`, merge,
  then create the tag manually), or allow the `github-actions[bot]` actor to push.

### Tag already exists
- Delete and recreate:
  ```bash
  git tag -d v0.2.0
  git push origin :refs/tags/v0.2.0
  ```

---

## GitHub Release step

### "Resource not accessible by integration"
- The job needs `permissions: contents: write` (already set in the workflows). If
  you copied a step elsewhere, ensure that permission is present.

---

## General debugging tips
- Re-run a single failed job with **Re-run jobs → Re-run failed jobs**.
- Enable step debug logs: set repo secret/variable `ACTIONS_STEP_DEBUG=true`.
- Every EAS-invoking step prints its JSON; expand the step logs to inspect it.
