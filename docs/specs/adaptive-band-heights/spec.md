## Purpose

Defines requirements for band boundary placement in the masonry layout's virtualization layer. Ensures that band containers use natural gap-aligned boundaries to fully contain all assigned items, eliminating touch dead zones and visible gaps between bands.

## Requirements

### Requirement: Band height contains all assigned items
Each band produced by `sliceIntoBands()` SHALL have boundaries placed at natural gap points where no item crosses the boundary. Band height SHALL equal the distance between adjacent boundaries. Since no item straddles a boundary, the band height inherently contains all assigned items without adaptive expansion.

#### Scenario: Items fully contained by natural boundaries
- **WHEN** items are grouped into bands using natural boundary detection
- **THEN** every item's full extent (`item.top` to `item.top + item.height`) SHALL fall within its assigned band's `[band.top, band.top + band.height)` range

#### Scenario: Band height matches boundary distance
- **WHEN** a band has boundaries at y=0 and y=456
- **THEN** the band height SHALL be 456

#### Scenario: No item straddles a band boundary
- **WHEN** the grid contains items of varying heights and positions
- **THEN** no item SHALL have `item.top < boundary && item.top + item.height > boundary` for any band boundary

### Requirement: Touch events reach full item area
All interactive elements within a masonry item SHALL be reachable by touch events, regardless of the item's position within its band. The band container View MUST be tall enough that no item content extends past the parent bounds.

#### Scenario: Button at bottom of tall item near band boundary
- **WHEN** a tall item (e.g., AR 0.56, height ~219px) starts near the bottom of a band
- **AND** the item has an interactive element at its bottom edge
- **THEN** the interactive element SHALL receive touch events

#### Scenario: Touch delivery across all items in grid
- **WHEN** rendering a grid of items with varying aspect ratios in column mode
- **THEN** all items SHALL have their full height within the parent band container bounds

### Requirement: Adaptive heights apply to all band regions
The natural boundary detection logic SHALL apply consistently to all band-creation paths in `sliceIntoBands()`: pre-expansion regions, post-expansion regions, and trailing regions after the last expansion.

#### Scenario: Bands before an expanded item
- **WHEN** normal items are grouped into bands before an expanded item
- **THEN** each band SHALL use natural boundaries based on item positions

#### Scenario: Bands after last expanded item
- **WHEN** normal items are grouped into bands after the last expanded item
- **THEN** each band SHALL use natural boundaries based on item positions

#### Scenario: No expanded items in grid
- **WHEN** the grid has no expanded items
- **THEN** all bands SHALL use natural boundaries based on item positions

### Requirement: No gaps between adjacent bands
Band boundaries SHALL be placed such that each band's `top` equals the sum of all preceding bands' heights. Since bands span from one natural boundary to the next with no space in between, VirtualizedList stacking SHALL produce no visible gaps.

#### Scenario: Consecutive bands touch without gaps
- **WHEN** band N has `top = T` and `height = H`
- **THEN** band N+1 SHALL have `top = T + H`

#### Scenario: Items across band boundary appear continuous
- **WHEN** an item in band N ends at the band boundary
- **AND** an item in band N+1 starts at the band boundary (offset by spacing)
- **THEN** the visual distance between them SHALL be exactly the grid spacing value

### Requirement: Band boundaries align with column gaps
Band boundaries SHALL only be placed at y-coordinates where ALL columns have a gap between items. A gap exists at position y in a column when no item in that column has `item.top < y && item.top + item.height > y`.

#### Scenario: Valid split point where all columns clear
- **WHEN** column 0 has a gap at y=456 and column 1 has a gap at y=456 and column 2 has a gap at y=456
- **THEN** y=456 SHALL be a valid candidate boundary

#### Scenario: Invalid split point where one column is occupied
- **WHEN** column 0 has an item spanning y=300 (top=200, height=250)
- **AND** column 1 has a gap at y=300
- **THEN** y=300 SHALL NOT be used as a boundary

#### Scenario: Fallback when no natural boundary exists
- **WHEN** no valid boundary can be found within a region (e.g., a very tall item spans the entire region)
- **THEN** the region end SHALL be used as the boundary
