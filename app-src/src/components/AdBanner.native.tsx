// Ad banner: native. Hidden entirely for Pro bakers, and held back until consent
// is settled and the SDK is initialized, so it never renders a dead frame.
//
// requestNonPersonalizedAdsOnly stays true: Doughmate does not serve personalized
// ads, which is what keeps the ATT prompt off iOS.
import { useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { getAdsReady, subscribeAdsReady } from '@/lib/ads';
import { BANNER_UNIT_ID } from '@/lib/adUnits';
import { usePro } from '@/state/pro';
import { spacing } from '@/theme';

export function AdBanner() {
  const { isPro } = usePro();
  const ready = useSyncExternalStore(subscribeAdsReady, getAdsReady, getAdsReady);

  if (isPro || !ready) {
    return null;
  }
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});

export default AdBanner;
