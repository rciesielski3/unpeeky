# Unpeeky

Mobile app MVP for parents and children. A parent creates a reward goal, adds a reward photo, sets the number of tasks, and the child uncovers the reward one tile at a time as tasks are approved.

## Owner

Adateo — Rafal Ciesielski

## Stack

- Expo + React Native
- TypeScript
- AsyncStorage for local-only data
- expo-image-picker for reward photos
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

## Run

```bash
npm run start
```

Then open the project in Expo Go or a simulator from the Expo terminal UI.

## Checks

```bash
npm run typecheck
npm run lint
npm run format:check
```

## Current MVP Scope

- Local goal creation
- Reward photo selection
- Avatar selection
- Persistent task progress
- Animated tile reveal grid
- Child reward progress and completion state
