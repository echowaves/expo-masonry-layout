# expo-masonry-layout — agent guide

High-performance masonry layout component for React Native and Expo. TypeScript library in `src/`,
compiled to `lib/`; `example/` is a scratch Expo app for manual verification.

## Commands

| Task | Command |
| --- | --- |
| Build (typecheck + emit) | `npm run build` (`tsc`) |
| Lint | `npm run lint` (`ts-standard`), fix with `npm run lint:fix` |
| Test | `npm run test` (Jest, tests in `__tests__/`) |

Run all three before declaring a change done. Do not commit `lib/` or `*.tgz`; they are ignored.

## Hard rules

- **No new dependencies** without the user explicitly requesting or approving one. Solve the problem
  with what is already installed and built-in APIs first.
- **Exact dependency versions.** Install with `npm install --save-exact` and write `"1.2.3"`, never
  `"^1.2.3"` or `"~1.2.3"`. Caret ranges already in `devDependencies` predate this rule; leave them
  unless the task is about them, and never widen a range casually — `ts-standard` pins `eslint` to 8.x.
- **Public API changes** (props, exported types, ref methods, exported functions) require updates to
  both `README.md` and `CHANGELOG.md` in the same change.
- **Versioning tracks the Expo SDK major** (currently `57.x`). Tightening the supported SDK window is
  breaking and must be called out under a `### Breaking` heading in `CHANGELOG.md`.
- Peer dependency floor is `react-native >=0.79.0` (Expo SDK 55+); see the compat spec below.

## Behavior contract

[docs/specs/](./docs/specs/README.md) holds the requirement-and-scenario contract per capability
(column layout, inline expand, dynamic expanded height, auto-scroll, band heights, shadow rendering,
SDK compatibility). Read the relevant spec before changing that capability, and update it in the same
change when the required behavior changes.

## Planning and work tracking

This project runs on **BMad** (OpenSpec was removed on 2026-10-28 — do not reintroduce it or add
`openspec/`, `opsx-*` prompts, or OpenSpec skills).

- Config lives in `_bmad/` (`_bmad/config.toml` shared, `_bmad/custom/config.user.toml` personal and
  git-ignored). Ask the `bmad` agent to check or update the installation.
- Planning artifacts go in the output folder `_bmad-output/`, under the active initiative recorded as
  `core.active_initiative`. Scope reads to the active initiative; historical plans are evidence, not a
  substitute for current code.
- Route work by size: `bmad-build` for a change one session can finish; Sofia the Product Owner
  (`bmad-agent-po`) to write tickets and slice epics when it is bigger; `bmad-architecture` only once a
  ticket exists and a real decision is at stake; `bmad-code-review` before landing.
