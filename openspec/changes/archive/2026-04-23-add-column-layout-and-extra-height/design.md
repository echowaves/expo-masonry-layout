## Context

The library provides a row-based masonry layout for React Native, where items fill rows left-to-right, are scaled to a uniform row height, and rows are virtualized via `VirtualizedList`. The layout engine (`calculateRowMasonryLayout` in `src/utils.ts`) runs synchronously in `useMemo` and produces `MasonryRowData[]` consumed by the list.

The component needs a column-based layout mode (items flow top-to-bottom in columns of fixed width) and a mechanism for consumers to add extra height per item (for text, badges, etc.) in both modes. Both features must preserve infinite scroll performance with large datasets.

## Goals / Non-Goals

**Goals:**
- Add column-based masonry layout as an opt-in mode alongside the existing row mode
- Support responsive column count based on screen width
- Virtualize column-mode rendering for infinite scroll performance
- Provide `getExtraHeight(item, computedWidth)` callback for both modes
- Maintain full backwards compatibility — no changes to default behavior

**Non-Goals:**
- Horizontal scrolling layouts
- Built-in text rendering or text measurement
- Async layout or multi-pass rendering
- Adding new npm dependencies

## Decisions

### 1. Column layout algorithm: shortest-column placement

**Decision**: Place each item into the column with the smallest cumulative height.

**Rationale**: This is the standard masonry algorithm (used by `react-masonry-css`, Pinterest, etc.). It produces visually balanced columns. The alternative — round-robin placement — creates unbalanced columns when items have varying aspect ratios.

**Algorithm**:
```
columnHeights = [0, 0, ..., 0]  // N columns
for each item:
  col = index of min(columnHeights)
  itemWidth = columnWidth
  itemHeight = columnWidth / aspectRatio + extraHeight
  item.left = col * (columnWidth + spacing) + spacing
  item.top = columnHeights[col]
  columnHeights[col] += itemHeight + spacing
```

### 2. Virtualization in column mode: horizontal band slicing

**Decision**: Slice the computed layout into horizontal bands of fixed height and virtualize bands as items in `VirtualizedList`.

**Alternatives considered**:
- **Multiple synced FlatLists** (one per column): Scroll synchronization is fragile and not natively supported in React Native. Rejected.
- **ScrollView with absolute positioning** (no virtualization): Won't scale to thousands of items. Rejected.
- **Column-based VirtualizedList**: VirtualizedList assumes linear ordering; column items don't have monotonic vertical positions. Not directly compatible.

**How it works**:
1. `calculateColumnMasonryLayout()` produces all item positions `{x, y, w, h}`
2. `sliceIntoBands(items, bandHeight)` groups items by which band(s) they overlap
3. Each band becomes one entry in `VirtualizedList` data
4. A band renders all items whose vertical extent intersects it, using absolute positioning offset by the band's `top`
5. `getItemLayout` returns `{ length: bandHeight, offset: bandIndex * bandHeight }` for O(1) scroll-to

**Band height**: Use a sensible default (e.g., `300px`) that balances rendering granularity vs. overhead. Items spanning band boundaries are rendered in the band where they start.

### 3. Responsive column count

**Decision**: Accept `columns` as `number | { default: number, [breakpoint: number]: number }`. Use `useWindowDimensions().width` to select the active column count.

**Resolution logic**: Sort breakpoints descending, find the first one where `screenWidth >= breakpoint`, fall back to `default`. This mirrors CSS media query semantics (max-width breakpoints would be confusing in mobile context — use min-width instead).

Correction: to match the common pattern (and how `react-masonry-css` does it), breakpoints represent **max-width thresholds**. Sort breakpoints descending, find the first one where `screenWidth <= breakpoint`.

Actually, the simplest and most intuitive: `default` is used when no breakpoint matches. Breakpoints are width ceilings: `{ default: 3, 768: 2, 400: 1 }` means "3 columns by default, 2 when width ≤ 768, 1 when width ≤ 400". Evaluate from smallest breakpoint up.

### 4. `getExtraHeight` integration

**Decision**: A single callback `getExtraHeight(item: MasonryItem, computedWidth: number) => number` that works in both modes.

**Row mode integration** (two-pass):
1. Pass 1: existing layout calculates item widths and row heights (images only)
2. Pass 2: call `getExtraHeight(item, item.width)` for each item, row height becomes `max(imageHeight + extraHeight)` across all items in the row

**Column mode integration** (single pass, since width is known upfront):
1. `columnWidth` is known before placement
2. For each item: `totalHeight = (columnWidth / aspectRatio) + getExtraHeight(item, columnWidth)`
3. Place in shortest column

**renderItem receives**: `extraHeight: number` in `MasonryRenderItemInfo` so consumers know how to split `dimensions.height` between image and extra content.

### 5. Item assignment to bands (column mode)

**Decision**: Each item is assigned to exactly one band — the band where its top edge falls. Items may visually extend into the next band, but they're rendered only by their starting band.

**Rationale**: Rendering an item in multiple bands would cause duplicate React elements and key conflicts. Assigning to the starting band is simple and works because VirtualizedList renders a window of bands around the viewport — an item extending slightly into the next band is still visible since adjacent bands are typically mounted.

### 6. File organization

**Decision**: Keep all layout functions in `src/utils.ts`. Add the column layout calculation and band slicing there. Keep the component logic in `src/ExpoMasonryLayout.tsx` with mode branching.

**Rationale**: The codebase is small (4 source files). Splitting into separate files would be over-engineering at this scale.

## Risks / Trade-offs

**[Band boundary rendering]** → Items near band edges may briefly appear/disappear during fast scrolling. Mitigation: VirtualizedList's `windowSize` prop controls how many offscreen bands stay mounted. Default windowSize of 21 provides generous buffer.

**[Extra height estimation accuracy]** → `getExtraHeight` relies on consumer-provided estimates. If estimates are wrong, text may clip or leave gaps. Mitigation: This is inherent to synchronous layout. Document clearly that the callback should return the exact height needed. Consumers can use fixed heights or character-count heuristics.

**[Responsive column count re-layout]** → Rotating the device changes column count, triggering full re-layout. Mitigation: Layout is pure math in `useMemo` — fast even for thousands of items. No DOM/native measurement involved.

**[Row mode extraHeight row height inflation]** → If one item in a row has large `extraHeight`, the entire row grows to accommodate it, potentially wasting space for other items. Mitigation: This is expected behavior consistent with row-based layout. Items without extra content simply have more padding below them within the row.
