# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
