# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [58.0.0] - 2026-10-28

### Changed

- **Expo SDK 58 Compatibility**: pinned the dev toolchain to the versions Expo SDK 58 ships — `react-native@0.88.1`, `react@19.3.1`, `@types/react@19.3.0`
- **Removed `@types/react-native`**: it is a deprecated stub; React Native has shipped its own type definitions since 0.73
- **TypeScript pinned to `6.0.3`**: every released `@typescript-eslint` parser caps its `typescript` peer at `>=4.8.4 <6.1.0`, so the previously declared `7.0.2` made `npm install` fail with `ERESOLVE` (the lockfile had quietly stayed on 5.9.3). TypeScript 7 returns as soon as the lint toolchain accepts it
- **`moduleResolution: "bundler"`** in `tsconfig.json`: the `node10` value is deprecated and errors under TypeScript 6, and `bundler` matches the React Native 0.88 base config
- **Exact dependency versions**: `devDependencies` moved from caret ranges to exact pins, per the project rule; `@typescript-eslint/*` to `8.72.1` and Babel to `7.29.7` within their existing majors
- **`eslint` stays on `8.57.1`** (the final 8.x): `ts-standard@12` requires `eslint ^8`, so the eslint 9/10 majors are not installable with this lint setup
- **VirtualizedList typing migrated** to the React Native 0.88 types, which dropped the generic parameter from `VirtualizedListProps` and the component itself. Base props now derive from `React.ComponentProps<typeof VirtualizedList>` so consumers on React Native 0.79–0.88 all typecheck against the published declarations. Types only — no runtime or public API change

### Compatibility

- Peer dependencies are unchanged (`react >=18.0.0 <20.0.0`, `react-native >=0.79.0 <1.0.0`), so Expo SDK 55–58 remain supported and this is not a breaking release
- No public API changes

## [57.0.0] - 2026-08-07

### Changed

- **Expo SDK 57 Compatibility**: Updated to align with Expo SDK 57
- **Versioning scheme**: Switched to year-based versioning to better reflect Expo SDK alignment

### Breaking

- **New versioning scheme**: This is a breaking change in versioning format (from 3.x to 57.x)

## [3.0.0] - 2026-08-07

### Changed

- **Expo SDK 57 Compatibility**: Updated dependencies to support Expo SDK 57 / React Native 0.86
- **Tightened peer dependency lower bound**: `react-native` now requires `>=0.79.0`, dropping support for Expo SDK < 55 (RN < 0.79)
- **Updated `@types/react`** to `^19.2.18`
- **Updated TypeScript** from `5.9.3` to `7.0.2`
- **Updated `@typescript-eslint/*`** packages to `^8.66.0`

### Breaking

- **Dropped support for Expo SDK < 55**: Apps on RN < 0.79 will get a peer dependency conflict on install

## [2.1.0] - 2026-05-03

### Added

- **Dynamic Expanded Height Measurement**: Expanded items are now automatically measured via `onLayout` after rendering. The layout self-corrects when the measured height differs from the initial estimate, supporting dynamic content like accordions, comment threads, and reply forms.
- **Row Mode Inline Expand**: `expandedItemIds` now works in row mode — expanded items become solo full-width rows with row packing flushed and resumed around them.
- **`notifyHeightChanged` Ref Method**: New imperative method on the component ref to programmatically update an expanded item's measured height and trigger re-layout.
- **Measurement Batching**: Multiple `onLayout` measurements within the same frame are batched via `requestAnimationFrame` into a single re-render.

### Changed

- **`getExpandedHeight` is now optional**: When omitted, `screenWidth` is used as the default estimate. Auto-measurement corrects the height after the first render.
- **`expandedItemIds` no longer column-only**: The prop now works in both row and column layout modes.
- **Height priority chain**: Expanded item heights resolve as: measured height → `getExpandedHeight` estimate → `screenWidth` default.
- **Measurement cleanup on collapse**: When an item is collapsed, its measured height is cleared from the cache.

## [2.0.0] - 2026-04-24

### Added

- **Column Layout Mode**: New `layoutMode="column"` for Pinterest-style vertical column-based masonry layout
- **Responsive Column Count**: `columns` prop accepts breakpoint config for adaptive column counts
- **Extra Height**: `getExtraHeight` callback for adding dynamic per-item content below images
- **Inline Expand**: `expandedItemIds` and `getExpandedHeight` for full-width detail views
- **Shadow-Friendly Rendering**: Item containers don't clip overflow for proper shadow rendering
- **Auto-Scroll on Expand**: `autoScrollOnExpand` prop for automatic scroll positioning
- **Imperative Scroll API**: `scrollToItem` and `scrollToOffset` via ref
- **Natural Band Boundaries**: Column mode uses natural band boundaries for seamless virtualization

## [1.2.0] - 2026-03-06

### Changed

- **Expo SDK 55 Compatibility**: Updated dependencies to support Expo SDK 55.0.5 (React Native 0.83.x, React 19.2.x)
- **Removed `@types/react-native`**: Types are now bundled with React Native 0.73+; the separate `@types/react-native` package is no longer needed
- **Updated `@types/react`** to `^19.1.1` to match React Native 0.83's peer dependency
- **Updated TypeScript** from 5.7.2 to 5.9.3
- **Updated Babel packages** (`@babel/core`, `@babel/preset-env`, `@babel/preset-typescript`) to latest 7.x
- **Updated `@typescript-eslint` packages** to `^8.56.1`
- **Updated minimum Node.js version** from 16 to 18 in `engines` field

## [1.1.0] - 2025-08-23

### Added

- **Custom Dimension Override Support**: New functionality to override automatic dimension calculation
  - `preserveItemDimensions` prop: Globally respect exact dimensions when provided in items
  - `preserveDimensions` property on `MasonryItem`: Per-item dimension preservation flag
  - `getItemDimensions` callback prop: Custom function to calculate dimensions dynamically
- **Enhanced Layout Flexibility**: Support for mixed layout strategies combining auto-calculation with exact dimensions
- **Priority-based Dimension Resolution**: Clear hierarchy for dimension calculation (custom function > preserve flags > auto-calculation)

### Changed

- **Enhanced MasonryItem Interface**: Added optional `preserveDimensions` boolean property
- **Updated Layout Algorithm**: Modified to handle items with preserved dimensions without scaling
- **Improved Documentation**: Added comprehensive examples and usage patterns for custom dimensions

### Developer Experience

- **TypeScript Support**: Full type safety for all new features
- **Example Components**: Added `ExampleWithCustomDimensions.tsx` demonstrating various usage patterns
- **Updated README**: Comprehensive documentation with examples for all dimension override strategies

### Technical Details

- Layout algorithm now respects exact dimensions when requested while maintaining masonry flow
- Items with preserved dimensions bypass height normalization and width scaling
- Overflow handling for preserved dimensions that exceed container width
- Maintained backward compatibility - all existing code continues to work unchanged

## [1.0.9] - Previous Release

- (Previous changelog entries would go here)
