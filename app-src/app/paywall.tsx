// Doughmate Pro, a tall sheet. Sam celebrating, the six perks as bordered cards
// with a plum check, then buy and restore. Buying needs a native build with a
// configured key; on web it is unavailable and the button stays disabled.
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePro } from '@/state/pro';
import { spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { useToast } from '@/ui/Toast';

export default function PaywallSheet() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { isPro, available, purchase, restore } = usePro();
  const { show } = useToast();
  const [busy, setBusy] = useState(false);

  const features = t('paywall.features', { returnObjects: true }) as string[];

  const onBuy = async () => {
    setBusy(true);
    const outcome = await purchase();
    setBusy(false);
    if (outcome.ok) {
      show({ message: t('toasts.pro_unlocked'), variant: 'confirmation' });
      router.back();
    } else if (!outcome.cancelled) {
      show({ message: t('errors.iap_failed_body') });
    }
  };

  const onRestore = async () => {
    setBusy(true);
    const restored = await restore();
    setBusy(false);
    show({
      message: restored ? t('toasts.restore_success') : t('errors.restore_empty'),
      variant: restored ? 'confirmation' : 'neutral',
    });
    if (restored) {
      router.back();
    }
  };

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      footer={
        isPro ? (
          <Button label={t('paywall.close')} onPress={() => router.back()} variant="secondary" />
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
              onPress={onRestore}
              variant="quiet"
              disabled={busy || !available}
            />
          </View>
        )
      }
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Sam size={132} emotion="excited" />
          <Text style={[typography.display.lg, styles.center, { color: palette.textInk }]}>
            {t('paywall.title')}
          </Text>
          <Text style={[typography.body.lg, styles.center, { color: palette.textSoft }]}>
            {t('paywall.tagline')}
          </Text>
        </View>

        {features.map((feature) => (
          <View
            key={feature}
            style={[
              styles.perk,
              { backgroundColor: palette.bgSurface, borderColor: palette.border },
            ]}
          >
            <Text style={[typography.heading, { color: palette.pro }]}>✓</Text>
            <Text style={[typography.body.lg, styles.perkText, { color: palette.textInk }]}>
              {feature}
            </Text>
          </View>
        ))}

        {isPro ? (
          <Text style={[typography.heading, styles.center, { color: palette.pro }]}>
            {t('toasts.pro_unlocked')}
          </Text>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.xl, gap: spacing.sm, paddingBottom: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  center: { textAlign: 'center' },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
  },
  perkText: { flexShrink: 1 },
  actions: { gap: spacing.sm },
});
