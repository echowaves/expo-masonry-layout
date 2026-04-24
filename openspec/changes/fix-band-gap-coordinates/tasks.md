## 1. Type Changes

- [x] 1.1 Add `contentTop: number` field to `MasonryBandData` interface in `src/types.ts`

## 2. Core Implementation

- [x] 2.1 In `sliceIntoBands()` in `src/utils.ts`, set `contentTop` to the current `top` value when creating each band (both pre-expansion, expanded, and trailing bands)
- [x] 2.2 After the band-building loop in `sliceIntoBands()`, add a cumulative-top recalculation pass that walks all bands and sets `band.top = cumulativeOffset; cumulativeOffset += band.height`

## 3. Rendering Update

- [x] 3.1 In `renderBand` in `src/ExpoMasonryLayout.tsx`, change item positioning from `photo.top - band.top` to `photo.top - band.contentTop`

## 4. Testing

- [x] 4.1 Add unit test in `__tests__/utils.test.js`: band tops are cumulative after adaptive expansion (band 0 height=450 → band 1 top=450)
- [x] 4.2 Add unit test in `__tests__/utils.test.js`: contentTop preserves original grid-coordinate position
- [x] 4.3 Add unit test in `__tests__/utils.test.js`: no gaps — each band.top equals sum of preceding band heights
- [x] 4.4 Add unit test in `__tests__/utils.test.js`: bands with no expansion have top === contentTop
- [x] 4.5 Run `npm test` to verify all tests pass

## 5. Build and Verify

- [x] 5.1 Run `npm run clean && npm run build` to compile TypeScript to `lib/`
- [x] 5.2 Run `npm run lint` to check for style issues; fix with `npm run lint:fix` if needed
