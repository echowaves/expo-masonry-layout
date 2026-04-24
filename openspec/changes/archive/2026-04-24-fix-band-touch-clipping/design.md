## Context

The `sliceIntoBands()` function in `src/utils.ts` groups absolutely-positioned masonry items into horizontal bands for VirtualizedList virtualization. Each band is rendered as a `<View>` with `position: 'relative'` and a fixed `height`.

Currently, bands use a fixed height of 300px (`DEFAULT_BAND_HEIGHT`). Items are assigned to bands based on their `top` edge only. An item whose top is at y=250 with height=219 extends to y=469 — well past the band boundary at y=300. React Native clips touch delivery to parent View bounds, so the bottom 169px of that item cannot receive touches despite being visually rendered.

The rendering pipeline already supports variable band heights: `renderBand` positions items relative to `band.top`, and `getColumnItemLayout` reads `band.height` and `band.top` from the computed data. Only the slicing function needs to change.

## Goals / Non-Goals

**Goals:**
- Eliminate touch dead zones caused by items extending past band boundaries
- Maintain the banding optimization for VirtualizedList performance
- Keep the change internal with zero API surface impact

**Non-Goals:**
- Changing how items are assigned to bands (still by top edge)
- Modifying the rendering path in ExpoMasonryLayout.tsx
- Adding new props or configuration options for band height
- Changing row mode layout (does not use bands)

## Decisions

**Decision 1: Adaptive band heights via post-assignment adjustment**

After items are filtered into a band, compute the maximum bottom extent of all items relative to the band top. If any item extends past the default band height, grow the band to contain it.

```
adjustedHeight = max(bandHeight, max(item.top - bandTop + item.height) for each item)
```

Rationale: This is the minimal change — item assignment stays the same (by top edge), only the band's `height` property changes. No items move between bands. No rendering changes needed.

Alternatives considered:
- **Greedy band building** (walk items sorted by top, start new band when next item won't fit): More complex, changes item-to-band assignment, harder to reason about with expanded items
- **Duplicate rendering** (render items in multiple bands): Key collisions, double state, double touch handlers — significantly more complex
- **Remove banding entirely** (one VirtualizedList item per masonry item): Large refactor across types, rendering, and key extraction; risks perf regression with large grids

**Decision 2: Apply the same logic to both expansion-region bands and trailing bands**

The `sliceIntoBands` function has three band-creation sites: pre-expansion regions, post-expansion regions, and the trailing region. All three need the same adaptive height adjustment.

Rationale: The bug affects any band with fixed height, regardless of where it falls relative to expanded items.

**Decision 3: No changes to DEFAULT_BAND_HEIGHT constant**

The 300px default remains as the minimum band height. Bands only grow larger when needed. Most bands will stay at 300px.

Rationale: Changing the default would be a blunt instrument. Adaptive heights target exactly the bands that need it.

## Risks / Trade-offs

**[Risk]** Larger band Views reduce virtualization benefit → **Mitigation**: Worst case is a band growing to ~519px (300 + 219 for a 0.56 AR portrait item in a 3-column layout on a 390pt screen). This is still well within VirtualizedList's efficient range. Typical screens show 2-3 bands — a few being taller won't measurably impact memory or render performance.

**[Risk]** Edge case with very tall custom-dimensioned items → **Mitigation**: The adaptive height handles arbitrarily tall items correctly by definition — the band grows to contain whatever is assigned to it.

**[Risk]** Bands with zero items could get incorrect height → **Mitigation**: If no items match a band, it gets the default height (the `max(...)` over an empty set returns -Infinity, but the outer `Math.max(bandHeight, ...)` clamps to the default). Add a guard for empty bands.

## Migration Plan

1. Modify `sliceIntoBands()` in `src/utils.ts`
2. Add/update unit tests for band height calculation
3. Run `npm run build` to compile
4. Publish as patch version (no breaking changes)

Rollback: Revert the single function change. No data migration or compatibility concerns.
