## Why

When items are expanded or collapsed in column mode, the layout recalculates correctly but the scroll position remains unchanged. The expanded item ends up partially or fully off-screen, requiring the user to manually scroll to find it. There is no mechanism for the consumer to programmatically scroll the underlying VirtualizedList to the toggled item's position.

## What Changes

- Add `autoScrollOnExpand` prop to automatically scroll the list when an item is expanded or collapsed
- Add `onExpandedItemLayout` callback that fires with layout info for items whose expand/collapse state just changed, enabling custom scroll behavior
- Wrap the component with `React.forwardRef` to expose the underlying VirtualizedList ref
- Add `useImperativeHandle` to provide a `scrollToItem(id)` convenience method on the ref
- Track previous `expandedItemIds` internally to detect which items were just toggled

## Non-goals

- Changing the layout calculation logic — layouts are correct, only scroll position is wrong
- Animated expand/collapse transitions (height animation) — out of scope
- Scroll behavior for row mode — inline expand is column-mode only

## Capabilities

### New Capabilities
- `auto-scroll-on-expand`: Automatic and programmatic scrolling to expanded/collapsed items, including the `autoScrollOnExpand` prop, `onExpandedItemLayout` callback, `forwardRef` support, and `scrollToItem` imperative method

### Modified Capabilities
- `inline-expand`: Add requirements for scroll behavior on expand/collapse state changes

## Impact

- **Files**: `src/ExpoMasonryLayout.tsx`, `src/types.ts`, `src/index.ts`
- **API**: New props (`autoScrollOnExpand`, `onExpandedItemLayout`), new ref handle (`scrollToItem`, `scrollToOffset`). `forwardRef` wrapping is a minor type-level change for consumers who type the component.
- **Dependencies**: None — uses built-in React and React Native APIs only
