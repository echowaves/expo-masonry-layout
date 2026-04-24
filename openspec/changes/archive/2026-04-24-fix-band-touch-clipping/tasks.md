## 1. Core Implementation

- [x] 1.1 Create a helper function in `src/utils.ts` to compute adaptive band height: given a list of items and a bandTop, return `max(DEFAULT_BAND_HEIGHT, max(item.top - bandTop + item.height))`; return DEFAULT_BAND_HEIGHT for empty item lists
- [x] 1.2 Update the pre-expansion band-creation loop in `sliceIntoBands()` (`src/utils.ts`) to use adaptive band height instead of fixed `bandHeight`
- [x] 1.3 Update the trailing (post-last-expansion) band-creation loop in `sliceIntoBands()` (`src/utils.ts`) to use adaptive band height instead of fixed `bandHeight`

## 2. Testing

- [x] 2.1 Add unit test in `__tests__/utils.test.js`: band height stays at 300 when all items fit within default height
- [x] 2.2 Add unit test in `__tests__/utils.test.js`: band height expands when an item extends past 300px boundary
- [x] 2.3 Add unit test in `__tests__/utils.test.js`: band height uses largest overflow when multiple items overflow
- [x] 2.4 Add unit test in `__tests__/utils.test.js`: empty band retains default height of 300
- [x] 2.5 Add unit test in `__tests__/utils.test.js`: adaptive height works in bands before and after expanded items
- [x] 2.6 Run `npm test` to verify all tests pass

## 3. Build and Verify

- [x] 3.1 Run `npm run clean && npm run build` to compile TypeScript to `lib/`
- [x] 3.2 Verify `lib/utils.js` contains the adaptive band height logic
- [x] 3.3 Run `npm run lint` to check for style issues; fix with `npm run lint:fix` if needed
