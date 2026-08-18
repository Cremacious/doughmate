// Ads: web / default stub. No ads on web, so there is nothing to consent to and
// nothing ever becomes ready. Native devices use ads.native.ts instead.
export const ADS_AVAILABLE = false;

export async function initAds(): Promise<void> {}

export function getAdsReady(): boolean {
  return false;
}

export function subscribeAdsReady(): () => void {
  return () => {};
}
