## Context

The masonry layout uses VirtualizedList for performance, grouping items into horizontal "bands" for virtualization. Currently, bands are sliced at fixed 300px grid intervals. When items straddle a boundary, the band expands adaptively, pushing subsequent bands down in the scroll view while items retain their original grid positions — creating visible gaps.

Two prior attempts to fix this failed:
1. **Adaptive band heights** (fix-band-touch-clipping): Expanded bands to contain overflowing items. Fixed touch dead zones but introduced gaps.
2. **Cumulative top recalculation** (fix-band-gap-coordinates): Added `contentTop` to separate grid-space from scroll-space coordinates. The coordinate bookkeeping was correct, but the gap is inherent — expanding band 0 physically displaces band 1 in the scroll view.

The root cause: fixed-interval boundaries routinely cut through items. Any boundary that intersects an item forces the band to expand, which displaces everything below it.

## Goals / Non-Goals

**Goals:**
- Eliminate visible gaps between bands by choosing boundaries where no item crosses
- Maintain correct touch event delivery (no items clipped by band containers)
- Keep `getItemLayout` offsets correct for VirtualizedList scrolling
- Simplify the codebase by removing adaptive height expansion and dual-coordinate system

**Non-Goals:**
- Guaranteeing uniform band heights
- Changing how `calculateColumnMasonryLayout` positions items
- Modifying row layout mode

## Decisions

**Decision 1: Find natural band boundaries using item bottom edges**

Instead of slicing at fixed 300px intervals, collect all item-bottom-edge y-coordinates (item.top + item.height + spacing) as candidate split points. A valid split point is a y-coordinate where ALL columns have a gap (no item spans across it). Walk candidates to find splits near every ~300px target.

Algorithm:
1. Sort all normal items by top position
2. For each column, build a list of occupied intervals: `[item.top, item.top + item.height]`
3. Collect candidate split points: every `item.top + item.height + spacing` value
4. A candidate is valid if it falls in a gap for every column
5. Greedily select valid candidates nearest to multiples of `targetBandHeight` (300)
6. If no valid candidate exists within a region, use the region end as the boundary (fallback)

Rationale: This ensures no item ever crosses a band boundary. Band height equals the exact distance between boundaries, so `band.top` is both the grid-coordinate origin AND the cumulative scroll position — no coordinate mismatch.

Alternatives considered:
- **Keep adaptive heights + fix coordinates**: Tried this (fix-band-gap-coordinates). The gap is structural — when band 0 grows, band 1 starts further down in the scroll view than items expect. Cannot be fixed without either moving items or aligning boundaries.
- **Rewrite item positions after banding**: Would fix the gap but mutates item data, affecting `onItemLayout` callbacks and making debugging harder.

**Decision 2: Remove `contentTop` and `computeAdaptiveBandHeight`**

With natural boundaries, every item is fully contained within its band. `band.top` equals the grid-coordinate position of the boundary, and cumulative stacking matches grid positions. The dual-coordinate system (`top` vs `contentTop`) becomes unnecessary.

Rationale: Simpler code, fewer concepts. The `contentTop` field was a workaround for a problem that natural boundaries eliminate entirely.

**Decision 3: Handle expanded items as boundary-forcing points**

Expanded items already create dedicated single-item bands. They naturally act as forced boundaries — the regions between expansions are processed independently for natural boundary detection.

Rationale: No change needed to expanded-item handling. The existing region-based approach works directly with natural boundaries.

## Risks / Trade-offs

**[Risk]** No valid split point exists within a large region (e.g., one column has a very tall item spanning 800px) → **Mitigation**: Fall back to the region end as the boundary. In practice, with 3+ columns and typical image aspect ratios, natural gaps occur every 200-500px. A single oversized band is acceptable for virtualization — VirtualizedList handles variable heights via `getItemLayout`.

**[Risk]** Very short bands (< 100px) if items are small and uniform → **Mitigation**: Enforce a minimum target distance between boundaries. Skip candidates that would create bands smaller than ~200px. This keeps band count reasonable.

**[Risk]** Performance of boundary detection → **Mitigation**: O(n) in item count to build intervals, O(n) to check candidates. For typical grids (hundreds of items, 3-4 columns), this is negligible compared to layout calculation.
