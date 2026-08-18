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

/**
 * Devices that should be served test ads even against the real unit id.
 *
 * This is what makes it safe to run a production configuration build on your
 * own phone. Tapping a genuine ad in your own app is invalid traffic, and
 * Google's enforcement on that is automated, so the real unit id should never
 * serve a real ad to a device you hold.
 *
 * Set EXPO_PUBLIC_ADMOB_TEST_DEVICE_ID to the identifier the SDK prints on
 * first launch. Accepts a comma separated list, and `EMULATOR` for simulators.
 */
export const TEST_DEVICE_IDS = (process.env.EXPO_PUBLIC_ADMOB_TEST_DEVICE_ID ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter((id) => id.length > 0);
