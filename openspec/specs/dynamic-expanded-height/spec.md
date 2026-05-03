## ADDED Requirements

### Requirement: Auto-measurement of expanded items
The masonry component SHALL render expanded items without a fixed height constraint on their wrapper View. An `onLayout` handler SHALL capture the rendered height of the expanded item's content after every layout pass. When the measured height differs from the current layout height, the component SHALL trigger a re-layout with the measured value.

#### Scenario: Initial expand measurement
- **WHEN** an item transitions to expanded state and renders its content
- **THEN** `onLayout` fires on the expanded item's wrapper, the measured height is recorded, and if it differs from the `getExpandedHeight` estimate, the layout recalculates with the measured height

#### Scenario: Expanded item internal state changes height
- **WHEN** an expanded item's internal state changes (e.g., comments loaded, reply form opened, accordion toggled) causing its rendered height to change
- **THEN** `onLayout` fires with the new height, and the layout recalculates — adjusting the band/row height and all downstream positions

#### Scenario: Measurement matches estimate
- **WHEN** the expanded item's measured height equals the `getExpandedHeight` estimate (within 1px tolerance)
- **THEN** no re-layout is triggered

#### Scenario: Collapsed items are not measured
- **WHEN** an item is not in `expandedItemIds`
- **THEN** no `onLayout` measurement handler is attached to that item's wrapper; its height is determined by the existing predictive calculation

### Requirement: Measured height overrides estimate
The layout calculation SHALL prefer measured heights over `getExpandedHeight` estimates. An internal `measuredHeights` map keyed by item ID SHALL store the most recent measured height for each expanded item. When computing an expanded item's position, the layout SHALL use `measuredHeights.get(itemId)` if available, otherwise fall back to `getExpandedHeight(item, fullWidth)`.

#### Scenario: Measured height available
- **WHEN** layout calculates positions for an expanded item and `measuredHeights` contains an entry for that item's ID
- **THEN** the measured height is used for positioning and band/row height

#### Scenario: No measured height yet
- **WHEN** layout calculates positions for an expanded item and `measuredHeights` does not contain an entry for that item's ID
- **THEN** the `getExpandedHeight` estimate is used (or a default estimate if `getExpandedHeight` is not provided)

#### Scenario: Measured height cleared on collapse
- **WHEN** an item is removed from `expandedItemIds`
- **THEN** its entry in `measuredHeights` SHALL be deleted so that re-expansion starts from the `getExpandedHeight` estimate

### Requirement: Batched measurement updates
Measurement-driven re-layouts SHALL be batched within a single animation frame. When multiple `onLayout` callbacks fire in the same frame, their measurements SHALL be collected and flushed together in a single state update, triggering one re-layout pass.

#### Scenario: Multiple measurements in one frame
- **WHEN** two expanded items both fire `onLayout` in the same frame with new heights
- **THEN** both measurements are applied in a single flush, producing one re-render and one layout recalculation

#### Scenario: Single measurement
- **WHEN** one expanded item fires `onLayout` with a new height
- **THEN** the measurement is flushed on the next animation frame, producing one re-render

### Requirement: Band and row height consistency with measurements
The band height (column mode) or row height (row mode) containing an expanded item SHALL reflect the measured height when available. The `getItemLayout` function SHALL return offsets and lengths consistent with measured heights, ensuring VirtualizedList's scroll position calculations are accurate.

#### Scenario: Band height matches measured expanded item
- **WHEN** an expanded item is in its own band and has a measured height of 580
- **THEN** the band's height is 580, and `getItemLayout` returns `length: 580` for that band's index

#### Scenario: Downstream band offsets shift after measurement
- **WHEN** an expanded item's measured height changes from 400 to 580
- **THEN** all bands after the expanded item's band have their `offset` increased by 180 in `getItemLayout`

### Requirement: Imperative notifyHeightChanged
The `ExpoMasonryLayoutHandle` SHALL include a `notifyHeightChanged(id: string, newHeight: number)` method. When called, it SHALL update the `measuredHeights` map for the specified item and trigger a re-layout. This provides an escape hatch for consumers who want explicit control over height updates without relying on auto-measurement.

#### Scenario: Consumer calls notifyHeightChanged
- **WHEN** `ref.current.notifyHeightChanged('item-5', 612)` is called
- **THEN** the measured height for item-5 is set to 612 and the layout recalculates with this height

#### Scenario: notifyHeightChanged for non-expanded item
- **WHEN** `notifyHeightChanged` is called for an item that is not currently expanded
- **THEN** the measurement is stored but has no effect on layout until the item becomes expanded

### Requirement: Default expanded height estimate
When `getExpandedHeight` is not provided and no measured height is available, the component SHALL use a default height estimate for expanded items. The default estimate SHALL be `screenWidth` (approximating a square aspect ratio at full width).

#### Scenario: No getExpandedHeight provided, no measurement yet
- **WHEN** an item is expanded, `getExpandedHeight` is not provided, and no measured height exists
- **THEN** the layout uses `screenWidth` as the expanded item's height estimate

#### Scenario: No getExpandedHeight provided, measurement available
- **WHEN** an item is expanded, `getExpandedHeight` is not provided, and a measured height of 580 exists
- **THEN** the layout uses 580 as the expanded item's height
