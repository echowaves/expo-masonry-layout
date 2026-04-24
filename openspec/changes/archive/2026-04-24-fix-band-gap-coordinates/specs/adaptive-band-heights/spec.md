## ADDED Requirements

### Requirement: Band top positions are cumulative
After all bands are built with adaptive heights, `band.top` SHALL be recalculated as the cumulative sum of preceding band heights. Each band's `top` SHALL equal the sum of all preceding bands' heights. This ensures VirtualizedList stacks bands without gaps.

#### Scenario: Bands with no adaptive expansion
- **WHEN** all bands have default height (300px)
- **THEN** band tops SHALL be 0, 300, 600, 900, etc. (identical to grid-coordinate positions)

#### Scenario: First band expands
- **WHEN** band 0 has adaptive height 450px (expanded from 300)
- **THEN** band 0 top SHALL be 0 and band 1 top SHALL be 450

#### Scenario: Multiple bands expand
- **WHEN** band 0 has height 450 and band 1 has height 350
- **THEN** band 2 top SHALL be 800 (450 + 350)

### Requirement: Band contentTop preserves grid-coordinate origin
Each band SHALL have a `contentTop` field that preserves the original grid-coordinate position used for item assignment. Items within a band SHALL be positioned using `item.top - band.contentTop` to compute their local offset within the band View.

#### Scenario: Item positioning uses contentTop
- **WHEN** an item has grid-coordinate `top = 310` and its band has `contentTop = 300`
- **THEN** the item's local position within the band View SHALL be `310 - 300 = 10`

#### Scenario: contentTop differs from top after expansion
- **WHEN** band 0 expands from 300 to 450px
- **THEN** band 1 SHALL have `contentTop = 300` (grid origin) and `top = 450` (cumulative layout position)

### Requirement: No gaps between adjacent bands
Adjacent bands SHALL render without visible gaps. The cumulative top calculation SHALL ensure that each band's scroll-view position is exactly at the bottom edge of the preceding band.

#### Scenario: Visual continuity across band boundary
- **WHEN** band N has height 450 and starts at cumulative top 600
- **THEN** band N+1 SHALL start at cumulative top 1050 (600 + 450), with no gap
