// Extends app.json at build time so the AdMob app ids come from the environment
// instead of being hardcoded. app.json stays the source of truth for everything
// else; only the ads plugin entry is rewritten here.
//
// App ids are baked into the native manifest, so they cannot be read from env at
// runtime the way the banner unit ids are (see src/lib/adUnits.ts). They resolve
// here, at prebuild, from:
//
//   EXPO_PUBLIC_ADMOB_APP_ID_IOS
//   EXPO_PUBLIC_ADMOB_APP_ID_ANDROID
//
// With neither set, the build falls back to Google's public test app ids so a dev
// build with no AdMob account still runs. Note that an app id contains a TILDE
// and an ad unit id contains a SLASH: they are not interchangeable.
const TEST_APP_ID_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_APP_ID_IOS = 'ca-app-pub-3940256099942544~1458002511';

const ADS_PLUGIN = 'react-native-google-mobile-ads';

module.exports = ({ config }) => {
  const androidAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || TEST_APP_ID_ANDROID;
  const iosAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || TEST_APP_ID_IOS;

  return {
    ...config,
    plugins: (config.plugins ?? []).map((plugin) =>
      Array.isArray(plugin) && plugin[0] === ADS_PLUGIN
        ? [ADS_PLUGIN, { androidAppId, iosAppId }]
        : plugin
    ),
  };
};
