## 1. Type Definitions

- [x] 1.1 Add `layoutMode`, `columns`, and `getExtraHeight` props to `ExpoMasonryLayoutProps` in `src/types.ts`
- [x] 1.2 Add `extraHeight` and `columnIndex` fields to `MasonryRenderItemInfo` in `src/types.ts`
- [x] 1.3 Add `MasonryBandData` type for column mode virtualization in `src/types.ts`
- [x] 1.4 Add `ColumnsConfig` type (`number | { default: number, [breakpoint: number]: number }`) in `src/types.ts`

## 2. Extra Height in Row Mode

- [x] 2.1 Add `getExtraHeight` parameter to `calculateRowMasonryLayout()` in `src/utils.ts`
- [x] 2.2 Implement two-pass layout: after item widths are computed (existing pass 1), call `getExtraHeight(item, computedWidth)` and adjust row height to `max(imageHeight + extraHeight)` in `src/utils.ts`
- [x] 2.3 Store `extraHeight` on each positioned item in the row data for use by `renderItem` in `src/utils.ts`

## 3. Column Layout Engine

- [x] 3.1 Add `resolveColumnCount(columns, screenWidth)` helper function to compute active column count from `ColumnsConfig` and screen width in `src/utils.ts`
- [x] 3.2 Implement `calculateColumnMasonryLayout()` in `src/utils.ts`: compute column width, iterate items with shortest-column placement, apply aspect ratio scaling and `getExtraHeight`, produce positioned items array
- [x] 3.3 Implement `sliceIntoBands()` in `src/utils.ts`: group positioned items into horizontal bands of fixed height, each band containing items whose top edge falls within it

## 4. Component Integration

- [x] 4.1 Add `resolveColumnCount` call with `useWindowDimensions().width` in `ExpoMasonryLayout.tsx` to determine active column count when in column mode
- [x] 4.2 Branch `useMemo` layout calculation: call `calculateRowMasonryLayout()` for row mode, `calculateColumnMasonryLayout()` + `sliceIntoBands()` for column mode in `src/ExpoMasonryLayout.tsx`
- [x] 4.3 Implement `renderBand` callback for column mode: render all items in a band with absolute positioning, passing `extraHeight` and `columnIndex` to `renderItem` in `src/ExpoMasonryLayout.tsx`
- [x] 4.4 Wire `getExtraHeight` prop through to both row and column layout calculations in `src/ExpoMasonryLayout.tsx`
- [x] 4.5 Update `getItemLayout` to handle both row and band data in `src/ExpoMasonryLayout.tsx`

## 5. Exports

- [x] 5.1 Export new types (`ColumnsConfig`, `MasonryBandData`) from `src/index.ts`

## 6. Build and Lint

- [x] 6.1 Run `npm run build` and fix any TypeScript compilation errors
- [x] 6.2 Run `npm run lint` and fix any linting issues

## 7. Examples

- [x] 7.1 Create `example/ExampleColumnLayout.tsx` demonstrating column mode with responsive breakpoints
- [x] 7.2 Create `example/ExampleWithExtraHeight.tsx` demonstrating `getExtraHeight` with text captions in column mode


## 8. Update Documentation
 
- [x] 8.1 Update README.md
