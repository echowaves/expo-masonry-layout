## ADDED Requirements

### Requirement: Column layout mode prop
The component SHALL accept a `layoutMode` prop with values `'row'` or `'column'`. The default value SHALL be `'row'`, preserving existing behavior. When `layoutMode` is `'column'`, the component SHALL use column-based masonry layout.

#### Scenario: Default layout mode
- **WHEN** `layoutMode` prop is not provided
- **THEN** the component SHALL render using row-based layout (existing behavior unchanged)

#### Scenario: Explicit column mode
- **WHEN** `layoutMode` is set to `'column'`
- **THEN** the component SHALL render using column-based masonry layout

### Requirement: Column count configuration
The component SHALL accept a `columns` prop that specifies the number of columns. It SHALL accept either a `number` or an object with breakpoints in the format `{ default: number, [breakpoint: number]: number }`.

#### Scenario: Fixed column count
- **WHEN** `columns` is set to `3`
- **THEN** the layout SHALL always use 3 columns regardless of screen width

#### Scenario: Responsive column count
- **WHEN** `columns` is set to `{ default: 3, 768: 2, 400: 1 }`
- **AND** screen width is 500px
- **THEN** the layout SHALL use 2 columns (matching the 768 breakpoint since 500 ≤ 768)

#### Scenario: Responsive fallback to default
- **WHEN** `columns` is set to `{ default: 4, 768: 2 }`
- **AND** screen width is 1024px
- **THEN** the layout SHALL use 4 columns (the default, since 1024 > 768)

#### Scenario: Columns prop not provided
- **WHEN** `layoutMode` is `'column'` and `columns` prop is not provided
- **THEN** the layout SHALL default to 2 columns

### Requirement: Shortest-column item placement
In column mode, each item SHALL be placed into the column with the smallest cumulative height. Item width SHALL equal the column width. Item height SHALL be `columnWidth / aspectRatio` plus any extra height.

#### Scenario: Balanced placement
- **WHEN** 4 items with identical aspect ratios are placed into 2 columns
- **THEN** columns SHALL each contain 2 items and have equal height

#### Scenario: Shortest column selection
- **WHEN** column 1 has cumulative height 300px and column 2 has 200px
- **THEN** the next item SHALL be placed into column 2

### Requirement: Image scaling in column mode
In column mode, items SHALL scale to fill the column width. Item height SHALL be derived from the aspect ratio (`columnWidth / aspectRatio`). The `width` and `height` properties on `MasonryItem` SHALL be used only to compute aspect ratio, not as literal pixel dimensions.

#### Scenario: Portrait image in column
- **WHEN** an item has `width: 200, height: 400` (AR = 0.5) and column width is 150px
- **THEN** the item SHALL render at 150px wide and 300px tall

#### Scenario: Landscape image in column
- **WHEN** an item has `width: 400, height: 200` (AR = 2.0) and column width is 150px
- **THEN** the item SHALL render at 150px wide and 75px tall

### Requirement: Virtualized band rendering
In column mode, the component SHALL slice the fully computed layout into horizontal bands and virtualize them using `VirtualizedList`. Each band SHALL contain all items whose top edge falls within that band's vertical range.

#### Scenario: Items virtualized in bands
- **WHEN** 100 items are laid out in column mode
- **THEN** only bands near the visible viewport SHALL be mounted as React elements

#### Scenario: Band contains correct items
- **WHEN** band height is 300px and an item starts at y=250
- **THEN** the item SHALL be assigned to band index 0 (y range 0-300)

#### Scenario: Scroll performance
- **WHEN** scrolling through 1000+ items in column mode
- **THEN** `getItemLayout` SHALL provide O(1) offset/height lookup for each band

### Requirement: Column index in render info
In column mode, `MasonryRenderItemInfo` SHALL include a `columnIndex` field indicating which column (0-based) the item is placed in.

#### Scenario: Column index provided
- **WHEN** an item is placed in the second column (index 1) in column mode
- **THEN** `renderItem` SHALL receive `columnIndex: 1` in the info object

#### Scenario: Column index absent in row mode
- **WHEN** `layoutMode` is `'row'`
- **THEN** `columnIndex` SHALL be `undefined`

### Requirement: Spacing in column mode
The `spacing` prop SHALL apply between columns horizontally and between items vertically within each column, consistent with row mode behavior.

#### Scenario: Horizontal spacing between columns
- **WHEN** `spacing` is 8 and there are 3 columns
- **THEN** there SHALL be 8px gaps between adjacent columns and 8px margins on left and right edges

#### Scenario: Vertical spacing between items
- **WHEN** `spacing` is 8 and a column has 3 items
- **THEN** there SHALL be 8px gaps between vertically adjacent items
