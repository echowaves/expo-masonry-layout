## ADDED Requirements

### Requirement: Expanded item IDs prop
The component SHALL accept an `expandedItemIds` prop of type `string[]` that specifies which items are currently in their expanded state. When not provided or empty, all items render in their normal collapsed column layout.

#### Scenario: No expanded items
- **WHEN** `expandedItemIds` is not provided or is an empty array
- **THEN** the layout renders identically to the existing column mode behavior with no changes

#### Scenario: One item expanded
- **WHEN** `expandedItemIds` contains a single item ID that exists in `data`
- **THEN** that item is rendered full-width at the current waterline and all items below it are shifted down

#### Scenario: Multiple items expanded
- **WHEN** `expandedItemIds` contains multiple item IDs
- **THEN** each expanded item creates its own full-width horizontal break in the column flow, with normal column placement resuming between them

#### Scenario: Expanded ID not in data
- **WHEN** `expandedItemIds` contains an ID that does not match any item in `data`
- **THEN** the layout ignores the unmatched ID and renders normally

### Requirement: Expanded height callback
The component SHALL accept a `getExpandedHeight` prop of type `(item: MasonryItem, fullWidth: number) => number` that computes the total height of an expanded item. This callback MUST be provided when `expandedItemIds` is non-empty.

#### Scenario: Height calculation
- **WHEN** an item is expanded and `getExpandedHeight` is called
- **THEN** it receives the item and the full grid width (`screenWidth - 2 * spacing`) and SHALL return the total pixel height for the expanded view

#### Scenario: getExtraHeight not applied to expanded items
- **WHEN** an item is expanded
- **THEN** `getExtraHeight` SHALL NOT be called for that item; the expanded height replaces the entire normal height calculation

#### Scenario: Missing getExpandedHeight warns in column mode
- **WHEN** `layoutMode` is `'column'`, `expandedItemIds` is non-empty, and `getExpandedHeight` is not provided
- **THEN** the component SHALL emit a runtime warning indicating `getExpandedHeight` is required for expanded items

### Requirement: Waterline flushing on expanded item
When the column layout engine encounters an expanded item during sequential placement, it SHALL flush all columns to the current waterline (maximum of all column heights), place the expanded item full-width at that waterline, and reset all column heights to `waterline + expandedHeight + spacing`.

#### Scenario: Columns at different heights before expansion
- **WHEN** columns have heights [250, 400, 300] and the next item is expanded with height 500
- **THEN** the expanded item is placed at top=400 (waterline), left=spacing, width=screenWidth - 2*spacing, height=500, and all column heights reset to 400 + 500 + spacing

#### Scenario: Two consecutive expanded items
- **WHEN** two consecutive items in data order are both expanded
- **THEN** the first expanded item flushes and spans full width, then the second expanded item flushes to the new waterline (which equals the bottom of the first) and spans full width immediately below

### Requirement: Expanded item dimensions in renderItem
The `MasonryRenderItemInfo` passed to `renderItem` SHALL include an `isExpanded: boolean` field. When `isExpanded` is `true`, `dimensions.width` SHALL equal the full grid width, `dimensions.height` SHALL equal the value from `getExpandedHeight`, and `extraHeight` SHALL be `0`.

#### Scenario: Collapsed item render info
- **WHEN** an item is not in `expandedItemIds`
- **THEN** `isExpanded` is `false`, dimensions reflect normal column placement, and `extraHeight` reflects `getExtraHeight` if provided

#### Scenario: Expanded item render info
- **WHEN** an item is in `expandedItemIds`
- **THEN** `isExpanded` is `true`, `dimensions.width` is `screenWidth - 2 * spacing`, `dimensions.height` is the value from `getExpandedHeight`, `columnIndex` is `undefined`, and `extraHeight` is `0`

### Requirement: Band virtualization with expanded items
Expanded items SHALL each be placed in their own dedicated band in the VirtualizedList. Normal items between expansion points SHALL be grouped into fixed-height bands as before.

#### Scenario: Expanded item as own band
- **WHEN** slicing positioned items into bands and an item is expanded
- **THEN** the expanded item is placed in its own band with `height` equal to its expanded height, not grouped with other items

#### Scenario: Normal items between expansions
- **WHEN** there are normal (collapsed) items between two expanded items
- **THEN** those items are grouped into standard fixed-height bands (default 300px)

### Requirement: Layout recalculation on expand state change
The layout SHALL fully recalculate when `expandedItemIds` changes. The `useMemo` dependency array SHALL include `expandedItemIds`.

#### Scenario: Item expanded triggers relayout
- **WHEN** `expandedItemIds` changes from `[]` to `['item-5']`
- **THEN** the entire column layout is recalculated with item-5 placed full-width at its waterline position

#### Scenario: Item collapsed triggers relayout
- **WHEN** `expandedItemIds` changes from `['item-5']` to `[]`
- **THEN** the layout reverts to normal column placement for all items

### Requirement: Column mode only
The inline expand feature SHALL only apply in column layout mode (`layoutMode: 'column'`). In row mode, `expandedItemIds` SHALL be ignored.

#### Scenario: Row mode ignores expanded IDs
- **WHEN** `layoutMode` is `'row'` and `expandedItemIds` is `['item-5']`
- **THEN** the layout renders in normal row mode with no expansion behavior
