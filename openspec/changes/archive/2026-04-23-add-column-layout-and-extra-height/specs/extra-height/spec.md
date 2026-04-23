## ADDED Requirements

### Requirement: getExtraHeight callback prop
The component SHALL accept an optional `getExtraHeight` prop of type `(item: MasonryItem, computedWidth: number) => number`. When provided, it SHALL be called for each item during layout calculation to determine additional height below the image area.

#### Scenario: No getExtraHeight provided
- **WHEN** `getExtraHeight` prop is not provided
- **THEN** all items SHALL have `extraHeight` of 0 (existing behavior unchanged)

#### Scenario: getExtraHeight returns positive value
- **WHEN** `getExtraHeight` returns 40 for a given item
- **THEN** the item's total layout height SHALL be `imageHeight + 40`

#### Scenario: getExtraHeight returns zero
- **WHEN** `getExtraHeight` returns 0 for a given item
- **THEN** the item's total layout height SHALL equal the image height only

### Requirement: getExtraHeight receives computed width
The `getExtraHeight` callback SHALL receive the item's computed width (after layout scaling) as the second argument, enabling width-dependent height calculations (e.g., text wrapping estimates).

#### Scenario: Width argument in row mode
- **WHEN** `layoutMode` is `'row'` and an item's scaled width is 180px
- **THEN** `getExtraHeight` SHALL be called with `computedWidth = 180`

#### Scenario: Width argument in column mode
- **WHEN** `layoutMode` is `'column'` and column width is 150px
- **THEN** `getExtraHeight` SHALL be called with `computedWidth = 150`

### Requirement: Extra height in row mode layout
In row mode, when `getExtraHeight` is provided, the row height SHALL be `max(imageHeight + extraHeight)` across all items in the row. Items with less extra height SHALL be vertically positioned within the row according to existing alignment behavior.

#### Scenario: Row height with mixed extra heights
- **WHEN** a row has 3 items with image height 100 and extra heights 0, 20, 40
- **THEN** the row height SHALL be 140 (100 + 40)

#### Scenario: Row height with no extra height
- **WHEN** `getExtraHeight` returns 0 for all items in a row
- **THEN** the row height SHALL equal the image height (existing behavior)

### Requirement: Extra height in column mode layout
In column mode, when `getExtraHeight` is provided, each item's total height SHALL be `scaledImageHeight + extraHeight`. This total height SHALL be used when determining column cumulative heights for shortest-column placement.

#### Scenario: Item height includes extra
- **WHEN** an item has scaled image height 200 and `getExtraHeight` returns 30
- **THEN** the item SHALL occupy 230px of vertical space (plus spacing) in its column

#### Scenario: Extra height affects column balancing
- **WHEN** items in column 1 all have `extraHeight` of 50 and items in column 2 have 0
- **THEN** column 2 SHALL receive more items to balance total heights

### Requirement: extraHeight in MasonryRenderItemInfo
`MasonryRenderItemInfo` SHALL include an `extraHeight` field containing the value returned by `getExtraHeight` for that item (or 0 if `getExtraHeight` is not provided). The `dimensions.height` field SHALL include the extra height in the total.

#### Scenario: renderItem receives extraHeight
- **WHEN** `getExtraHeight` returns 40 for an item with image height 100
- **THEN** `renderItem` SHALL receive `dimensions.height = 140` and `extraHeight = 40`

#### Scenario: renderItem with no getExtraHeight
- **WHEN** `getExtraHeight` is not provided
- **THEN** `renderItem` SHALL receive `extraHeight = 0`

### Requirement: Row mode two-pass layout for extraHeight
In row mode, the layout engine SHALL use a two-pass approach when `getExtraHeight` is provided. Pass 1 computes item widths using existing logic. Pass 2 calls `getExtraHeight` with the computed widths and adjusts row heights.

#### Scenario: Two-pass width accuracy
- **WHEN** `getExtraHeight` is provided in row mode
- **THEN** the `computedWidth` passed to `getExtraHeight` SHALL be the final scaled width of the item (after row width normalization)
