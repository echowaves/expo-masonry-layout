## Context

The masonry layout component supports inline expansion of items in column mode. Expanded items span full width and are placed in their own VirtualizedList bands. Currently, the expanded item's height must be predicted in advance via `getExpandedHeight(item, fullWidth)`, which is called during layout calculation before the item renders.

This works for static expanded content but fails for live components whose height changes over time — comment threads loading, reply forms opening, accordion sections toggling. The consumer cannot predict these heights and has no mechanism to update the layout when the expanded component's internal state changes.

## Goals / Non-Goals

**Goals:**
- Expanded items auto-measure their rendered height via `onLayout`, updating the layout whenever their content changes shape
- Layout positions (band heights, downstream offsets, `getItemLayout`) stay consistent with measured heights
- Measurement updates are batched per frame to prevent layout thrashing
- Row mode gains inline expand support with the same auto-measurement behavior
- `getExpandedHeight` becomes optional, serving only as an initial estimate
- An imperative `notifyHeightChanged(id, height)` method is available for explicit control

**Non-Goals:**
- Measuring collapsed item heights (they remain predictive)
- Animated height transitions during measurement corrections
- Changing band structure (re-slicing) after measurement — only band heights and offsets change

## Decisions

### Decision 1: No height constraint on expanded item wrapper

**Choice**: Render expanded items without a fixed `height` style on their wrapper View. The content determines its natural height. An `onLayout` handler on the wrapper reports the actual height.

**Why**: Setting a fixed height and then trying to measure the content requires either a hidden measurement View (expensive) or measuring the inner content while the outer clips (requires the inner to have no height constraint anyway). Removing the height constraint is simpler and gives correct first-frame rendering when the estimate is close.

**Alternative considered**: Keep fixed height and use a nested unconstrained View for measurement. Rejected because it adds an extra View layer to every expanded item and the clipping during measurement can hide content.

**Trade-off**: If the initial estimate is significantly wrong, the expanded item's band will be the wrong height for one frame, causing items below to be mispositioned until `onLayout` fires. This is acceptable because (a) `getExpandedHeight` provides a good initial estimate, and (b) `maintainVisibleContentPosition` handles scroll offset adjustments for changes above the viewport.

### Decision 2: Internal `measuredHeights` state map

**Choice**: Store measured heights in a `useRef<Map<string, number>>` combined with a state counter that triggers re-renders when measurements change. The layout calculation functions receive the map and prefer measured values over `getExpandedHeight` estimates.

**Why**: A ref-based map avoids creating a new Map object on every measurement (which would defeat `useMemo` deps). The state counter is a cheap way to signal that layout needs recalculation.

**Alternative considered**: Store measured heights in state directly as a plain object. Rejected because each `onLayout` would create a new state object, and during initial render many items might measure in rapid succession, causing cascading re-renders.

### Decision 3: Batched per-frame updates

**Choice**: When `onLayout` fires, queue the measurement in a pending map. Use `requestAnimationFrame` (via `InteractionManager.runAfterInteractions` or a simple RAF) to flush all pending measurements into the ref map and bump the state counter once.

**Why**: Multiple expanded items (or one item with multiple sub-components) may measure in the same frame. Batching avoids N separate re-renders. A single flush produces one re-layout pass.

**Alternative considered**: Debounce with a timeout. Rejected because RAF naturally batches within a frame without adding artificial delay.

### Decision 4: Row mode expanded items as solo rows

**Choice**: Modify `calculateRowMasonryLayout` to check for expanded items. When an expanded item is encountered, flush the current row, place the expanded item as a solo full-width row, then continue row packing with the next item.

**Why**: This mirrors exactly how column mode handles expansion (flush to waterline, solo band). The row layout already supports variable-height rows, so a solo expanded row is just a row with one item at full width.

### Decision 5: Band heights from measured values

**Choice**: In `renderBand` / `renderRow`, the band/row height used in the View style is derived from `measuredHeights` for expanded items rather than the layout-computed value. `getItemLayout` also reads from the same source, ensuring VirtualizedList's understanding of band positions matches the rendered reality.

**Why**: `getItemLayout` and the rendered band height must agree. If they diverge, VirtualizedList miscalculates scroll positions and visible item ranges.

### Decision 6: Clear measurements on collapse

**Choice**: When `expandedItemIds` changes and an item is removed (collapsed), delete its entry from `measuredHeights`. If it re-expands later, measurement starts fresh from the `getExpandedHeight` estimate.

**Why**: The expanded component likely unmounts on collapse. When it re-expands, its internal state is reset, so the previous measurement is stale.

## Risks / Trade-offs

- **One-frame layout mismatch on initial expand**: The band height uses the `getExpandedHeight` estimate until `onLayout` fires. If the estimate is far off, items below the expanded item may briefly jump. → Mitigation: consumers provide a reasonable `getExpandedHeight` estimate. The correction is typically small and follows a user action (tap to expand), so the shift feels intentional.

- **`getItemLayout` offset recalculation cost**: Every time a measured height changes, all downstream band offsets must be recomputed. → Mitigation: this is O(number of bands), which is typically small (total items / ~4 items per band). The computation is trivial.

- **Row mode row height change on measurement**: When an expanded item's measured height changes in row mode, the row height changes, shifting all subsequent rows. → Mitigation: identical to column mode — `maintainVisibleContentPosition` handles scroll adjustment for changes above the viewport.

- **No convergence loop risk**: In column mode, item widths are fixed by column width. In row mode, expanded items are solo full-width. Width doesn't change when height changes, so measurement converges in exactly one pass.
