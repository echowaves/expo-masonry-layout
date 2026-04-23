## MODIFIED Requirements

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
