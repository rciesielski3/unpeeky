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

## Release Notes

Before release, replace the Google Mobile Ads test app IDs and banner unit ID with production AdMob keys.
Premium currently uses a local MVP purchase and restore flow. Before release, connect `PREMIUM_PRODUCT_ID` to the store product `unpeeky_premium_lifetime`.

Android release builds read these Gradle properties or environment variables:

- `UNPEEKY_VERSION_CODE`
- `UNPEEKY_VERSION_NAME`
- `UNPEEKY_ADMOB_ANDROID_APP_ID`
- `UNPEEKY_RELEASE_STORE_FILE`
- `UNPEEKY_RELEASE_STORE_PASSWORD`
- `UNPEEKY_RELEASE_KEY_ALIAS`
- `UNPEEKY_RELEASE_KEY_PASSWORD`

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
