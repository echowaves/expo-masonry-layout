## Why

After introducing adaptive band heights (fix-band-touch-clipping), visible gaps appear between bands in the masonry grid. The adaptive height fix correctly expands bands to contain overflowing items, but introduces a coordinate mismatch: item positions are computed in the original fixed-grid coordinate space while VirtualizedList stacks bands sequentially by their actual (expanded) heights. When a band grows beyond 300px, all subsequent bands are displaced downward, creating gaps.

## What Changes

- Add a `contentTop` field to `MasonryBandData` to preserve the original grid-coordinate origin for each band
- After computing all bands with adaptive heights, recalculate `band.top` as cumulative stacked positions
- Update `renderBand` to use `band.contentTop` for item-relative positioning instead of `band.top`
- `getColumnItemLayout` continues using `band.top` (now cumulative — correct for VirtualizedList offset)
- No changes to the component API or user-facing behavior

## Capabilities

### New Capabilities
<!-- None — this is a coordinate-system fix internal to the banding layer -->

### Modified Capabilities
- `adaptive-band-heights`: Band top positions are now recalculated cumulatively after adaptive height adjustment, and a contentTop field preserves the original grid origin for item positioning

## Impact

- **Files modified**: `src/types.ts` (add `contentTop` to `MasonryBandData`), `src/utils.ts` (cumulative top recalculation in `sliceIntoBands`), `src/ExpoMasonryLayout.tsx` (use `contentTop` in `renderBand`)
- **Compiled output**: `lib/types.js`, `lib/utils.js`, `lib/ExpoMasonryLayout.js`
- **Affected modes**: Column layout mode only
- **User impact**: Gaps between bands eliminated; items render at correct positions
- **No breaking changes**: No API surface changes

## Non-goals

- Changing item position calculations in `calculateColumnMasonryLayout`
- Modifying row layout mode
- Adding new props or configuration options
