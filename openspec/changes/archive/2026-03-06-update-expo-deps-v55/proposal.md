## Why

Expo SDK 55 (v55.0.5) is the latest stable release. Updating ensures the library stays compatible with the current Expo ecosystem, picks up React Native improvements, and avoids consumers running into peer dependency conflicts when they upgrade their own apps to SDK 55.

## What Changes

- Update `peerDependencies` to support the React and React Native versions shipped with Expo SDK 55.
- Update `devDependencies` (`@types/react`, `@types/react-native`, `typescript`, and related tooling) to versions compatible with Expo SDK 55.
- Adjust `tsconfig.json` if any compiler options need to change for the new React Native version.
- Verify source code compiles and passes lint/tests under the updated dependencies.
- Update `engines` field if the minimum Node version requirement changes.

## Non-goals

- No new features or API changes to the masonry layout component itself.
- No migration to the New Architecture (Fabric/TurboModules) — that would be a separate change.
- No changes to the library's public API surface.

## Capabilities

### New Capabilities
- `expo-sdk-55-compat`: Ensure the library's peer and dev dependencies are aligned with Expo SDK 55.0.5 and its bundled React Native version.

### Modified Capabilities

_(none — no existing spec-level requirements are changing)_

## Impact

- **package.json**: `peerDependencies` ranges and `devDependencies` versions will be updated.
- **tsconfig.json**: May require minor adjustments for new TypeScript or React Native versions.
- **CI / build**: The `tsc` build and `ts-standard` lint must pass with the updated toolchain.
- **Consumers**: Downstream apps using Expo SDK 55 will be able to install this package without peer dependency warnings.
