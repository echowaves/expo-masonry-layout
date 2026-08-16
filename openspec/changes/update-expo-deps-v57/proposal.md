## Why

Expo SDK 57 with React Native 0.86 is the latest stable release. Updating ensures the library stays compatible with the current Expo ecosystem, picks up React Native improvements, and avoids consumers running into peer dependency conflicts when they upgrade their own apps to SDK 57.

Additionally, this change tightens the lower bound of peer dependencies. The current `react-native: >=0.70.0` floor is 6+ minor versions behind, supporting versions we no longer test against. Raising it to SDK 55's RN version (~0.79) aligns the declared support window with what we actually maintain.

## What Changes

- Update `peerDependencies.react-native` lower bound from `>=0.70.0` to `>=0.79.0`, dropping support for Expo SDK < 55.
- Update `devDependencies` (`@types/react-native`, `@types/react`, `typescript`, and related tooling) to versions compatible with Expo SDK 57 and React Native 0.86.
- Bump library version to **3.0.0** (major) since tightening the peer dependency lower bound is a breaking change for consumers on older RN versions.
- Verify source code compiles and passes lint/tests under the updated dependencies.
- Update `CHANGELOG.md` with the 3.0.0 release notes.

## Non-goals

- No new features or API changes to the masonry layout component itself.
- No migration to the New Architecture (Fabric/TurboModules) — that would be a separate change.
- No changes to the library's public API surface.
- No changes to source code (`src/`) — only dependency and metadata updates.

## Capabilities

### New Capabilities
- `expo-sdk-57-compat`: Ensure the library's peer and dev dependencies are aligned with Expo SDK 57 and React Native 0.86.

### Modified Capabilities

_(none — no existing spec-level requirements are changing)_

## Impact

- **package.json**: `peerDependencies` lower bound tightened to RN 0.79+, `devDependencies` updated to latest versions, version bumped to 3.0.0.
- **CHANGELOG.md**: New 3.0.0 entry documenting the breaking change and dependency updates.
- **CI / build**: The `tsc` build and `ts-standard` lint must pass with the updated toolchain.
- **Consumers**: Apps on Expo SDK 55–57 will continue to work. Apps on SDK < 55 (RN < 0.79) will get a peer dependency conflict on install, signaling the breaking change.
