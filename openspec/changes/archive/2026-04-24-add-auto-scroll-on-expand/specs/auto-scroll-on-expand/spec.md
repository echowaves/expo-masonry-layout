## ADDED Requirements

### Requirement: autoScrollOnExpand prop
The component SHALL accept an `autoScrollOnExpand` prop that controls automatic scrolling when an item's expand/collapse state changes. When set to `true`, it SHALL behave as `{ animated: true, viewOffset: 0 }`. When set to an object, it SHALL accept `animated` (boolean, default `true`) and `viewOffset` (number, default `0`) properties. When not provided or `false`, no automatic scrolling SHALL occur.

#### Scenario: Auto-scroll enabled with boolean true
- **WHEN** `autoScrollOnExpand` is `true` and an item is expanded
- **THEN** the list SHALL scroll with animation so the expanded item's top edge is at the top of the viewport

#### Scenario: Auto-scroll with viewOffset
- **WHEN** `autoScrollOnExpand` is `{ animated: true, viewOffset: 50 }` and an item is expanded
- **THEN** the list SHALL scroll so the expanded item's top edge is 50 pixels below the top of the viewport

#### Scenario: Auto-scroll without animation
- **WHEN** `autoScrollOnExpand` is `{ animated: false }` and an item is expanded
- **THEN** the list SHALL scroll instantly (no animation) to the expanded item's position

#### Scenario: Auto-scroll disabled
- **WHEN** `autoScrollOnExpand` is not provided or is `false`
- **THEN** no automatic scrolling SHALL occur when items are expanded or collapsed

#### Scenario: Auto-scroll on collapse
- **WHEN** `autoScrollOnExpand` is enabled and an item is collapsed
- **THEN** the list SHALL scroll so the collapsed item is visible at the top of the viewport (adjusted by `viewOffset`)

### Requirement: Toggle detection via expandedItemIds diffing
The component SHALL internally track the previous value of `expandedItemIds` using a ref. After each layout recalculation, it SHALL diff the previous and current values to determine which items were just expanded (added to the set) or collapsed (removed from the set).

#### Scenario: Single item expanded
- **WHEN** `expandedItemIds` changes from `[]` to `['item-5']`
- **THEN** the component SHALL detect `item-5` as newly expanded

#### Scenario: Single item collapsed
- **WHEN** `expandedItemIds` changes from `['item-5']` to `[]`
- **THEN** the component SHALL detect `item-5` as newly collapsed

#### Scenario: Multiple simultaneous toggles
- **WHEN** `expandedItemIds` changes from `['item-2']` to `['item-5', 'item-9']`
- **THEN** the component SHALL detect `item-5` and `item-9` as newly expanded and `item-2` as newly collapsed

#### Scenario: No change in expanded IDs
- **WHEN** `expandedItemIds` is the same as the previous render (same IDs, same order or different order)
- **THEN** no toggle SHALL be detected and no scroll SHALL occur

### Requirement: Scroll target selection
When multiple items are toggled simultaneously, the component SHALL scroll to one target item. It SHALL prefer newly expanded items over newly collapsed items. Among items of the same toggle direction, it SHALL select the item that appears first in the `data` array (lowest index).

#### Scenario: One expanded, one collapsed simultaneously
- **WHEN** `item-3` is expanded and `item-7` is collapsed in the same state change
- **THEN** the scroll target SHALL be `item-3` (expanded takes priority)

#### Scenario: Multiple items expanded simultaneously
- **WHEN** `item-8` and `item-3` are both newly expanded
- **THEN** the scroll target SHALL be `item-3` (lower index in data)

#### Scenario: Only collapses
- **WHEN** `item-5` and `item-10` are both newly collapsed
- **THEN** the scroll target SHALL be `item-5` (lower index in data)

### Requirement: onExpandedItemLayout callback
The component SHALL accept an optional `onExpandedItemLayout` prop of type `(info: { item: MasonryItem, index: number, dimensions: MasonryDimensions, isExpanded: boolean }) => void`. This callback SHALL fire after layout recalculation for each item whose expand/collapse state just changed.

#### Scenario: Callback fires on expand
- **WHEN** `onExpandedItemLayout` is provided and `item-5` is newly expanded
- **THEN** the callback SHALL be called with `{ item: <item-5>, index: <data index>, dimensions: { width, height, left, top }, isExpanded: true }`

#### Scenario: Callback fires on collapse
- **WHEN** `onExpandedItemLayout` is provided and `item-5` is newly collapsed
- **THEN** the callback SHALL be called with `{ item: <item-5>, index: <data index>, dimensions: { width, height, left, top }, isExpanded: false }`

#### Scenario: Multiple items toggled
- **WHEN** three items change expand/collapse state simultaneously
- **THEN** the callback SHALL fire once for each of the three items

#### Scenario: Callback not provided
- **WHEN** `onExpandedItemLayout` is not provided
- **THEN** no error SHALL occur; the auto-scroll behavior (if enabled) SHALL still function independently

### Requirement: forwardRef and imperative handle
The component SHALL be wrapped with `React.forwardRef` and SHALL expose an imperative handle via `useImperativeHandle` with the following methods: `scrollToItem(id: string, options?: { animated?: boolean, viewOffset?: number })` and `scrollToOffset(offset: number, options?: { animated?: boolean })`.

#### Scenario: scrollToItem scrolls to expanded item
- **WHEN** the consumer calls `ref.current.scrollToItem('item-5', { animated: true })`
- **AND** `item-5` exists in the current layout data
- **THEN** the list SHALL scroll so `item-5`'s top edge aligns with the top of the viewport

#### Scenario: scrollToItem with viewOffset
- **WHEN** the consumer calls `ref.current.scrollToItem('item-5', { viewOffset: 100 })`
- **THEN** the list SHALL scroll so `item-5`'s top edge is 100 pixels below the viewport top

#### Scenario: scrollToItem with unknown ID
- **WHEN** the consumer calls `ref.current.scrollToItem('nonexistent')`
- **THEN** no scroll SHALL occur and no error SHALL be thrown

#### Scenario: scrollToOffset delegates to VirtualizedList
- **WHEN** the consumer calls `ref.current.scrollToOffset(500, { animated: true })`
- **THEN** the underlying VirtualizedList SHALL scroll to offset 500 with animation

### Requirement: Column mode only
Auto-scroll behavior, `onExpandedItemLayout`, and `scrollToItem` SHALL only operate in column layout mode. In row mode, `autoScrollOnExpand` and `onExpandedItemLayout` SHALL be ignored. The `scrollToOffset` imperative method SHALL work in both modes.

#### Scenario: Row mode ignores autoScrollOnExpand
- **WHEN** `layoutMode` is `'row'` and `autoScrollOnExpand` is `true`
- **THEN** no auto-scrolling SHALL occur

#### Scenario: scrollToOffset works in row mode
- **WHEN** `layoutMode` is `'row'` and the consumer calls `ref.current.scrollToOffset(200)`
- **THEN** the list SHALL scroll to offset 200

### Requirement: Scroll timing
The scroll action SHALL occur in a `useEffect` that runs after the layout has been committed to the DOM. The scroll SHALL NOT be triggered during render or inside `useMemo` callbacks.

#### Scenario: Scroll fires after render commit
- **WHEN** `expandedItemIds` changes and `autoScrollOnExpand` is enabled
- **THEN** the scroll SHALL execute in a `useEffect`, after the VirtualizedList has rendered with the new layout data
