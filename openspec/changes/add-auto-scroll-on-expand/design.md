## Context

The masonry layout component supports inline expand in column mode: items can be expanded to full-width with `expandedItemIds` and `getExpandedHeight`. The layout engine correctly recalculates positions — waterline flushing, band slicing, and item placement all work. However, when `expandedItemIds` changes, the scroll position remains unchanged, so the expanded or collapsed item ends up off-screen. Consumers have no way to programmatically scroll the underlying VirtualizedList to the toggled item.

## Goals / Non-Goals

**Goals:**
- Enable automatic scrolling to items when they are expanded or collapsed
- Provide an escape-hatch callback for custom scroll behavior
- Expose the VirtualizedList ref via `forwardRef` for direct scroll control
- Provide a `scrollToItem(id)` imperative method for convenience

**Non-Goals:**
- Animated expand/collapse height transitions
- Changing layout calculation logic
- Scroll behavior for row mode
- Scroll position persistence across data changes

## Decisions

### Decision 1: Track previous expandedItemIds with useRef to detect toggles

**Choice**: Use a `useRef` to store the previous `expandedItemIds` value, diff against current in a `useEffect` to determine which items were just expanded or collapsed.

**Alternatives considered**:
- Require the consumer to pass a `lastToggledItemId` prop — shifts bookkeeping to the consumer, error-prone
- Compare inside `useMemo` during layout calc — side effects during render are unsafe

**Rationale**: `useRef` + `useEffect` is the standard React pattern for detecting prop changes. The diff is O(n) with a Set lookup, negligible for realistic expanded item counts.

### Decision 2: Use useEffect for scroll timing

**Choice**: Fire scroll and `onExpandedItemLayout` callback from a `useEffect` that depends on `columnLayoutData` and `expandedItemIds`.

**Rationale**: `useEffect` runs after React commits the render, so the VirtualizedList has updated its content and `scrollToOffset` targets the correct position. Firing during render (in `useMemo` or during band rendering) would be unsafe for side effects.

### Decision 3: Wrap component with React.forwardRef and useImperativeHandle

**Choice**: Use `React.forwardRef` to accept a ref, maintain an internal `listRef` for the VirtualizedList, and expose `scrollToItem`, `scrollToOffset` via `useImperativeHandle`.

**Alternatives considered**:
- Expose only the raw VirtualizedList ref — leaks internal implementation details
- No ref at all, only `autoScrollOnExpand` — insufficient for custom behavior

**Rationale**: `useImperativeHandle` provides a stable, minimal API surface. `scrollToItem(id)` encapsulates the band-lookup logic so consumers don't need to understand the internal band structure.

### Decision 4: Scroll target selection for multi-toggle

**Choice**: When multiple items are toggled simultaneously, scroll to the first toggled item by data order (index in `data` array). Prefer added items over removed items.

**Rationale**: Deterministic and predictable. In practice, users toggle one item at a time; the multi-toggle case is an edge case where any reasonable behavior suffices.

### Decision 5: autoScrollOnExpand prop shape

**Choice**: `autoScrollOnExpand?: boolean | { animated?: boolean, viewOffset?: number }`.
- `true` is shorthand for `{ animated: true, viewOffset: 0 }`
- `viewOffset` controls pixels from the top of viewport to the target item

**Alternatives considered**:
- Adding a `position: 'top' | 'center'` option — over-engineering for initial release; `viewOffset` is more flexible
- Separate `scrollAnimated` and `scrollOffset` props — clutters the API

### Decision 6: Interaction with maintainVisibleContentPosition

**Choice**: Keep `maintainVisibleContentPosition` as-is. The auto-scroll `useEffect` fires after the layout commit, and `scrollToOffset` will override any position maintenance adjustment. If jitter is observed, use `requestAnimationFrame` to defer the scroll by one frame.

**Rationale**: Removing `maintainVisibleContentPosition` would regress existing scroll stability for non-expand scenarios. The auto-scroll call should win because it fires after the content position adjustment.

## Risks / Trade-offs

- **[One-frame flash]** The `useEffect` scroll fires after render, so there may be a single frame where the old scroll position is visible before the scroll animation begins. → Mitigation: `scrollToOffset` with `animated: true` makes this imperceptible; for zero-animation mode, the frame is too brief to notice.
- **[maintainVisibleContentPosition conflict]** On collapse, content above shrinks and `maintainVisibleContentPosition` adjusts the offset, then `scrollToOffset` fires. → Mitigation: Test empirically; wrap scroll in `requestAnimationFrame` if needed.
- **[forwardRef type change]** Wrapping with `forwardRef` changes the component's type signature. Consumers explicitly typing `typeof ExpoMasonryLayout` may see type errors. → Mitigation: This is non-breaking at runtime; document in changelog.
