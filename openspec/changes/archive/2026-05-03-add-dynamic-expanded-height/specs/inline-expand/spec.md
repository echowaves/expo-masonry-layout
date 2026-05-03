## MODIFIED Requirements

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

### Requirement: Column mode only
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

### Requirement: Missing getExpandedHeight warns in column mode
This requirement is removed.

**Reason**: `getExpandedHeight` is now optional in both modes. Auto-measurement provides the actual height. A default estimate is used when `getExpandedHeight` is not provided.
**Migration**: Remove any code that warns when `getExpandedHeight` is missing.

## REMOVED Requirements

### Requirement: Missing getExpandedHeight warns in column mode
**Reason**: `getExpandedHeight` is now optional. Auto-measurement corrects the height after rendering, and a default estimate is used for the first frame.
**Migration**: Remove the `console.warn` that fires when `expandedItemIds` is non-empty and `getExpandedHeight` is not provided.
