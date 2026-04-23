## Why

The library currently only supports row-based masonry layout (items flow horizontally within rows of uniform height). Real-world use cases—like the WiSaw web app—need column-based masonry (items flow vertically within columns of uniform width) with optional text beneath items. Column-based layout naturally handles variable-height items (image + text) and is the standard masonry pattern on the web. Adding both layout modes and an `extraHeight` mechanism makes the library suitable for feeds with mixed content (images with and without captions).

## What Changes

- Add a **column-based layout mode** (`layoutMode: 'column'`) alongside the existing row-based mode (default: `'row'`, fully backwards compatible)
- Column mode: items are placed into the shortest column, width is determined by `screenWidth / numColumns`, height is derived from aspect ratio
- Support **responsive column count** via breakpoints (e.g., `{ default: 3, 768: 2, 400: 1 }`)
- Column mode uses **virtualized horizontal bands** — slicing positioned items into bands rendered by VirtualizedList — to maintain performance with infinite scroll
- Add **`getExtraHeight(item, computedWidth)` callback** for both layout modes, allowing consumers to add dynamic extra height per item (for text, badges, buttons, etc.)
- In row mode, row height becomes `max(imageHeight + extraHeight)` across all items in the row
- In column mode, each item's total height is `scaledImageHeight + extraHeight`, stacked independently per column
- Pass `extraHeight` in `MasonryRenderItemInfo` so `renderItem` knows the image/extra split

## Non-goals

- Horizontal scrolling masonry (both modes scroll vertically)
- Built-in text rendering or text measurement — the library provides the height slot, consumers render content
- Async/onLayout-based text measurement — layout stays synchronous
- Adding new npm dependencies

## Capabilities

### New Capabilities
- `column-layout`: Column-based masonry layout mode with responsive column count, shortest-column placement, and virtualized band rendering
- `extra-height`: `getExtraHeight(item, computedWidth)` callback for adding dynamic per-item extra height below the image area in both row and column modes

### Modified Capabilities

## Impact

- **Types**: `ExpoMasonryLayoutProps` gets new props (`layoutMode`, `columns`, `getExtraHeight`); `MasonryRenderItemInfo` gets `extraHeight` and `columnIndex` fields; new `MasonryBandData` type for column mode virtualization
- **Utils**: New `calculateColumnMasonryLayout()` function; existing `calculateRowMasonryLayout()` modified to accept and integrate `getExtraHeight`
- **Component**: `ExpoMasonryLayout.tsx` gains layout mode branching, responsive column count via `useWindowDimensions`, and band-based rendering path
- **API surface**: Additive only — no breaking changes to existing props or behavior
- **Files affected**: `src/types.ts`, `src/utils.ts`, `src/ExpoMasonryLayout.tsx`, `src/index.ts`
