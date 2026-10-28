## Purpose

Defines the dependency floor and toolchain alignment required for Expo SDK 57 / React Native 0.86, and the versioning convention that replaced plain semver majors. Supersedes `expo-sdk-55-compat`.

Synced from the OpenSpec change `update-expo-deps-v57` (all tasks completed; shipped in releases 3.0.0 and 57.0.0) when this project moved to BMad.

## Requirements

### Requirement: Peer dependency compatibility with Expo SDK 57
The library's `peerDependencies` in package.json SHALL accept the React and React Native versions bundled with Expo SDK 57 (React Native 0.86) without producing peer dependency warnings or errors during `npm install`.

#### Scenario: Install in an Expo SDK 57 project
- **WHEN** a consumer runs `npm install expo-masonry-layout` in a project using Expo SDK 57 (RN 0.86)
- **THEN** npm SHALL NOT produce any peer dependency conflict warnings for `react` or `react-native`

#### Scenario: Install in Expo SDK 55–56 projects
- **WHEN** a consumer runs `npm install expo-masonry-layout` in a project using Expo SDK 55 or 56
- **THEN** npm SHALL NOT produce any peer dependency conflict warnings for `react` or `react-native`

#### Scenario: Install in Expo SDK < 55 projects
- **WHEN** a consumer runs `npm install expo-masonry-layout` in a project using Expo SDK older than 55 (RN < 0.79)
- **THEN** npm SHALL produce a peer dependency conflict for `react-native`, signaling that the library no longer supports older SDK versions

### Requirement: Peer dependency lower bound tightened
The `peerDependencies.react-native` lower bound SHALL be `>=0.79.0`, corresponding to the React Native version shipped with Expo SDK 55.

#### Scenario: Lower bound is correct
- **WHEN** inspecting `package.json`
- **THEN** `peerDependencies.react-native` SHALL have a lower bound of `>=0.79.0`

### Requirement: DevDependencies aligned with Expo SDK 57 toolchain
The library's `devDependencies` SHALL use TypeScript and type definition versions compatible with Expo SDK 57's React Native 0.86, so that `tsc` compiles the source without errors.

#### Scenario: Successful TypeScript build
- **WHEN** a developer runs `npm run build` after installing the updated devDependencies
- **THEN** `tsc` SHALL complete with zero errors

#### Scenario: Successful lint
- **WHEN** a developer runs `npm run lint` after installing the updated devDependencies
- **THEN** `ts-standard` SHALL complete with zero errors

#### Scenario: Successful tests
- **WHEN** a developer runs `npm test` after installing the updated devDependencies
- **THEN** Jest SHALL complete with zero test failures

### Requirement: Library version tracks the Expo SDK major
The library `version` in `package.json` SHALL track the major version of the Expo SDK it targets (currently `57.x`), as adopted after release 3.0.0. Tightening the supported SDK window is a breaking change and SHALL be recorded in `CHANGELOG.md`.

#### Scenario: Version matches target SDK
- **WHEN** inspecting `package.json`
- **THEN** `version` SHALL use the target Expo SDK major version as its major component

#### Scenario: CHANGELOG documents the breaking change
- **WHEN** reading `CHANGELOG.md`
- **THEN** there SHALL be an entry documenting the peer dependency lower bound change from `>=0.70.0` to `>=0.79.0`

### Requirement: No public API changes
The library's exported types, component props, and function signatures SHALL remain identical before and after the dependency update.

#### Scenario: Existing consumer code compiles
- **WHEN** a consumer on a supported SDK version (55+) upgrades to the new release
- **THEN** their existing TypeScript code using the library SHALL compile without modification
