// Doughmate Pro paywall. Lists what Pro unlocks, buys via RevenueCat, and
// restores. On web (or an unconfigured build) buying is unavailable and says so.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ModalHeader } from '@/components/ModalHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePro } from '@/state/pro';
import { spacing, typography } from '@/theme';

export default function PaywallScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();
  const { isPro, available, purchase, restore } = usePro();

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const features = t('paywall.features', { returnObjects: true }) as string[];

  const onBuy = async () => {
    setBusy(true);
    setMessage(null);
    const outcome = await purchase();
    setBusy(false);
    if (outcome.ok) {
      setMessage(t('toasts.pro_unlocked'));
    } else if (!outcome.cancelled) {
      setMessage(t('errors.iap_failed_body'));
    }
  };

  const onRestore = async () => {
    setBusy(true);
    setMessage(null);
    const restored = await restore();
    setBusy(false);
    setMessage(restored ? t('toasts.restore_success') : t('errors.restore_empty'));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ModalHeader title={t('paywall.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.body.lg, styles.center, { color: palette.chocSoft }]}>
          {t('paywall.tagline')}
        </Text>

        <Card style={styles.features}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={[typography.body.lg, { color: palette.crust }]}>✓</Text>
              <Text style={[typography.body.lg, styles.featureText, { color: palette.choc }]}>
                {feature}
              </Text>
            </View>
          ))}
        </Card>

        {message ? (
          <Text style={[typography.body.md, styles.center, { color: palette.leaf }]}>
            {message}
          </Text>
        ) : null}

        {isPro ? (
          <Text style={[typography.heading, styles.center, { color: palette.crust }]}>
            {t('toasts.pro_unlocked')}
          </Text>
        ) : (
          <View style={styles.actions}>
            <Button
              label={t('paywall.cta')}
              onPress={onBuy}
              disabled={busy || !available}
              haptic="success"
            />
            <Button
              label={t('paywall.restore')}
              variant="ghost"
              onPress={onRestore}
              disabled={busy || !available}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },
  center: { textAlign: 'center' },
  features: { gap: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureText: { flexShrink: 1 },
  actions: { gap: spacing.sm },
});
