## 1. Code Changes

- [x] 1.1 Remove `overflow: 'hidden'` from itemContainer style in src/ExpoMasonryLayout.tsx (line 268)
- [x] 1.2 Verify TypeScript syntax is correct after changes

## 2. Build and Compile

- [x] 2.1 Run `npm run clean` to remove compiled output
- [x] 2.2 Run `npm run build` to compile TypeScript to lib/
- [x] 2.3 Verify lib/ExpoMasonryLayout.js contains the updated styles without overflow property

## 3. Testing and Verification

- [x] 3.1 Run `npm test` to ensure all tests pass
- [x] 3.2 Manually verify shadows render smoothly in examples (ExampleMasonryGrid, ExampleInlineExpand, ExampleWithFrozenDimensions)
- [x] 3.3 Verify no visual regressions in row mode shadow rendering
- [x] 3.4 Verify no visual regressions in column mode shadow rendering
- [x] 3.5 Check that items still stay within calculated bounds with no layout shifts

## 4. Linting and Quality

- [x] 4.1 Run `npm run lint` to check for style issues
- [x] 4.2 Fix any linting errors with `npm run lint:fix`
