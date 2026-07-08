# Unpeeky Release Runbook

This document describes the step-by-step process for releasing Unpeeky to the Google Play Store.

## Prerequisites

Before starting a release, ensure:

1. **GitHub Secrets are configured** in the repository settings:
   - `ANDROID_KEYSTORE_BASE64` — Base64-encoded Android release keystore
   - `KEYSTORE_PASSWORD` — Keystore password
   - `KEY_ALIAS` — Key alias in the keystore
   - `KEY_PASSWORD` — Key password
   - `PLAY_STORE_SERVICE_ACCOUNT_JSON` — Google Play service account JSON (base64 or plain text)
   - `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` — AdMob app ID for release builds

2. **Google Play service account is configured**:
   - Service account has "Release Manager" or "Release" permission for the app
   - The account can upload APKs/AABs and manage releases

3. **Local environment ready**:
   - Latest code from `main` branch
   - No uncommitted changes
   - Node.js and npm installed

## Release Process

### Step 1: Bump Version

1. **Update app.json:**
   ```bash
   # Edit app.json and increment version
   # "version": "0.1.7" → "0.1.8"
   ```

2. **Update android/gradle.properties:**
   ```bash
   # Edit android/gradle.properties
   # UNPEEKY_VERSION_CODE=7 → UNPEEKY_VERSION_CODE=8
   # UNPEEKY_VERSION_NAME=0.1.7 → UNPEEKY_VERSION_NAME=0.1.8
   ```

3. **Commit the version bump:**
   ```bash
   git add app.json android/gradle.properties
   git commit -m "chore: bump version v0.1.8"
   ```

### Step 2: Create Git Tag

1. **Create an annotated tag:**
   ```bash
   git tag -a v0.1.8 -m "Release v0.1.8"
   ```

2. **Push the tag to trigger the build:**
   ```bash
   git push origin v0.1.8
   ```

   This automatically triggers the **"Build Release Bundle"** workflow, which:
   - Checks out the exact tag
   - Builds the Android App Bundle (AAB)
   - Uploads it as a GitHub Actions artifact with name `release-bundle-v0.1.8`

3. **Verify the build in GitHub Actions:**
   - Go to GitHub repository → Actions → "Build Release Bundle"
   - Monitor the workflow run for v0.1.8
   - Wait for it to complete successfully (typically 10-15 minutes)
   - Check that artifacts are uploaded

### Step 3: Upload to Play Store

1. **Trigger the upload workflow manually:**
   - GitHub repository → Actions → "Upload to Play Store"
   - Click "Run workflow"
   - Fill in the inputs:
     - **version_tag:** `v0.1.8`
     - **track:** `internal` (for first test release)
     - **status:** `draft` (for manual review before release)
     - **create_github_release:** `false` (unless doing a public release)

2. **Wait for the workflow to complete:**
   - The workflow will try to reuse the pre-built artifact from step 2
   - If not found, it will build from source as a fallback
   - Once complete, the AAB is uploaded to the specified track

### Step 4: Verify in Play Store

1. **Open Google Play Console:**
   - Go to https://play.google.com/console
   - Select Unpeeky (`com.adateo.unpeeky`)

2. **Check the release:**
   - Navigate to Releases → [Track] (e.g., "Internal Testing")
   - Find the draft release for v0.1.8
   - Review the app version, changelog, and any other details

3. **Test the release:**
   - For internal/alpha/beta: Install the build on a test device
   - Verify core functionality: goal creation, task approval, tile reveal, Premium features
   - Check that notifications still work
   - Verify ads load correctly (if applicable)

### Step 5: Promote & Finalize

#### For Internal/Alpha/Beta Testing:
1. In Play Store Console, review the draft release
2. If satisfied, click "Review release" → "Promote" to "Completed"
3. The build becomes available to testers immediately

#### For Production Release:
1. Ensure extensive testing on alpha/beta track first
2. In Play Store Console, click "Review release" → "Promote to Production"
3. Submit for app review (if major changes)
4. Wait for Google's approval (usually 1-3 hours for subsequent releases)
5. Once approved, the release goes live

### Step 6: Create GitHub Release (Optional)

For public releases, the upload workflow can automatically create a GitHub Release:
- Re-run the "Upload to Play Store" workflow with `create_github_release: true`
- The workflow will look for `docs/RELEASE_NOTES_v0.1.8.md` and attach it to the release
- The AAB file is also attached to the GitHub release

