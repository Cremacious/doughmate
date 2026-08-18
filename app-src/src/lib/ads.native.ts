// Ads: native (Google Mobile Ads). Uses Google's public TEST ad unit ids, so it
// works in a dev build with no AdMob account. Swap TestIds for real unit ids
// (from env) before shipping.
//
// Banners only, deliberately. An interstitial on a baking app lands mid recipe,
// on a phone being handled with floury hands, which is the kind of interruption
// that costs reviews for more ad revenue than a banner in the reserved slot is
// worth at this scale. The banner lives in AdSlot and is hidden for Pro.
import mobileAds from 'react-native-google-mobile-ads';

export const ADS_AVAILABLE = true;

export function initAds(): void {
  void mobileAds().initialize();
}
