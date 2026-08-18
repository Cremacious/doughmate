// Ad unit ids, resolved once. Reads real units from env and falls back to
// Google's public test ids, so a dev build with no AdMob account still renders a
// banner. Mirrors how purchases.native.ts resolves the RevenueCat keys.
//
// Shipping is a config change, not a code change: set
// EXPO_PUBLIC_ADMOB_BANNER_IOS / _ANDROID in .env.local or as EAS secrets.
// USING_TEST_AD_UNITS is exported so a release check can catch a build that
// would otherwise ship test units and silently earn nothing.
import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const configuredBanner =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS
    : process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID;

export const BANNER_UNIT_ID = configuredBanner || TestIds.BANNER;

export const USING_TEST_AD_UNITS = !configuredBanner;
