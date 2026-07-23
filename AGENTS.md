# AGENTS.md — operating guide

Generic instructions for AI agents working on any of my repositories.
Project-specific knowledge lives in each repo's own doc (e.g. `AGENT_KNOWLEDGE.md`) —
read it before touching release infra. This file covers what's constant across projects.

---

## 1. Communication

- **Solution first, terse rationale.** No preamble, no padding, no summaries of what you
  just did. Flag real risks explicitly (unsigned builds, key mismatch, data loss,
  version collision).
- **Don't expand scope.** Do exactly what was asked. Improvement ideas: one sentence at
  the end, not implemented.
- Output is reviewed critically. If multiple agents investigated in parallel, reconcile
  findings before reporting — don't dump raw parallel results.

## 2. Engineering philosophy

- **Root-cause fixes, not band-aids.** Trace failures to the actual failing
  property/secret/config. Don't paper over symptoms.
- **Reproducible and hard to silently break** beats concise. Explicit env vars over
  implicit defaults; verification gates over "it probably built".
- **Fail loudly.** Missing artifact, partial config, bad input — the pipeline should stop
  with a clear error, never produce degraded output with only a warning.
- **KISS.** Simplest thing that works. Fewer moving parts, boring technology, readable
  over clever. If a junior couldn't follow it in one pass, simplify.
- **YAGNI / zero over-engineering.** No speculative abstractions, no config options nobody
  asked for, no dependencies "for later". New package = justification; check stdlib first.
- **DRY — but rule of three.** Extract shared logic once real duplication exists (3rd
  occurrence), not preemptively. A little duplication beats the wrong abstraction.
  Hard DRY for constants that must agree (version numbers, env var names, identifiers) —
  single source of truth, referenced everywhere else.
- **Ship the smallest working increment, fast.** Small vertical slices over big-bang
  changes; each increment leaves the repo releasable.
- **Self-maintaining, solo-dev scale.** Automation (GitHub Actions, cron) over manual
  processes. Infra cost ~0 at start (free tiers: Supabase, Vercel, Upstash, GH Actions).
  Nothing that requires a team to maintain.
- **Legal, free data sources only.** Check licenses before ingesting anything.

## 3. Verify, don't assume

- **Read the actual repo state** (`build.gradle`, workflow YAML, `eas.json`,
  `package.json`, configs) before reasoning about builds, signing, or CI. Config drifts
  between sessions; memory and docs go stale.
- When debugging build/release issues, check in order: required config inputs complete →
  identity/credentials correct (right keystore, right account) → version numbers.
- Before claiming something is fixed, run the relevant gate and show the result.

## 4. Code conventions

- **TypeScript everywhere**, strict mode. Small single-purpose modules; explicit types at
  module boundaries (I/O, API, DB), inference inside.
- **Validate external data at pipeline entry** — assume it's dirty.
- Self-documenting code; comments only where the decision is non-obvious. Infra
  (workflows, scripts) gets inline comments and explicit verification steps.
- Quality gates before done: `npm run typecheck`, `lint`, `format:check`, unit tests.
  Respect `patches/` (`patch-package` runs on postinstall) — never blindly reinstall over it.
- DB migrations as SQL files in the repo, never manual dashboard changes.

## 5. Tests confirm the solution — "it compiles" is not done

A change is done only when a test **proves** it works. Green typecheck/lint is table
stakes, not proof.

- **Bug fix = failing test first.** Reproduce the bug in a test (`node --test` via `tsx`,
  colocated `*.test.ts`), watch it fail, fix, watch it pass. The test stays as regression
  protection. No repro test → the fix is a guess.
- **New logic = unit tests for the domain layer.** Pure logic (parsing, validation,
  calculations, state transitions) gets tests covering the happy path + edge cases
  (empty/null input, boundary values, malformed external data). UI wiring and glue code
  don't need tests; the logic behind them does.
- **Pipelines/imports = dry-run on a sample** before full run: feed a known input slice,
  assert row counts and spot-check values against source. Never validate a data pipeline
  by "it didn't crash".
- **Infra changes = execute the path you touched.** A modified workflow/fallback/script
  is untested until it has actually run once (workflow_dispatch, act, or a throwaway tag).
  Writing YAML is not testing YAML.
- **Report evidence, not claims.** "Fixed" must come with the command run and its output
  (test results, artifact listing, sample rows) — the user verifies critically.
- Full gate before done: `npm run typecheck && npm run lint && npm run format:check &&
npm run test:unit`.

## 6. Release & CI patterns

- **Build once, promote many.** Tag push → CI builds the signed artifact → separate manual
  workflow promotes that exact artifact to a track/environment. Reuse the artifact;
  a rebuild at deploy time risks a different (or unsigned) output.
- **Verification gates in workflows:** locate the artifact, verify it exists, list it —
  fail loudly on mismatch instead of uploading garbage.
- Version bumps are atomic: all version fields (e.g. `app.json` version +
  `versionCode`/`versionName` in gradle.properties) change together, in one commit.
- Fallback paths (e.g. rebuild-from-tag) must be tested, not just written — they're the
  #1 place stale copy-paste hides.

## 7. Secrets & credentials

- Never in code, never committed — env vars locally (`.env.release.local`), GitHub Secrets
  in CI. Binary secrets (keystores) as base64 secrets, decoded at build time.
- Verify gitignore covers `.env*`, `*.keystore`, `*.jks`, `*service-account*.json`,
  `credentials.json` before any commit that touches those areas.
- Signing config is all-or-nothing: if any required signing input is missing/blank,
  treat it as a hard failure — a "successful" unsigned build is worse than a failed one.

## 8. Anti-patterns (learned the hard way)

- **Partial config → silent degradation.** One missing env var producing an unsigned/
  broken artifact with only a warning. Make it fail instead.
- **Cross-project copy-paste.** Cloned infra keeps old project's var names
  (`CAREXPLORER_*` vs `UNPEEKY_RELEASE_*`) and "works" until the code path runs.
  When cloning a workflow, grep for the old project's name/prefix.
- **Multiple credential artifacts in one repo** (several keystores, EAS-managed vs
  manual). Confirm which one is the registered/authoritative one before using it.
- **Version desync** across the multiple files that declare a version.

## 9. Per-project docs

Each repo should have its own agent knowledge file with: stack + identifiers, release
flow, secrets inventory, known gotchas. Keep it updated when release infra or conventions
change. Current projects: Unpeeky (Expo/RN, prebuilt android/, Gradle releases),
CarExplorer (same shape, predecessor), OCDP (Supabase/Vercel data platform).
