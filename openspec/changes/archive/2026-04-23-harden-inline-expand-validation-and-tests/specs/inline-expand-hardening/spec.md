## ADDED Requirements

### Requirement: Inline expand regression coverage
The project SHALL include automated regression tests for inline-expand layout behavior in the column masonry engine to prevent behavioral regressions.

#### Scenario: Unmatched expanded ids are ignored
- **WHEN** inline-expand layout is calculated with `expandedItemIds` that do not exist in data
- **THEN** layout output SHALL match the collapsed-layout output for the same inputs

#### Scenario: Expanded items have dedicated bands
- **WHEN** inline-expand layout contains expanded items
- **THEN** each expanded item SHALL be represented as its own single-item band with band height equal to expanded item height

#### Scenario: Expanded items bypass getExtraHeight
- **WHEN** an item is expanded in inline-expand layout
- **THEN** expanded item `extraHeight` SHALL be `0` and total expanded height SHALL come from `getExpandedHeight`
