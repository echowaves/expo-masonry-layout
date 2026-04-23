## Why

Shadows and other effects that extend beyond item bounds are being clipped by `overflow: 'hidden'` on the library's itemContainer wrapper. This creates visual artifacts where soft shadows appear with hard square edges instead of extending smoothly.

The itemContainer uses absolute positioning with explicit width/height, which already contains content bounds. The overflow clipping is redundant and prevents shadows and elevated visual effects from rendering correctly.

## What Changes

- Remove `overflow: 'hidden'` from `itemContainer` stylesheet in ExpoMasonryLayout
- Shadows and shadow-based effects will now render smoothly without clipping
- No API changes or breaking changes

## Capabilities

### New Capabilities
- `shadow-rendering`: Enables smooth shadow rendering for masonry items by removing unnecessary overflow clipping from the item container

### Modified Capabilities
<!-- No existing spec requirements are changing -->

## Impact

- **File modified**: `src/ExpoMasonryLayout.tsx` (styles)
- **Compiled output**: `lib/ExpoMasonryLayout.js`
- **Affected components**: All masonry items in row and column modes
- **User impact**: Visual improvements - shadows render correctly without clipping
- **No breaking changes**: Existing code continues to work; visual appearance improves

## Non-goals

- Changing how items are positioned or sized
- Modifying spacing or layout calculations
- Adding new styling options or props
