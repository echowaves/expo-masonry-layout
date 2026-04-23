## 1. Type Definitions

- [x] 1.1 Add `expandedItemIds` prop (`string[]`) and `getExpandedHeight` prop (`(item: MasonryItem, fullWidth: number) => number`) to `ExpoMasonryLayoutProps` in `src/types.ts`
- [x] 1.2 Add `isExpanded: boolean` field to `MasonryRenderItemInfo` in `src/types.ts`

## 2. Column Layout Engine — Waterline Flushing

- [x] 2.1 Add `expandedItemIds` and `getExpandedHeight` parameters to `calculateColumnMasonryLayout()` in `src/utils.ts`
- [x] 2.2 Convert `expandedItemIds` to a `Set<string>` at the start of the layout pass for O(1) lookup in `src/utils.ts`
- [x] 2.3 Implement waterline flushing: when an expanded item is encountered, flush all columns to max height, place item full-width (`screenWidth - 2 * spacing`) at waterline, reset all column heights to `waterline + expandedHeight + spacing` in `src/utils.ts`
- [x] 2.4 Mark expanded positioned items with `isExpanded: true` flag and set `columnIndex: -1` for expanded items in `src/utils.ts`

## 3. Band Virtualization — Expansion-Aware Splitting

- [x] 3.1 Update `sliceIntoBands()` to accept an expanded item indicator (e.g., via `isExpanded` flag on positioned items) in `src/utils.ts`
- [x] 3.2 Implement expansion-boundary splitting: expanded items become their own dedicated single-item bands; normal items between expansions are grouped into standard fixed-height bands in `src/utils.ts`

## 4. Component Integration

- [x] 4.1 Destructure `expandedItemIds` and `getExpandedHeight` from props in `src/ExpoMasonryLayout.tsx`
- [x] 4.2 Pass `expandedItemIds` and `getExpandedHeight` through to `calculateColumnMasonryLayout()` in the column mode `useMemo` block, adding both to the dependency array in `src/ExpoMasonryLayout.tsx`
- [x] 4.3 Set `isExpanded` field in `MasonryRenderItemInfo` in both `renderBand` callback (from positioned item flag) and `renderRow` callback (always `false`) in `src/ExpoMasonryLayout.tsx`

## 5. Exports

- [x] 5.1 Verify no new public types need exporting from `src/index.ts` (only `isExpanded` added to existing `MasonryRenderItemInfo`, props added to existing `ExpoMasonryLayoutProps`)

## 6. Build and Lint

- [x] 6.1 Run `npm run build` and fix any TypeScript compilation errors
- [x] 6.2 Run `npm run lint` and fix any linting issues

## 7. Examples

- [x] 7.1 Create `example/ExampleInlineExpand.tsx` demonstrating inline expand/collapse with multiple items in column mode

## 8. Documentation

- [x] 8.1 Update README.md with inline expand usage section, new props in API reference table, and updated `MasonryRenderItemInfo` type documentation
