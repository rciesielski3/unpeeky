# Copilot code review instructions

Review this Expo React Native app as a local-first product for parents and children.

- Keep changes small, typed, and focused. Prefer KISS over new abstractions.
- Never suggest backend, auth, cloud sync, or remote analytics for MVP data flow.
- Never place ads, purchase prompts, or tracking in child-facing screens.
- Preserve local storage through AsyncStorage unless a task explicitly changes storage.
- Prefer `react-native-reanimated` for tile reveal animation work.
- Flag unsafe TypeScript, `any`, unbounded casts, and duplicated business logic.
- Check mobile ergonomics: touch targets, text fitting, and no overlapping UI.
- Treat `npm run typecheck`, `npm run lint`, and `npm run format:check` as required before merge.
