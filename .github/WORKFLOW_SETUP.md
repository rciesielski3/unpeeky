# GitHub Actions — One-Time Setup

Before the Unpeeky release workflows can run, add the following **repository
secrets** in GitHub:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret name | What it is | Where to get it |
| --- | --- | --- |
| `EXPO_TOKEN` | Expo access token used by `eas-cli` to trigger and monitor cloud builds. | expo.dev → account **Settings → Access tokens → Create token**. Use a bot/CI account if you have one. |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | Full JSON key for a Google Cloud service account with Play Console publishing access. Paste the entire file contents. | Google Play Console → **Setup → API access** → create/link a service account, grant it release permissions, then download the JSON key from Google Cloud IAM. |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Public RevenueCat Android SDK key baked into the app at build time. | RevenueCat dashboard → **Project → API keys** (Android/Google app). |

## Important notes

### EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY and EAS cloud builds
The build runs on **EAS servers**, not on the GitHub runner. For cloud builds,
EAS injects environment variables from the **EAS project** based on the profile's
`environment` in `eas.json` (`internal` → `preview`, `production` → `production`).

That means the GitHub secret alone is **not** enough for a cloud build — you must
also set `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` on the EAS side:

```bash
# For the "preview" environment (used by the internal profile)
eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value "<key>" \
  --environment preview --visibility plaintext

# For the "production" environment (used by the production profile)
eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value "<key>" \
  --environment production --visibility plaintext
```

The GitHub secret is still referenced in the workflows so they remain correct if
you ever switch to a local build (`--local`) and to document the dependency.

### App signing
App signing is managed by **EAS credentials** (the upload keystore lives on EAS).
The workflows do not sign anything locally — `r0adkll/upload-google-play` uploads
the already-signed AAB with `skipCommitHash: true`.

### GITHUB_TOKEN
`bump-version.yml` and the GitHub Release steps use the built-in `GITHUB_TOKEN`
(no secret to create). The workflows request `permissions: contents: write` so it
can push commits/tags and create releases. If `main` is a protected branch,
`bump-version.yml`'s direct push may be rejected — bump via a PR instead (see
`docs/RELEASE_RUNBOOK.md`).

## Verify setup
1. Confirm all three secrets exist under **Actions secrets**.
2. Confirm the two EAS env vars exist: `eas env:list --environment preview` and
   `eas env:list --environment production`.
3. Confirm the service account has the **Release** permission in Play Console for
   `com.adateo.unpeeky`.
4. Do a dry run: Actions → **EAS Build Android** → Run workflow (profile
   `internal`). It should finish and upload a `unpeeky-aab-*` artifact.
