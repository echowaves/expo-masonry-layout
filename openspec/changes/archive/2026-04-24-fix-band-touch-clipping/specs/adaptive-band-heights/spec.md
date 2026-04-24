## ADDED Requirements

### Requirement: Band height contains all assigned items
Each band produced by `sliceIntoBands()` SHALL have a height that is at least as large as the maximum bottom extent of any item assigned to it. The band height SHALL be `max(DEFAULT_BAND_HEIGHT, max(item.top - bandTop + item.height))` for all items in the band.

#### Scenario: Item fully within default band height
- **WHEN** all items in a band have `(item.top - bandTop + item.height) <= 300`
- **THEN** the band height SHALL remain at 300px (DEFAULT_BAND_HEIGHT)

#### Scenario: Item extends past default band height
- **WHEN** an item has `top = 250` within the band and `height = 219`
- **THEN** the band height SHALL be `max(300, 250 + 219) = 469`

#### Scenario: Multiple overflowing items in same band
- **WHEN** multiple items extend past the default band height
- **THEN** the band height SHALL be the maximum of DEFAULT_BAND_HEIGHT and the largest `(item.top - bandTop + item.height)` across all items

#### Scenario: Empty band
- **WHEN** a band contains no items
- **THEN** the band height SHALL remain at DEFAULT_BAND_HEIGHT (300px)

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
The adaptive band height logic SHALL apply consistently to all band-creation paths in `sliceIntoBands()`: pre-expansion regions, post-expansion regions, and trailing regions after the last expansion.

#### Scenario: Bands before an expanded item
- **WHEN** normal items are grouped into bands before an expanded item
- **THEN** each band SHALL use adaptive height based on its items

#### Scenario: Bands after last expanded item
- **WHEN** normal items are grouped into bands after the last expanded item
- **THEN** each band SHALL use adaptive height based on its items

#### Scenario: No expanded items in grid
- **WHEN** the grid has no expanded items
- **THEN** all bands SHALL use adaptive height based on their items
