## Context

expo-masonry-layout is a published npm package with `peerDependencies` on React (>=18) and React Native (>=0.70). The library has no direct Expo SDK dependency — it depends on Expo indirectly through React Native version alignment. Expo SDK 57 ships with React Native 0.86. The current devDependencies pin `@types/react-native` at `0.73.0` and TypeScript at `5.9.3`.

This upgrade skips SDK 56 (the user confirmed targeting the latest available) and tightens the lower bound to drop pre-SDK-55 support.

## Goals / Non-Goals

**Goals:**
- Raise `peerDependencies.react-native` lower bound from `0.70.0` to `0.79.0` (Expo SDK 55's RN version).
- Update `devDependencies` to versions compatible with Expo SDK 57 / RN 0.86 so the library builds and lints cleanly.
- Bump library version to 3.0.0 (major) to signal the breaking peer dependency change.
- Verify the existing source code compiles without errors under the updated toolchain.

**Non-Goals:**
- Adopting React Native New Architecture (Fabric/TurboModules).
- Changing the library's public API or behavior.
- Adding Expo as a direct dependency.
- Supporting Expo SDK versions older than 55.

## Decisions

1. **Tighten `peerDependencies.react-native` to `>=0.79.0 <1.0.0`**
   - Drops support for Expo SDK < 55 (RN < 0.79).
   - Keeps the upper bound at `<1.0.0` for forward compatibility.
   - *Why:* The `0.70.0` floor was 6+ minor versions behind. We only test against recent SDKs (3 versions back). Aligning the declared floor with our actual support window prevents silent incompatibilities.

2. **Keep `peerDependencies.react` at `>=18.0.0 <20.0.0`**
   - React 18 is still supported by RN 0.79+ (SDK 55).
   - The `react-native` peer dep is the real gatekeeper; RN declares its own React peer.
   - *Why:* Keeping React permissive avoids false negatives. If someone has React 18 + RN 0.79+, it works because RN 0.79 accepts React 18.

3. **Update `@types/react-native` to `0.86.x`**
   - Replace `0.73.0` with the version matching RN 0.86.
   - *Why:* Type mismatches cause build failures for consumers using `skipLibCheck: false`.

4. **Update all devDependencies to latest available versions**
   - `typescript`: latest stable 5.x
   - `@types/react`: latest available
   - Babel packages, ESLint packages: latest compatible versions
   - *Why:* User explicitly requested targeting the latest available versions.

5. **Version bump: major (3.0.0)**
   - Tightening peer dependency lower bounds is a breaking change for consumers on older RN.
   - *Why:* Semantically correct — npm will show this as a breaking change, and consumers on RN < 0.79 will get a clear signal they can't upgrade.

## Risks / Trade-offs

- **[Breaking] Consumers on SDK < 55 can no longer install** → This is intentional. The `>=0.79.0` lower bound means npm will reject installs on older RN versions. This is documented as a breaking change in the 3.0.0 release.
- **[Risk] React Native 0.86 introduces breaking type changes** → Mitigation: Review TypeScript compilation output carefully; fix any type errors in source. No source changes expected (user confirmed RN 0.86 requires no JS changes).
- **[Risk] `@types/react-native` 0.86.x may not be published yet** → User confirmed it's OK (types are available).
- **[Trade-off] Skipping SDK 56** → We jump from 55 to 57 directly. This is fine since the upper bound stays `<1.0.0`, and the lower bound targets SDK 55 which is still supported.
