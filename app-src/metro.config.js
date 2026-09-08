// Metro config. The only thing this adds to the Expo default is an escape hatch
// for running the app in Expo Go, and with the flag unset this file is the stock
// config: getDefaultConfig, returned untouched.
//
// DoughMate's real build needs three modules Expo Go does not ship — MMKV,
// RevenueCat and Google Mobile Ads — so Expo Go cannot run it. But every one of
// those already has a non native sibling written for the web build: storage.ts,
// purchases.ts, ads.ts and AdBanner.tsx. They are complete, they are the ones the
// web preview has been running on all along, and none of them import anything
// native. `adUnits.ts` is the only other file that touches the ads SDK, and it is
// reachable solely from those two `.native` files, so it drops out too.
//
// So Expo Go mode is not a set of new stubs. It is one rule: inside src/, stop
// honouring the `.native` platform extension and let the plain sibling resolve.
//
// Scoped to src/ deliberately. Plenty of packages in node_modules ship a
// `.native.js` that is the correct implementation for React Native and a plain
// sibling that is the web one, so applying this rule there would quietly swap
// working native code for browser code.
//
// Usage:  DOUGHMATE_EXPO_GO=1 npx expo start --go
//
// Caveat worth knowing before you trust what you see: storage.ts falls back to an
// in memory Map when there is no localStorage, and on a phone there is none. So in
// Expo Go nothing persists across a reload. Fine for driving the UI, wrong for
// judging anything about saved data.
const fs = require('fs');
const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (process.env.DOUGHMATE_EXPO_GO === '1') {
  const APP_SRC = path.join(__dirname, 'src') + path.sep;
  const NATIVE_SUFFIX = /\.native(\.[cm]?[jt]sx?)$/;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const resolved = context.resolveRequest(context, moduleName, platform);

    if (
      resolved.type === 'sourceFile' &&
      resolved.filePath.startsWith(APP_SRC) &&
      NATIVE_SUFFIX.test(resolved.filePath)
    ) {
      const sibling = resolved.filePath.replace(NATIVE_SUFFIX, '$1');
      if (fs.existsSync(sibling)) {
        return { ...resolved, filePath: sibling };
      }
    }

    return resolved;
  };
}

module.exports = config;
