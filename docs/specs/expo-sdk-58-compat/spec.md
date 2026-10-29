## Purpose

Defines the dependency floor and toolchain alignment required for Expo SDK 58 / React Native 0.88, and records why the supported SDK window did not move with this bump. Supersedes `expo-sdk-57-compat`.

## Requirements

### Requirement: Peer dependency compatibility with Expo SDK 58
The library's `peerDependencies` in package.json SHALL accept the React and React Native versions bundled with Expo SDK 58 (React 19.3.x, React Native 0.88.x) without producing peer dependency warnings or errors during `npm install`.

#### Scenario: Install in an Expo SDK 58 project
- **WHEN** a consumer runs `npm install expo-masonry-layout` in a project using Expo SDK 58 (RN 0.88)
- **THEN** npm SHALL NOT produce any peer dependency conflict warnings for `react` or `react-native`

#### Scenario: Install on the oldest supported SDK
- **WHEN** a consumer runs `npm install expo-masonry-layout` in a project using Expo SDK 55 (RN 0.79)
- **THEN** npm SHALL NOT produce any peer dependency conflict warnings for `react` or `react-native`

### Requirement: Supported window unchanged by the SDK 58 bump
The SDK 58 bump SHALL NOT tighten `peerDependencies`. The window stays `react >=18.0.0 <20.0.0` and `react-native >=0.79.0 <1.0.0`, so Expo SDK 55 through 58 remain supported and the release is not breaking.

#### Scenario: Lower bounds are unchanged
- **WHEN** inspecting `package.json` at version 58.0.0
- **THEN** `peerDependencies.react-native` SHALL still have a lower bound of `>=0.79.0`, and no `### Breaking` heading SHALL appear in the changelog entry for 58.0.0

### Requirement: Dev toolchain pinned to the Expo SDK 58 release set
The library's `devDependencies` SHALL pin, exactly and without range operators, the React / React Native / type definition versions that Expo SDK 58 ships: `react-native@0.88.1`, `react@19.3.1`, `@types/react@19.3.0`. The deprecated `@types/react-native` stub SHALL NOT be installed, since React Native ships its own types.

#### Scenario: Dependency tree resolves without flags
- **WHEN** a developer runs `npm install` from a clean checkout
- **THEN** npm SHALL resolve the tree with no `ERESOLVE` error and no peer dependency conflicts, and `npm ls react react-native @types/react typescript` SHALL report no `invalid:` entries

#### Scenario: Successful TypeScript build
- **WHEN** a developer runs `npm run build` against the React Native 0.88 type definitions
- **THEN** `tsc` SHALL complete with zero errors

#### Scenario: Tests still pass
- **WHEN** a developer runs the Jest suite after the update
- **THEN** Jest SHALL complete with zero test failures

### Requirement: TypeScript pinned below the linter's ceiling
`devDependencies.typescript` SHALL be a version accepted by every consumer of it in the toolchain. `@typescript-eslint/parser` (pulled in through `ts-standard`) caps its `typescript` peer at `<6.1.0`, so the pin SHALL stay within that ceiling while remaining current — currently `6.0.3`.

#### Scenario: Lint toolchain and compiler agree
- **WHEN** a developer runs `npm install` with the pinned TypeScript version
- **THEN** npm SHALL NOT report a `typescript` peer conflict for `@typescript-eslint/parser`, and `ts-standard` SHALL run using that same compiler

### Requirement: Library version tracks the Expo SDK major
The library `version` in `package.json` SHALL track the major version of the Expo SDK it targets, so a bump to Expo SDK 58 SHALL publish as `58.0.0`.

#### Scenario: Version matches target SDK
- **WHEN** inspecting `package.json`
- **THEN** `version` SHALL be `58.0.0`

### Requirement: No public API changes
The library's exported types, component props, and function signatures SHALL remain identical before and after the dependency update.

#### Scenario: Existing consumer code compiles
- **WHEN** a consumer on a supported SDK version (55+) upgrades to the new release
- **THEN** their existing TypeScript code using the library SHALL compile without modification
