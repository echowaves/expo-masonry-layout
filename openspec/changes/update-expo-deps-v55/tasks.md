## 1. Research Expo SDK 55 dependency versions

- [ ] 1.1 Identify the exact React and React Native versions bundled with Expo SDK 55.0.5
- [ ] 1.2 Identify the recommended TypeScript version for Expo SDK 55
- [ ] 1.3 Identify the correct `@types/react` and `@types/react-native` versions (or if `@types/react-native` is still needed)

## 2. Update peerDependencies

- [ ] 2.1 Update `react` peer dependency range in `package.json` to cover SDK 55's React version
- [ ] 2.2 Update `react-native` peer dependency range in `package.json` to cover SDK 55's React Native version

## 3. Update devDependencies

- [ ] 3.1 Update `@types/react` in `package.json` to match SDK 55's React version
- [ ] 3.2 Update `@types/react-native` in `package.json` (or remove if types are now bundled with RN)
- [ ] 3.3 Update `typescript` in `package.json` to latest compatible 5.x stable
- [ ] 3.4 Update `@babel/core`, `@babel/preset-env`, `@babel/preset-typescript` to latest compatible versions
- [ ] 3.5 Update ESLint-related packages if needed for compatibility

## 4. Update configuration files

- [ ] 4.1 Adjust `tsconfig.json` if compiler options need changes for the new RN/TS versions
- [ ] 4.2 Update `engines.node` in `package.json` if minimum Node version changes

## 5. Validate

- [ ] 5.1 Run `npm install` and resolve any dependency conflicts
- [ ] 5.2 Run `npm run build` (`tsc`) and fix any type errors in `src/`
- [ ] 5.3 Run `npm run lint` and fix any lint errors
- [ ] 5.4 Run `npm test` and ensure all tests pass

## 6. Finalize

- [ ] 6.1 Bump library version in `package.json` (minor bump to 1.2.0)
- [ ] 6.2 Update CHANGELOG.md with the dependency update entry
