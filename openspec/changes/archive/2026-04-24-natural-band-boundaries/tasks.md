## 1. Type Changes

- [x] 1.1 Remove `contentTop` field from `MasonryBandData` interface in `src/types.ts`

## 2. Core Implementation

- [x] 2.1 Add `findNaturalBoundaries()` helper in `src/utils.ts` that takes normal items, numColumns, regionStart, regionEnd, and targetBandHeight — returns an array of y-coordinate boundaries where all columns have gaps
- [x] 2.2 Rewrite the normal-item banding logic in `sliceIntoBands()` to use `findNaturalBoundaries()` instead of fixed-interval slicing — assign items to bands based on which boundary interval they fall in, set band height to the distance between boundaries
- [x] 2.3 Remove `computeAdaptiveBandHeight()` function from `src/utils.ts`
- [x] 2.4 Remove the cumulative-top recalculation pass at the end of `sliceIntoBands()`

## 3. Rendering Update

- [x] 3.1 In `renderBand` in `src/ExpoMasonryLayout.tsx`, revert item positioning from `photo.top - band.contentTop` back to `photo.top - band.top`

## 4. Testing

- [x] 4.1 Replace existing adaptive-band-height and cumulative-coordinate tests in `__tests__/utils.test.js` with natural-boundary tests
- [x] 4.2 Add test: no item straddles a band boundary
- [x] 4.3 Add test: band.top equals sum of preceding band heights (no gaps)
- [x] 4.4 Add test: items across band boundary appear at correct positions (spacing preserved)
- [x] 4.5 Add test: fallback when tall item spans entire region
- [x] 4.6 Add test: natural boundaries work in pre-expansion and post-expansion regions
- [x] 4.7 Run `npm test` to verify all tests pass

## 5. Build and Verify

- [x] 5.1 Run `npm run clean && npm run build` to compile TypeScript to `lib/`
- [x] 5.2 Run `npm run lint` to check for style issues
