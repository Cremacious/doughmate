// Ad banner: native. A test banner, hidden entirely for Pro bakers.
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

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
        unitId={TestIds.BANNER}
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
