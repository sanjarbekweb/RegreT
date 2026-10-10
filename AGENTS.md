# Self-learning (for AI coding agents)

This file makes any coding agent **self-improving**: recognize a hard-won
"golden path" during a task and persist it so the next session starts already
knowing it, instead of rediscovering how to reach the DB, where the creds live,
how to deploy, or how to verify a change live.

It works with any agent that reads a standing instructions file (Codex, Zed,
Aider, Gemini CLI, …). Richer, tool-native installs exist too — an Agent Skills
format skill (`skills/self-learning/SKILL.md`) and a Cursor rule
(`.cursor/rules/self-learning.mdc`).

## The loop

**1. Recognize the moment.** Any one of these is a cue:
- a task only worked after several attempts, wrong turns, or a correction;
- you discovered project facts you didn't know up front — where creds/env vars
  live, a non-obvious command, a required sequence, a gotcha;
- an operational workflow likely to recur (reach the dev/prod DB, deploy, run
  migrations, seed data, verify live, tail the right logs);
- the user says "remember this" / "don't make me re-explain this next time".

Act on the cue immediately — **don't ask permission first**. Capture it, then
tell the user what you saved and where. They can always edit or delete it.

**2. Capture it where your tool auto-loads knowledge next session:**
- Global Agent Skills → `C:\Users\Mr David\.gemini\config\skills\<name>\SKILL.md`
- Project-level standing instructions → append a dated entry under [Learned](#learned) below.

Capture the **procedure** (commands, paths, the required order, gotchas) — not a
one-off answer — and the **failures** too: the approaches you ruled out and why,
so next time skips the dead-ends.

**3. Reuse.** Next session the persisted entry loads automatically (by skill/rule
description, or because this file is always read) and you start from the golden
path.

## Promotion rule

A saved entry is authoritative — future sessions trust it without re-deriving it.
Only promote a session to a durable entry when **all three** hold:

1. **A passing check** — the path was actually verified (a test passed, the
   command exited clean, the repro reproduced, the build went green). Record it.
   "Seemed to work" doesn't count.
2. **A named failure pattern** — you can name the failure it avoids or diagnoses,
   not a vague "sometimes it breaks".
3. **At least one ruled-out dead-end** — a concrete approach you tried and
   eliminated, with the reason.

If any is missing, it isn't durable yet — leave a tentative note (marked
unverified) or skip it. This keeps confident guesses out.

## Rules

- **Never write secret values** — no tokens, passwords, connection strings, or
  API keys. Record only *where* a secret lives (env var name, config/selector,
  secret manager). Reproducing a secret into a shared file leaks it.
- **A one-line fact or correction** → put it in lightweight notes/memory, not a
  whole rule or skill.
- **A genuine one-off** unlikely to recur → skip it.
- **Capture procedures, not answers** — teach how to approach the class of
  problem, so it generalizes next time.

## Learned

### 2026-10-10 — Test Suite Execution & Layered Verification
- **Goal**: Run test suite and production build cleanly without environment crashes.
- **Failure pattern**: DOM/Storage missing errors in Node test runner when executing client-facing utilities (`storage.ts`, `image-compress.ts`).
- **Verified by**: `npm test` (`vitest run`) exiting 0 (6 test files, 43 passed tests) and `npm run build` exiting 0 with all 14 static pages generated.
- **Steps**:
  1. Run `npm test` to execute Vitest across all test suites.
  2. Run `npm run build` to run Next.js TypeScript validation and static page generation.
- **Gotchas**: Client storage operations (`localStorage`) and Canvas APIs are executed under Node in tests; ensure code checks `typeof window === 'undefined'` or uses SSR fallbacks.
- **What didn't work**: Running Jest or browser-runner directly without Node SSR guards in storage/image-compress.

### 2026-10-10 — Testing Pyramid (Martin Fowler) Layer Separation in RegreT
- **Goal**: Maintain high test confidence and zero flaky tests by strictly placing logic at the right pyramid layer.
- **Failure pattern**: Fragile, bloated tests with duplicated business logic or embedding pure calculation logic inside React hooks without isolated unit tests.
- **Verified by**: `src/__tests__/unit-pyramid.test.ts` (16 unit tests for `calculateStreaks` and `calculateMasteryLevel` passing in 19ms).
- **Steps**:
  1. Extract pure business rules and calculation logic (e.g. `calculateStreaks` in `src/lib/analytics.ts`, `calculateMasteryLevel` in `src/lib/sr-algorithm.ts`).
  2. Write Layer 1 Unit tests for pure logic with zero external dependencies.
  3. Keep Storage/API cascade logic at Layer 2 Integration level (`src/__tests__/storage-and-ai.test.ts`, `src/__tests__/heatmap-and-sync.test.ts`).
- **Gotchas**: Do not test config values (e.g. asserting static category list shapes) or framework internals.
- **What didn't work**: Duplicating `calcStreak` inside test files rather than exporting and testing the real implementation.

### 2026-10-10 — UTC Date Invariance & Spaced Repetition State Transitions
- **Goal**: Guarantee deterministic date intervals and prevent state corruption in SM-2 spaced repetition across all client timezones.
- **Failure pattern**:
  1. *Timezone/DST drift*: Mixing local date mutation (`setDate`) with UTC serialization (`toISOString()`) caused reviews to drift across calendar days depending on client UTC offset.
  2. *Mastery demotion regression*: Passing reviews (`grade >= 3`) on cards with intermediate repetition counts (2-3) erroneously demoted `mastered` words back to `reviewing` because lower-tier thresholds matched first.
- **Verified by**: `npm test` (`vitest run`) exiting 0 (6 test files, 49 passed tests including boundary and invariant checks) and `npm run build` exiting 0 (14 static pages).
- **Steps**:
  1. Perform calendar interval calculations strictly with UTC methods (`Date.UTC`, `getUTCFullYear`, `getUTCMonth`, `getUTCDate`, `setUTCDate`).
  2. Explicitly preserve `mastered` status when `grade >= 3` in `calculateMasteryLevel`, allowing resets to `learning` only on `grade === 1`.
  3. Support both `StreakDay` objects and raw number arrays in `calculateStreaks` to allow direct reuse in heatmap components and unit tests.
- **Gotchas**: Never rely on Node.js `process.env.TZ` on Windows as C++ runtime does not dynamically update timezone after boot.
- **What didn't work**: Relying on local `nextDate.setDate(nextDate.getDate() + intervalDays)` before calling `.toISOString().split('T')[0]`.

