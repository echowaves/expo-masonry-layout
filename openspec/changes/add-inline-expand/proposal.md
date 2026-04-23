## Why

Column-mode masonry grids currently require a modal or navigation-based detail view when the user taps an item. For photo feed experiences (like WiSaw), expanding an item inline — full-width, in-place, pushing content below it down — provides a more fluid interaction. Users can view a larger image, read comments, and interact without losing their scroll position. Multiple items can be expanded simultaneously.

## What Changes

- Add `expandedItemIds` prop (`string[]`) to specify which items are currently in their expanded state
- Add `getExpandedHeight(item, fullWidth) => number` callback to compute the height of an expanded item at full width
- When an item is expanded, the column layout engine flushes all columns to the current waterline (max column height), places the item full-width, then resumes column placement below it
- Pass `isExpanded: boolean` in `MasonryRenderItemInfo` so `renderItem` can branch between collapsed thumbnail and expanded detail view
- Expanded items get `dimensions.width` equal to `screenWidth - 2 * spacing` (full grid width) and `dimensions.height` from `getExpandedHeight`
- `getExtraHeight` is not applied to expanded items — the expanded height replaces the normal layout entirely
- Band virtualization splits at expansion boundaries so each expanded item becomes its own band for clean VirtualizedList rendering
- Full layout recalculates on every expand/collapse state change

## Non-goals

- Animation of the expand/collapse transition — consumers can layer their own animation on top
- Built-in expand/collapse gesture handling — the library provides the layout mechanism, consumers control the state
- Expand support in row mode — this feature targets column layout mode only
- Limiting the number of simultaneously expanded items — consumers manage that if needed

## Capabilities

### New Capabilities
- `inline-expand`: Full-width inline item expansion in column layout mode with multi-expand support, waterline-based column flushing, and band-aware virtualization

### Modified Capabilities

## Impact

- **Types**: `ExpoMasonryLayoutProps` gets `expandedItemIds` and `getExpandedHeight` props; `MasonryRenderItemInfo` gets `isExpanded` field
- **Utils**: `calculateColumnMasonryLayout()` modified to accept expanded item set and handle waterline flushing; `sliceIntoBands()` modified to split at expansion boundaries
- **Component**: `ExpoMasonryLayout.tsx` passes new props through to layout calculation and sets `isExpanded` in render callbacks
- **Files affected**: `src/types.ts`, `src/utils.ts`, `src/ExpoMasonryLayout.tsx`, `src/index.ts`
