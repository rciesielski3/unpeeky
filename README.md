# Unpeeky

Mobile app MVP for parents and children. A parent creates a reward goal, adds a reward photo, sets the number of tasks, and the child uncovers the reward one tile at a time as tasks are approved.

## Owner

Adateo Rafal Ciesielski

## Stack

- Expo + React Native
- TypeScript
- AsyncStorage for local-only data
- expo-image-picker for reward photos
- expo-notifications for reminders
- react-native-google-mobile-ads for parent-only ads
- react-native-purchases for RevenueCat-backed Premium
- react-native-reanimated for tile reveal animation
- ESLint + Prettier

## Requirements

- Node.js
- npm
- Expo Go on a phone, or an Android/iOS simulator

## Setup

```bash
npm install
```

## Release Process

Unpeeky releases are automated via GitHub Actions. The process:

### Prerequisites
- GitHub Secrets configured: `EXPO_TOKEN`, `PLAY_STORE_SERVICE_ACCOUNT_JSON`, `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- EAS environment variables set for `preview` and `production` environments (RevenueCat key)
- Service account has "Release" permission in Google Play Console for `com.adateo.unpeeky`

### Steps

1. **Bump version** (manual)
   - Use GitHub Actions → "Bump Version" workflow with desired version number
   - This increments versionCode, updates versionName, commits, and creates a git tag

2. **Build AAB** (automatic or manual)
   - **Automatic:** Push the git tag (created in step 1) → triggers "EAS Build Android"
   - **Manual:** GitHub Actions → "EAS Build Android" → Run workflow with tag

3. **Upload to Play Store** (manual, gated)
   - GitHub Actions → "Upload to Play Store"
   - Select version tag, track (internal/alpha/beta/production), and status (draft/completed)
   - **Always start with internal/draft** for testing

4. **Review & Promote** (manual in Play Store Console)
   - Go to Google Play Console → Releases → [Track]
   - Review the draft release
   - Click "Review release" → Promote to "Completed"
   - Submit for review (if production)

### Dry-Run Release
To test the entire pipeline without affecting production:
1. Use "Bump Version" workflow to create a test version (e.g., v0.1.6)
2. Use "EAS Build Android" → `internal` profile
3. Use "Upload to Play Store" → `internal` track, `draft` status
4. Review in Play Store Console (internal testing section)
5. Delete the draft when done with testing

For detailed instructions, see:
- `.github/WORKFLOW_SETUP.md` - GitHub Secrets configuration
- `docs/RELEASE_RUNBOOK.md` - Detailed release procedure
- `docs/GITHUB_ACTIONS_TROUBLESHOOTING.md` - Troubleshooting guide

## Release Notes

Before release, replace the Google Mobile Ads test app IDs and banner unit ID with production AdMob keys.

Premium uses RevenueCat. Configure RevenueCat with:

- Product: `unpeeky_premium_lifetime`
- Entitlement: `premium`
- Android public SDK key: `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`

For local Android purchase testing, add the RevenueCat key to an ignored local env file:

```bash
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY="goog_..."
```

## Google Play Internal Testing

This project includes EAS profiles for building an Android App Bundle and submitting it to the Google Play `internal` track.

One-time setup:

```bash
# Log in and link/create the EAS project. This may add extra.eas.projectId to app.json.
npx eas login
npx eas init
```

Required local files and secrets:

- `google-play-service-account.json` in the project root. This file is ignored by git.
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` configured for the EAS `preview` environment.

Create or update the EAS environment variable:

```bash
npx eas env:create --environment preview --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value "goog_..."
```

Build and submit the first internal testing build:

```bash
npm run eas:build:android:internal
npm run eas:submit:android:internal
```

Use the internal track only until RevenueCat purchase and restore flows are verified end to end.

Android release builds read these Gradle properties or environment variables:

- `UNPEEKY_VERSION_CODE`
- `UNPEEKY_VERSION_NAME`
- `UNPEEKY_ADMOB_ANDROID_APP_ID`
- `UNPEEKY_RELEASE_STORE_FILE`
- `UNPEEKY_RELEASE_STORE_PASSWORD`
- `UNPEEKY_RELEASE_KEY_ALIAS`
- `UNPEEKY_RELEASE_KEY_PASSWORD`

The default local release keystore path is `unpeeky-release-key.keystore` in the project root. Keep it outside git.
For local release builds, export the signing secrets before running Gradle:

```bash
export UNPEEKY_RELEASE_STORE_PASSWORD="..."
export UNPEEKY_RELEASE_KEY_ALIAS="..."
export UNPEEKY_RELEASE_KEY_PASSWORD="..."

# Optional overrides
export UNPEEKY_RELEASE_STORE_FILE="$PWD/unpeeky-release-key.keystore"
export UNPEEKY_VERSION_CODE="3"
export UNPEEKY_VERSION_NAME="0.1.2"
export UNPEEKY_ADMOB_ANDROID_APP_ID="ca-app-pub-4185040274135926~7754563632"
```

If release signing values are missing, Gradle does not fall back to the debug keystore.

## Run

```bash
# Start Expo CLI
npm run start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm run format
```

## Current MVP Scope

- Local goal creation
- Reward photo selection
- Avatar selection
- First-run mode selection
- Free goal limit with Premium toggle
- Persistent task progress
- Single-goal deletion
- Parent PIN for task approval
- Animated tile reveal grid
- Child reward progress and completion state
