## Why

Expanded items require consumers to predict their pixel height via `getExpandedHeight` before rendering. This is fragile — it breaks when content is dynamic (comments loaded, reply forms opened, accordions toggled). The expanded component's internal state changes its height over time, and there is no mechanism for the layout to track these changes. Additionally, inline expand only works in column mode; row mode ignores `expandedItemIds` entirely.

## What Changes

- **Auto-measurement for expanded items**: The masonry component wraps expanded items without a fixed height constraint and uses `onLayout` to continuously track their actual rendered height. When the expanded component's internal state changes (button clicks, embedded elements added/removed), the layout automatically adjusts.
- **Measured height overrides predicted height**: `getExpandedHeight` becomes an initial estimate. Once the expanded item renders and measures, the measured height takes priority. Layout recalculates band/row positions from the measured value.
- **Batched height updates**: Measurement-driven re-layouts are batched per animation frame to prevent layout thrashing when multiple measurements arrive simultaneously.
- **Row mode inline expand**: `expandedItemIds` and `getExpandedHeight` work in row mode. Expanded items become solo full-width rows, identical to how they become solo bands in column mode.
- **`getExpandedHeight` becomes optional**: When auto-measurement is active, consumers can omit `getExpandedHeight`. A default estimate is used for the first frame, then corrected by measurement.
- **Imperative `notifyHeightChanged(id, newHeight)`**: Added to the ref handle for consumers who want explicit control without auto-measurement.
- **Measured heights cleared on collapse**: When an item is removed from `expandedItemIds`, its measured height is discarded so re-expansion starts fresh from the estimate.

## Non-goals

- Measuring collapsed (non-expanded) item heights. Normal items remain predictive (aspect ratio + `getExtraHeight`).
- Animated height transitions. Height corrections apply immediately; animation is a separate concern.
- Replacing `getExpandedHeight` entirely. It remains useful as a first-frame estimate to minimize visual jank.

## Capabilities

### New Capabilities
- `dynamic-expanded-height`: Auto-measurement of expanded items via `onLayout`, batched height updates, imperative `notifyHeightChanged` handle method, and measured-height-overrides-estimate logic.

### Modified Capabilities
- `inline-expand`: Row mode support for `expandedItemIds` and `getExpandedHeight`. `getExpandedHeight` becomes optional when measurement is active. Expanded items in row mode become solo full-width rows.

## Impact

- **Files**: `src/ExpoMasonryLayout.tsx` (rendering, state, handle), `src/types.ts` (new props/handle methods), `src/utils.ts` (row-mode expand in layout calculation)
- **APIs**: New `notifyHeightChanged` on `ExpoMasonryLayoutHandle`. `getExpandedHeight` becomes optional. `expandedItemIds` works in both layout modes.
- **Breaking**: None. All changes are additive. Existing `getExpandedHeight` usage continues to work unchanged — auto-measurement layers on top.
