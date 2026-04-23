## Context

The library now supports column-based masonry layout with `layoutMode: 'column'`, responsive column counts, and `getExtraHeight` for dynamic per-item content. The current column layout engine (`calculateColumnMasonryLayout`) places items into the shortest column sequentially, producing positioned items that are sliced into horizontal bands for VirtualizedList virtualization.

Items are currently all the same width (`columnWidth`). There is no mechanism for an item to span the full grid width or for the layout to be recalculated based on runtime state changes beyond data/prop changes.

The consumer (WiSaw) needs inline detail expansion: tapping a photo expands it full-width in-place with larger image, comments, and interaction buttons — without leaving the feed.

## Goals / Non-Goals

**Goals:**
- Allow any item in column mode to expand to full grid width inline, pushing content below it down
- Support multiple simultaneously expanded items
- Full layout recalculation on each expand/collapse state change
- Clean integration with existing band-based virtualization
- Keep the API minimal: controlled `expandedItemIds` prop + `getExpandedHeight` callback + `isExpanded` flag in render info

**Non-Goals:**
- Expand/collapse animation (consumer responsibility)
- Expand support in row mode
- Automatic expand state management (consumer controls the state)
- Async or onLayout-based height measurement for expanded items

## Decisions

### 1. Waterline flushing for expanded items

**Decision:** When the layout engine encounters an expanded item during the sequential placement pass, it flushes all columns to the current waterline (max of all column heights), places the expanded item at full width at that point, then resets all column heights to `waterline + expandedHeight + spacing`.

**Alternatives considered:**
- *Leave expanded item in its column, just make it wider:* Breaks the column grid, overlaps adjacent columns, complex clipping issues.
- *Remove expanded item from masonry and render in a separate overlay layer:* Loses the "inline" feel, essentially becomes a modal.

**Rationale:** Waterline flushing creates clean horizontal "breaks" where expanded items span the full width. Items above are unaffected. Items below resume normal column flow from a level baseline. This is the same approach CSS masonry implementations use for spanning elements.

### 2. Expanded items as their own bands

**Decision:** In `sliceIntoBands()`, expanded items are extracted into dedicated single-item bands rather than being assigned to a fixed-height band by their top edge.

The band sequence becomes:
```
[Band: normal items 0-300px]
[Band: normal items 300-600px]
[Band: EXPANDED item E, height=500px]    ← own band
[Band: normal items 1100-1400px]
[Band: EXPANDED item H, height=600px]    ← own band
[Band: normal items 1700-2000px]
```

**Alternatives considered:**
- *Duplicate expanded items into all overlapping bands:* Causes double-rendering and key conflicts in VirtualizedList.
- *Stretch the containing band to fit:* Breaks the fixed-band-height assumption, reduces virtualization effectiveness.

**Rationale:** Giving each expanded item its own band means VirtualizedList sees it as a single virtualized unit with accurate height. `getItemLayout` returns the correct size. No duplication, no rendering artifacts.

### 3. Controlled component pattern for expand state

**Decision:** `expandedItemIds: string[]` is a controlled prop. The library does not manage expand state internally. The consumer toggles IDs in/out and the layout recomputes via `useMemo` dependency on `expandedItemIds`.

**Alternatives considered:**
- *Uncontrolled: library manages expand state with `onExpandChange` callback:* Less flexible, harder for consumer to implement business rules (e.g., "collapse others when expanding").
- *Callback-based: `getItemSpan(item) => 'full' | 'column'`:* Merges the "which items" and "how wide" concerns. Less explicit.

**Rationale:** Controlled state is the React convention for this kind of interaction. The consumer already tracks which items are expanded for their UI logic. Passing the IDs in is zero overhead.

### 4. `getExpandedHeight` replaces normal height calculation

**Decision:** When an item is expanded, its height comes entirely from `getExpandedHeight(item, fullWidth)`. Neither aspect-ratio-based height nor `getExtraHeight` are applied. `extraHeight` is passed as `0` in `MasonryRenderItemInfo`.

**Rationale:** The expanded view is a completely different layout — larger image, comments list, action buttons. The consumer computes the total height needed for all that content. Mixing in the normal height pipeline would create confusing interactions.

### 5. Expanded item width = screenWidth - 2 * spacing

**Decision:** The full width for expanded items uses the same outer margins as the grid: `screenWidth - 2 * spacing`. The `left` position is `spacing`.

**Rationale:** Aligns with the grid's horizontal edges. Consistent visual rhythm.

### 6. Expanded item identification during layout

**Decision:** Convert `expandedItemIds` to a `Set<string>` at the start of `calculateColumnMasonryLayout` for O(1) lookup during the item loop. Match by `item.id`.

**Rationale:** The layout iterates all items sequentially. A Set lookup per item is negligible cost. Using `item.id` (already required by `MasonryItem`) is the natural key.

## Risks / Trade-offs

**[Frequent relayout on rapid expand/collapse]** → Layout is O(n) and synchronous. For datasets under ~5000 items this should be under 16ms. If it becomes a bottleneck, the consumer can debounce state changes.

**[Dead space above expanded items]** → When columns are uneven at the point of expansion, flushing to waterline creates gaps in shorter columns. This is inherent to the approach and visually acceptable — same as CSS masonry column-span behavior. → No mitigation needed, it's expected behavior.

**[Band count increases with expanded items]** → Each expanded item adds one band to the VirtualizedList. With many expanded items this increases the band count. → VirtualizedList handles this well since it only renders visible bands. Not a practical concern.

**[No animation support]** → Expanding/collapsing causes an instant layout jump. → Consumer can wrap their `renderItem` in `LayoutAnimation.configureNext()` or use `react-native-reanimated` for transitions. Keeping animation out of the library avoids opinionated dependencies.
