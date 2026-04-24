## 1. Types and Props

- [x] 1.1 Add `AutoScrollOnExpandConfig` type and `autoScrollOnExpand` prop to `ExpoMasonryLayoutProps` in `src/types.ts`
- [x] 1.2 Add `onExpandedItemLayout` callback prop to `ExpoMasonryLayoutProps` in `src/types.ts`
- [x] 1.3 Add `ExpoMasonryLayoutHandle` interface with `scrollToItem` and `scrollToOffset` methods in `src/types.ts`

## 2. forwardRef and Imperative Handle

- [x] 2.1 Wrap `ExpoMasonryLayout` with `React.forwardRef` in `src/ExpoMasonryLayout.tsx`
- [x] 2.2 Add internal `listRef` for VirtualizedList in `src/ExpoMasonryLayout.tsx`
- [x] 2.3 Implement `useImperativeHandle` exposing `scrollToItem` and `scrollToOffset` in `src/ExpoMasonryLayout.tsx`
- [x] 2.4 Pass `listRef` as `ref` prop to both VirtualizedList render paths (column and row mode) in `src/ExpoMasonryLayout.tsx`

## 3. Toggle Detection and Auto-scroll

- [x] 3.1 Add `useRef` to track previous `expandedItemIds` in `src/ExpoMasonryLayout.tsx`
- [x] 3.2 Implement `useEffect` that diffs previous vs current `expandedItemIds`, determines scroll target, fires `onExpandedItemLayout` callback, and calls `scrollToOffset` when `autoScrollOnExpand` is enabled in `src/ExpoMasonryLayout.tsx`

## 4. Exports

- [x] 4.1 Export `ExpoMasonryLayoutHandle` type from `src/index.ts`

## 5. Tests

- [x] 5.1 Add unit tests for toggle detection logic (added/removed ID diffing, scroll target selection with priority rules) in `__tests__/utils.test.js`

## 6. Example and Documentation

- [x] 6.1 Update `example/ExampleInlineExpand.tsx` to use `autoScrollOnExpand={true}`
- [x] 6.2 Update `README.md` with `autoScrollOnExpand`, `onExpandedItemLayout`, and ref API documentation

## 7. Build and Verify

- [x] 7.1 Run `npx tsc` to verify no type errors
- [x] 7.2 Run `npx ts-standard` to verify linting passes
- [x] 7.3 Run `npx jest` to verify all tests pass