Alternatively, manually create a release:
```bash
git push main  # Ensure version bump is on main
gh release create v0.1.8 --title "Release v0.1.8" --notes-file docs/RELEASE_NOTES_v0.1.8.md android/app/build/outputs/bundle/release/app-release.aab
```

## Rollback Procedure

If a release has critical issues:

1. **For Draft Releases:**
   - Go to Play Store Console → Releases → [Track]
   - Click the draft release → Delete draft
   - The release is discarded; testers won't see it

2. **For Completed Releases (Not Yet Live):**
   - Go to Play Store Console → Releases → [Track]
   - Create a new release with a hotfix
   - Promote the new release to "Completed"
   - The old draft will be automatically replaced

3. **For Live Production Releases:**
   - Prepare a hotfix version (e.g., v0.1.9)
   - Follow the release process steps above
   - Once new version is uploaded and approved, users will get the update automatically

## Troubleshooting

### Build Fails During Workflow

**Symptom:** "Build Release Bundle" workflow fails at the Gradle step.

**Resolution:**
- Check GitHub Actions logs for the specific Gradle error
- Common causes:
  - Outdated Node.js or Java version (workflow uses latest setup-node/setup-java)
  - Missing or incorrect keystore secrets (verify `ANDROID_KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, etc.)
  - Dependency conflicts (clear `.gradle` cache if needed)
- Re-run the workflow or manually trigger with `workflow_dispatch`

### Upload Workflow Can't Find Pre-Built Artifact

**Symptom:** Workflow logs show "No pre-built artifact found — will build from source as fallback."

**Resolution:**
- This is normal if the build workflow hasn't completed yet
- Wait for the "Build Release Bundle" workflow to finish before triggering "Upload to Play Store"
- The workflow automatically falls back to a fresh build; the upload will still succeed

### Play Store Upload Fails

**Symptom:** Workflow fails at "Upload AAB to Play Store" step.

**Resolution:**
- Verify `PLAY_STORE_SERVICE_ACCOUNT_JSON` secret is correct (not expired)
- Check that the service account has "Release Manager" permission in Play Store Console
- Verify the AAB file is valid (not corrupted)
- Manually re-run the workflow; transient Play Store API errors are common

### Wrong Version Uploaded

**Symptom:** Play Store shows v0.1.7 instead of v0.1.8.

**Resolution:**
- Double-check that `app.json` and `android/gradle.properties` were updated correctly
- Ensure the git tag matches the version in those files (e.g., `v0.1.8`)
- If the wrong build was uploaded, create a new release with the correct version and delete the incorrect draft

### Can't Promote Release from Draft

**Symptom:** "Review release" button is grayed out or shows errors.

**Resolution:**
- Ensure the app's privacy policy and other required content is filled in Google Play Console
- Check that the AAB is valid (try re-uploading)
- Wait a few minutes; Play Store's review process can take time
- If still stuck, delete the draft and re-upload

### Release Notes Not Attached to GitHub Release

**Symptom:** GitHub Release was created but has no description.

**Resolution:**
- Ensure `docs/RELEASE_NOTES_v0.1.8.md` file exists in the repository at the release tag
- Re-run the upload workflow with `create_github_release: true` to retry
- Or manually create the GitHub release with the correct release notes file

## Tips & Best Practices

1. **Always test on internal track first:**
   - Create a release to the `internal` track with `draft` status
   - Have a test device/account verify functionality
   - Delete the draft once testing is complete

2. **Keep release notes updated:**
   - Create `docs/RELEASE_NOTES_v0.1.X.md` before releasing
   - Use user-friendly language, not technical jargon
   - Include both Polish and English versions

3. **Monitor GitHub Actions closely:**
   - Watch the build and upload workflows in real-time
   - Address failures immediately
   - If a workflow times out, check the logs and retry

4. **Document any secrets rotation:**
   - If rotating the Android keystore or service account, update GitHub Secrets
   - Update local copies of credentials
   - Test with a small release first

5. **Plan for time:**
   - Full release cycle: 30-45 minutes (build + review + testing)
   - Production review: 1-3 hours after submission
   - Avoid releasing on Friday afternoons (harder to respond to issues)

## References

- **GitHub Actions Workflows:** `.github/workflows/`
  - `build-release-bundle.yml` — Builds AAB from tag
  - `upload-to-play-store.yml` — Uploads AAB and optionally creates GitHub Release

- **Release Notes:**
  - `docs/RELEASE_NOTES_v0.1.8.md` — v0.1.8 user-facing release notes

- **Version Files:**
  - `app.json` — Expo project version
  - `android/gradle.properties` — Android-specific version codes
