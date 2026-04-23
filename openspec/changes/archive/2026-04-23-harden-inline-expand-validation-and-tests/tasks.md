## 1. Runtime Guard Hardening

- [x] 1.1 Confirm `src/ExpoMasonryLayout.tsx` warns when `layoutMode` is `column`, `expandedItemIds` is non-empty, and `getExpandedHeight` is missing
- [x] 1.2 Validate warning message is explicit and actionable for library consumers

## 2. Regression Test Coverage

- [x] 2.1 Add and verify inline-expand behavior tests in `__tests__/utils.test.js` for unmatched IDs, waterline flush, and expanded-height precedence
- [x] 2.2 Add and verify test coverage for dedicated expanded-item bands and unchanged row-layout path

## 3. Validation

- [x] 3.1 Run `npm test -- --runInBand` and confirm all new tests pass
- [x] 3.2 Run `npm run lint` and confirm no new lint issues are introduced by this follow-up change
