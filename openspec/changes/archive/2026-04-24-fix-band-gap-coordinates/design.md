## Context

The adaptive band height fix (fix-band-touch-clipping) resolved touch dead zones by expanding band heights to contain overflowing items. However, it introduced a coordinate mismatch between two systems:

1. **Masonry coordinate space**: Items have absolute `top` positions computed by `calculateColumnMasonryLayout`. Bands are sliced at fixed 300px intervals — `bandTop = regionStart + b * 300`.
2. **VirtualizedList stacking**: Bands are rendered sequentially. Each band's scroll position equals the cumulative height of all preceding bands.

When a band expands from 300px to (say) 450px, the next band's `top` in the masonry space is still 300, but in the scroll view it starts at 450. This 150px difference manifests as a visible gap.

Items render correctly *within* each band (positions match at boundaries), but bands themselves are spaced too far apart.

## Goals / Non-Goals

**Goals:**
- Eliminate gaps between bands caused by adaptive height expansion
- Maintain correct item positioning within each band
- Keep `getColumnItemLayout` offsets correct for VirtualizedList scrolling

**Non-Goals:**
- Changing how items are assigned to bands
- Modifying masonry layout calculations
- Changing the component API

## Decisions

**Decision 1: Dual-coordinate approach with `contentTop`**

Add a `contentTop` field to `MasonryBandData` that preserves the original grid-coordinate origin. After building all bands, recalculate `band.top` as cumulative stacked positions.

- `band.contentTop` = original grid position (for `photo.top - band.contentTop` in renderBand)
- `band.top` = cumulative layout position (for `getColumnItemLayout` offset)

Rationale: This cleanly separates the two coordinate concerns without mutating item data. Item positions remain in the original masonry space. Only the band metadata carries both coordinates.

Alternatives considered:
- **Rewrite item positions**: Mutate each item's `top` to match cumulative band positions. Rejected — affects `onItemLayout` callbacks and makes debugging harder.
- **Use band index arithmetic**: Calculate offsets at render time. Rejected — requires access to all preceding bands during render, breaking the per-band rendering model.

**Decision 2: Recalculate `band.top` in a single pass after all bands are built**

After the existing band-building loop completes, walk all bands sequentially and set:
```
band.contentTop = band.top  // preserve original
band.top = cumulativeOffset  // set layout position
cumulativeOffset += band.height
```

Rationale: One pass, O(n) in band count (typically 3-10 bands). Clean separation from the band-building logic.

## Risks / Trade-offs

**[Risk]** `onItemLayout` callback reports dimensions with grid-coordinate `top` values, not scroll-coordinate values → **Mitigation**: This is actually correct behavior — `onItemLayout` should report item-relative positions, not scroll positions. No change needed.

**[Risk]** External consumers reading `band.top` may expect grid coordinates → **Mitigation**: `MasonryBandData` is internal to the library. No public API exposes band data directly.
