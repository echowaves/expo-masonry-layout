## ADDED Requirements

### Requirement: Peer dependency compatibility with Expo SDK 55
The library's `peerDependencies` in package.json SHALL accept the React and React Native versions bundled with Expo SDK 55.0.5 without producing peer dependency warnings or errors during `npm install`.

#### Scenario: Install in an Expo SDK 55 project
- **WHEN** a consumer runs `npm install expo-masonry-layout` in a project using Expo SDK 55.0.5
- **THEN** npm SHALL NOT produce any peer dependency conflict warnings for `react` or `react-native`

#### Scenario: Install in an older supported Expo SDK project
- **WHEN** a consumer runs `npm install expo-masonry-layout` in a project using Expo SDK 51–54
- **THEN** npm SHALL NOT produce any peer dependency conflict warnings for `react` or `react-native`

### Requirement: DevDependencies aligned with Expo SDK 55 toolchain
The library's `devDependencies` SHALL use TypeScript and type definition versions compatible with Expo SDK 55.0.5's React Native version, so that `tsc` compiles the source without errors.

#### Scenario: Successful TypeScript build
- **WHEN** a developer runs `npm run build` after installing the updated devDependencies
- **THEN** `tsc` SHALL complete with zero errors

#### Scenario: Successful lint
- **WHEN** a developer runs `npm run lint` after installing the updated devDependencies
- **THEN** `ts-standard` SHALL complete with zero errors

### Requirement: No public API changes
The library's exported types, component props, and function signatures SHALL remain identical before and after the dependency update.

#### Scenario: Existing consumer code compiles
- **WHEN** a consumer upgrades to the new version of expo-masonry-layout
- **THEN** their existing TypeScript code using the library SHALL compile without modification
