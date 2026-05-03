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
The component SHALL accept an optional `getExpandedHeight` prop of type `(item: MasonryItem, fullWidth: number) => number` that computes an estimated total height of an expanded item. This callback serves as the initial height estimate before auto-measurement corrects it. When `getExpandedHeight` is not provided, the component SHALL use a default estimate.

#### Scenario: Height calculation
- **WHEN** an item is expanded and `getExpandedHeight` is provided
- **THEN** it receives the item and the full grid width (`screenWidth - 2 * spacing`) and SHALL return the estimated total pixel height for the expanded view

#### Scenario: getExtraHeight not applied to expanded items
- **WHEN** an item is expanded
- **THEN** `getExtraHeight` SHALL NOT be called for that item; the expanded height replaces the entire normal height calculation

#### Scenario: Missing getExpandedHeight uses default estimate
- **WHEN** `expandedItemIds` is non-empty and `getExpandedHeight` is not provided
- **THEN** the component SHALL use `screenWidth` as the default height estimate for expanded items and SHALL NOT emit a warning

#### Scenario: Measured height overrides getExpandedHeight
- **WHEN** an item is expanded and has both a `getExpandedHeight` estimate and a measured height from auto-measurement
- **THEN** the measured height SHALL be used for layout positioning

### Requirement: Waterline flushing on expanded item
When the column layout engine encounters an expanded item during sequential placement, it SHALL flush all columns to the current waterline (maximum of all column heights), place the expanded item full-width at that waterline, and reset all column heights to `waterline + expandedHeight + spacing`.

#### Scenario: Columns at different heights before expansion
- **WHEN** columns have heights [250, 400, 300] and the next item is expanded with height 500
- **THEN** the expanded item is placed at top=400 (waterline), left=spacing, width=screenWidth - 2*spacing, height=500, and all column heights reset to 400 + 500 + spacing

#### Scenario: Two consecutive expanded items
- **WHEN** two consecutive items in data order are both expanded
- **THEN** the first expanded item flushes and spans full width, then the second expanded item flushes to the new waterline (which equals the bottom of the first) and spans full width immediately below

### Requirement: Expanded item dimensions in renderItem
The `MasonryRenderItemInfo` passed to `renderItem` SHALL include an `isExpanded: boolean` field. When `isExpanded` is `true`, `dimensions.width` SHALL equal the full grid width, `dimensions.height` SHALL equal the measured height if available or the `getExpandedHeight` estimate, and `extraHeight` SHALL be `0`.

#### Scenario: Collapsed item render info
- **WHEN** an item is not in `expandedItemIds`
- **THEN** `isExpanded` is `false`, dimensions reflect normal column/row placement, and `extraHeight` reflects `getExtraHeight` if provided

#### Scenario: Expanded item render info with measurement
- **WHEN** an item is in `expandedItemIds` and has a measured height
- **THEN** `isExpanded` is `true`, `dimensions.width` is `screenWidth - 2 * spacing`, `dimensions.height` is the measured height, `columnIndex` is `undefined`, and `extraHeight` is `0`

#### Scenario: Expanded item render info without measurement
- **WHEN** an item is in `expandedItemIds` and has no measured height yet
- **THEN** `isExpanded` is `true`, `dimensions.width` is `screenWidth - 2 * spacing`, `dimensions.height` is the `getExpandedHeight` estimate (or default), `columnIndex` is `undefined`, and `extraHeight` is `0`

### Requirement: Band virtualization with expanded items
Expanded items SHALL each be placed in their own dedicated band in the VirtualizedList. Normal items between expansion points SHALL be grouped into fixed-height bands as before.

#### Scenario: Expanded item as own band
- **WHEN** slicing positioned items into bands and an item is expanded
- **THEN** the expanded item is placed in its own band with `height` equal to its expanded height, not grouped with other items

#### Scenario: Normal items between expansions
- **WHEN** there are normal (collapsed) items between two expanded items
- **THEN** those items are grouped into standard fixed-height bands (default 300px)

### Requirement: Layout recalculation on expand state change
The layout SHALL fully recalculate when `expandedItemIds` changes. The `useMemo` dependency array SHALL include `expandedItemIds`. After recalculation, if `autoScrollOnExpand` is enabled or `onExpandedItemLayout` is provided, the component SHALL detect which items were toggled and trigger the appropriate scroll or callback behavior.

#### Scenario: Item expanded triggers relayout
- **WHEN** `expandedItemIds` changes from `[]` to `['item-5']`
- **THEN** the entire column layout is recalculated with item-5 placed full-width at its waterline position

#### Scenario: Item collapsed triggers relayout
- **WHEN** `expandedItemIds` changes from `['item-5']` to `[]`
- **THEN** the layout reverts to normal column placement for all items

#### Scenario: Layout recalculation feeds scroll effect
- **WHEN** `expandedItemIds` changes and `autoScrollOnExpand` is enabled
- **THEN** the layout SHALL recalculate first, then a post-render effect SHALL use the new layout data to scroll to the toggled item

### Requirement: Both layout modes
The inline expand feature SHALL apply in both column layout mode (`layoutMode: 'column'`) and row layout mode (`layoutMode: 'row'`).

#### Scenario: Row mode supports expanded IDs
- **WHEN** `layoutMode` is `'row'` and `expandedItemIds` is `['item-5']`
- **THEN** item-5 is rendered as a solo full-width row, breaking the normal row packing flow

#### Scenario: Row mode expanded item placement
- **WHEN** `layoutMode` is `'row'` and an expanded item is encountered during row layout
- **THEN** the current row is flushed (rendered with items accumulated so far), the expanded item is placed as a solo full-width row, and row packing resumes with the next item

#### Scenario: Row mode expanded item dimensions
- **WHEN** an item is expanded in row mode
- **THEN** `dimensions.width` equals `screenWidth - 2 * spacing`, `dimensions.height` equals the measured height (or `getExpandedHeight` estimate), `isExpanded` is `true`, and `extraHeight` is `0`
