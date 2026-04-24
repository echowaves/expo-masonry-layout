## Why

Fixed-interval band boundaries (every 300px) routinely cut through items, forcing adaptive height expansion that displaces subsequent bands. When band 0 grows from 300px to 450px, band 1 is pushed down 150px in the scroll view while its items remain at their original grid positions, creating visible gaps between bands. This is a fundamental coordinate mismatch that cannot be fixed by post-hoc recalculation.

## What Changes

- Replace fixed-interval band slicing with natural-boundary detection that finds y-coordinates where all columns have a gap between items
- Remove `computeAdaptiveBandHeight()` — bands sized to exact distance between natural boundaries never have overflows
- Remove `contentTop` field from `MasonryBandData` — with natural boundaries, `band.top` equals the grid-coordinate position (no coordinate mismatch)
- Revert `renderBand` item positioning from `photo.top - band.contentTop` back to `photo.top - band.top`
- Band heights become variable (matching actual content) instead of fixed 300px with adaptive expansion

## Capabilities

### New Capabilities
<!-- None — this replaces the internal banding algorithm, no new user-facing capability -->

### Modified Capabilities
- `adaptive-band-heights`: Replace adaptive expansion of fixed-interval bands with natural-boundary detection that eliminates the need for height expansion entirely

## Impact

- **Files modified**: `src/types.ts` (remove `contentTop`), `src/utils.ts` (rewrite `sliceIntoBands`, remove `computeAdaptiveBandHeight`), `src/ExpoMasonryLayout.tsx` (revert to `band.top` positioning)
- **Compiled output**: `lib/types.js`, `lib/utils.js`, `lib/ExpoMasonryLayout.js`
- **Tests**: Update `__tests__/utils.test.js` — replace adaptive-height and cumulative-coordinate tests with natural-boundary tests
- **No breaking changes**: No API surface changes; internal virtualization detail only

## Non-goals

- Changing item position calculations in `calculateColumnMasonryLayout`
- Modifying row layout mode
- Adding new props or configuration options
- Guaranteeing fixed band heights for virtualization — variable heights are acceptable since VirtualizedList handles them via `getItemLayout`
