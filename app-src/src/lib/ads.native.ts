// Ads: native (Google Mobile Ads).
//
// Banners only, deliberately. An interstitial on a baking app lands mid recipe,
// on a phone being handled with floury hands, which is the kind of interruption
// that costs reviews for more ad revenue than a banner in the reserved slot is
// worth at this scale. The banner lives in AdSlot and is hidden for Pro.
//
// Consent comes first. Google's EU user consent policy requires a certified CMP
// before serving ads to EEA and UK bakers, and that holds whether or not the ads
// are personalized. UMP ships inside this SDK, so gatherConsent() asks for what
// is needed and shows a form only where one is required. Everywhere else it
// resolves immediately and nobody sees a dialog.
//
// Doughmate serves non personalized ads only, so there is no ATT prompt and no
// tracking permission to ask for. See AdBanner for the request flag.
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';

import { USING_TEST_AD_UNITS } from './adUnits';

export const ADS_AVAILABLE = true;

// Ads stay off until consent is settled and the SDK is up. AdBanner subscribes,
// so the banner appears when that happens rather than rendering a dead slot.
let adsReady = false;
const listeners = new Set<() => void>();

function setAdsReady(next: boolean): void {
  if (adsReady === next) {
    return;
  }
  adsReady = next;
  listeners.forEach((listener) => listener());
}

export function getAdsReady(): boolean {
  return adsReady;
}

export function subscribeAdsReady(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function initAds(): Promise<void> {
  if (!__DEV__ && USING_TEST_AD_UNITS) {
    // Shipping test units serves real looking ads that earn nothing, and it is
    // invisible unless you go looking at revenue weeks later.
    console.warn(
      '[ads] Built with Google test ad unit ids. Set EXPO_PUBLIC_ADMOB_BANNER_IOS and _ANDROID.'
    );
  }

  let canRequestAds = false;
  try {
    const info = await AdsConsent.gatherConsent();
    canRequestAds = info.canRequestAds;
  } catch {
    // A consent failure must never take the app down, and it must never be
    // treated as permission. No consent, no ads: the rest of Doughmate is
    // untouched either way.
    canRequestAds = false;
  }

  if (!canRequestAds) {
    return;
  }

  try {
    await mobileAds().initialize();
    setAdsReady(true);
  } catch {
    setAdsReady(false);
  }
}
