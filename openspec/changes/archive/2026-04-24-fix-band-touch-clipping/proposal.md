## Why

In column layout mode, items are grouped into fixed-height bands (300px) for VirtualizedList virtualization. Items are assigned to bands based on their top edge only — their height is ignored. When an item's bottom edge extends past the band boundary, React Native clips touch events to the parent View's bounds. This creates touch dead zones at the bottom of items that straddle band boundaries, making buttons and interactive elements unreachable for ~40% of items in a typical grid.

## What Changes

- Modify `sliceIntoBands()` in `src/utils.ts` to use adaptive band heights that expand to fully contain all assigned items
- Band height becomes `max(DEFAULT_BAND_HEIGHT, max(item.top - bandTop + item.height))` for items in the band
- No changes to the component API, types, or rendering logic
- `getColumnItemLayout` already reads `band.height` and `band.top` dynamically, so variable band heights are already supported by the rendering path

## Capabilities

### New Capabilities
- `adaptive-band-heights`: Band containers dynamically expand their height to fully contain all assigned items, eliminating touch dead zones at band boundaries

### Modified Capabilities
<!-- No existing spec requirements are changing — column layout behavior is preserved, only the internal banding mechanism changes -->

## Impact

- **File modified**: `src/utils.ts` (`sliceIntoBands` function)
- **Compiled output**: `lib/utils.js`
- **Affected modes**: Column layout mode only (row mode does not use bands)
- **User impact**: Touch events now reliably reach all items regardless of position within the grid
- **No breaking changes**: No API surface changes; existing code continues to work identically
- **Performance**: Negligible — bands grow slightly taller (worst case ~519px vs 300px), still well within VirtualizedList optimization range

## Non-goals

- Changing band assignment logic (items still assigned by top edge)
- Modifying row layout mode
- Adding new props or API surface
- Changing item positioning or sizing calculations
- Removing the banding optimization entirely
