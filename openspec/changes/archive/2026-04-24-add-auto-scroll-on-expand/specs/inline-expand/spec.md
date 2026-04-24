## MODIFIED Requirements

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
