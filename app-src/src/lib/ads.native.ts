// Ads: native (Google Mobile Ads). Uses Google's public TEST ad unit ids, so it
// works in a dev build with no AdMob account. Swap TestIds for real unit ids
// (from env) before shipping. A single interstitial is kept preloaded.
import mobileAds, { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

export const ADS_AVAILABLE = true;

const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true,
});
let loaded = false;

interstitial.addAdEventListener(AdEventType.LOADED, () => {
  loaded = true;
});
interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  loaded = false;
  interstitial.load();
});
interstitial.addAdEventListener(AdEventType.ERROR, () => {
  loaded = false;
});

export function initAds(): void {
  void mobileAds().initialize();
  interstitial.load();
}

export function showInterstitialIfReady(): void {
  if (loaded) {
    interstitial.show();
  }
}
