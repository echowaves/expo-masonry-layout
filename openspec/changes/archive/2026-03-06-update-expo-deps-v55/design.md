## Context

expo-masonry-layout is a published npm package with `peerDependencies` on React (>=18) and React Native (>=0.70). The library has no direct Expo SDK dependency — it depends on Expo indirectly through React Native version alignment. Expo SDK 55.0.5 ships with a specific React Native version, updated TypeScript tooling, and potentially new React types. The current devDependencies pin TypeScript 5.7.2 and use `@types/react` ^19 and `@types/react-native` ^0.72.

## Goals / Non-Goals

**Goals:**
- Ensure `peerDependencies` ranges accept the React and React Native versions bundled with Expo SDK 55.0.5.
- Update `devDependencies` to versions compatible with Expo SDK 55 so the library builds and lints cleanly.
- Verify the existing source code compiles without errors under the updated toolchain.
- Publish a patch/minor version bump so consumers on Expo SDK 55 can install without warnings.

**Non-Goals:**
- Adopting React Native New Architecture (Fabric/TurboModules).
- Changing the library's public API or behavior.
- Adding Expo as a direct dependency.
- Supporting Expo SDK versions older than 51.

## Decisions

1. **Widen `peerDependencies` rather than pin them**
   - `react` range stays `>=18.0.0 <20.0.0` (already covers SDK 55's React).
   - `react-native` range will be updated to `>=0.70.0` with an upper bound that includes the React Native version in SDK 55. If SDK 55 ships React Native 0.79+, the range becomes `>=0.70.0 <0.80.0` or wider as needed.
   - *Why:* Wide ranges let the library work across multiple Expo SDK versions without forcing upgrades.

2. **Update `@types/react-native` to match SDK 55's React Native**
   - Replace `@types/react-native` ^0.72 with the version matching SDK 55's React Native.
   - *Why:* Type mismatches cause build failures for consumers using `skipLibCheck: false`.

3. **Keep TypeScript version on latest stable (5.x)**
   - Update `typescript` from 5.7.2 to the latest 5.x stable if a newer version is available.
   - *Why:* Newer TS versions include better React Native type support and bug fixes.

4. **Version bump strategy: minor**
   - Bump the library version as a minor release (e.g., 1.2.0) since the peer dependency range is widening but no breaking changes are introduced.
   - *Why:* Widening peer deps is additive and not breaking for existing consumers.

## Risks / Trade-offs

- **[Risk] React Native version in SDK 55 introduces breaking type changes** → Mitigation: Review TypeScript compilation output carefully; fix any type errors in source.
- **[Risk] Widened peer dep range allows untested combinations** → Mitigation: The range is conservative and only extended to cover SDK 55's known React Native version.
- **[Risk] `@types/react-native` may lag behind RN releases** → Mitigation: If types aren't published yet, use `skipLibCheck` temporarily and track the issue.
