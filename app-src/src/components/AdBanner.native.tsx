// Ad banner: native. Hidden entirely for Pro bakers. The unit id comes from
// adUnits, which prefers a real id from env and falls back to Google's test id.
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { BANNER_UNIT_ID } from '@/lib/adUnits';
import { usePro } from '@/state/pro';
import { spacing } from '@/theme';

export function AdBanner() {
  const { isPro } = usePro();
  if (isPro) {
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
