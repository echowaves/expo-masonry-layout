## 1. Types and API Surface

- [x] 1.1 Add `notifyHeightChanged(id: string, newHeight: number)` to `ExpoMasonryLayoutHandle` in `src/types.ts`
- [x] 1.2 Make `getExpandedHeight` optional in `ExpoMasonryLayoutProps` in `src/types.ts` (remove requirement that it must be provided when `expandedItemIds` is non-empty)

## 2. Row Mode Inline Expand

- [x] 2.1 Add expanded item handling to `calculateRowMasonryLayout` in `src/utils.ts`: accept `expandedItemIds`, `getExpandedHeight`, and `measuredHeights` parameters; flush current row when an expanded item is encountered; place expanded item as solo full-width row; resume row packing after
- [x] 2.2 Pass `expandedItemIds` and `getExpandedHeight` from `ExpoMasonryLayout.tsx` to `calculateRowMasonryLayout` when in row mode
- [x] 2.3 Remove the `console.warn` for missing `getExpandedHeight` and the row-mode guard that ignores `expandedItemIds` in `src/ExpoMasonryLayout.tsx`
- [x] 2.4 Add `isExpanded` field to row layout items in `src/utils.ts` (set `true` for expanded items, `false` otherwise)

## 3. Measured Heights State and Batching

- [x] 3.1 Add `measuredHeightsRef` (`useRef<Map<string, number>>`) and `measurementGeneration` state counter to `ExpoMasonryLayout.tsx`
- [x] 3.2 Implement `batchHeightUpdate` function: queue measurement in a pending map, schedule a `requestAnimationFrame` flush that copies pending values into `measuredHeightsRef` and increments `measurementGeneration`
- [x] 3.3 Clear measured height entries from `measuredHeightsRef` when items are removed from `expandedItemIds` (in the toggle detection effect)

## 4. Layout Integration with Measured Heights

- [x] 4.1 Pass `measuredHeightsRef.current` into `calculateColumnMasonryLayout` in `src/utils.ts`: prefer `measuredHeights.get(itemId)` over `getExpandedHeight` estimate for expanded item height
- [x] 4.2 Pass `measuredHeightsRef.current` into `calculateRowMasonryLayout` in `src/utils.ts`: same measured-height-override logic for expanded items in row mode
- [x] 4.3 Add `measurementGeneration` to `useMemo` dependency arrays for `rowLayoutData` and `columnLayoutData` so layout recalculates when measurements arrive
- [x] 4.4 Use default height estimate (`screenWidth`) when `getExpandedHeight` is not provided and no measured height exists, in both `calculateColumnMasonryLayout` and `calculateRowMasonryLayout`

## 5. Expanded Item Rendering Without Height Constraint

- [x] 5.1 Modify `renderBand` in `ExpoMasonryLayout.tsx`: for expanded items, omit fixed `height` from wrapper View style and attach `onLayout` handler that calls `batchHeightUpdate`
- [x] 5.2 Modify `renderRow` in `ExpoMasonryLayout.tsx`: for expanded items in row mode, omit fixed `height` from wrapper View style and attach `onLayout` handler that calls `batchHeightUpdate`
- [x] 5.3 Update band/row container height: use measured height from `measuredHeightsRef` when available for expanded-item bands/rows, falling back to layout-computed height

## 6. Imperative Handle

- [x] 6.1 Implement `notifyHeightChanged` on the imperative handle in `ExpoMasonryLayout.tsx`: update `measuredHeightsRef` and increment `measurementGeneration`

## 7. getItemLayout Consistency

- [x] 7.1 Update `getColumnItemLayout` to compute band offsets and heights using `measuredHeightsRef` for expanded-item bands
- [x] 7.2 Update `getItemLayout` (row mode) to compute row offsets and heights using `measuredHeightsRef` for expanded-item rows

## 8. Tests

- [x] 8.1 Add unit tests for `calculateRowMasonryLayout` with expanded items: solo full-width row placement, waterline flushing, resumed packing after expansion (`__tests__/utils.test.js`)
- [x] 8.2 Add unit tests for measured height override logic in both `calculateColumnMasonryLayout` and `calculateRowMasonryLayout`: measured height preferred over estimate, fallback to estimate when no measurement (`__tests__/utils.test.js`)
- [x] 8.3 Add unit tests for default expanded height estimate when `getExpandedHeight` is not provided (`__tests__/utils.test.js`)
- [x] 8.4 Add unit tests for measured height clearing on collapse (`__tests__/utils.test.js`)

## 9. Build and Lint

- [x] 9.1 Run `npx tsc --noEmit` to verify TypeScript compilation with no errors
- [x] 9.2 Run `npx ts-standard` to verify linting passes
- [x] 9.3 Run `npx jest` to verify all tests pass
