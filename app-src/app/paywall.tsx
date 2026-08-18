// Doughmate Pro, a tall sheet. A plum hero with Sam celebrating, the perks as one
// divided card, then buy and restore. Buying needs a native build with a configured
// key; on web it is unavailable and the button stays disabled.
//
// Plum is the Pro colour, always and only, so the hero carries it and nothing else on
// the sheet competes. The price rides beside the label in Space Grotesk, because it is
// the number the decision turns on.
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { usePro } from '@/state/pro';
import { radius, spacing, stroke, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { useToast } from '@/ui/Toast';

const CHECK = 26;

export default function PaywallSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
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
              label={t('paywall.cta_label')}
              onPress={onBuy}
              disabled={busy || !available}
              haptic="success"
              trailing={
                <Text
                  style={[
                    typography.numeric.md,
                    scaleType(typography.numeric.md, fontScale),
                    { color: palette.onPrimary },
                  ]}
                >
                  {t('paywall.price')}
                </Text>
              }
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
        <Card tier="hero" heroColor={palette.pro} style={styles.hero}>
          <Sam size={132} emotion="excited" crust={palette.samCrustPale} />
          <Text
            style={[
              typography.display.lg,
              scaleType(typography.display.lg, fontScale),
              styles.center,
              { color: palette.onPro },
            ]}
          >
            {t('paywall.title')}
          </Text>
          <Text
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              styles.center,
              { color: palette.onProSoft },
            ]}
          >
            {t('paywall.tagline')}
          </Text>
        </Card>

        <Card style={styles.perks}>
          {features.map((feature, i) => (
            <View key={feature}>
              {i > 0 ? (
                <View style={[styles.divider, { backgroundColor: palette.divider }]} />
              ) : null}
              <View style={styles.perk}>
                <View style={[styles.check, { borderColor: palette.pro }]}>
                  <Text style={[typography.body.sm, { color: palette.pro }]}>✓</Text>
                </View>
                <Text
                  style={[
                    typography.body.lg,
                    scaleType(typography.body.lg, fontScale),
                    styles.perkText,
                    { color: palette.textInk },
                  ]}
                >
                  {feature}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {isPro ? (
          <Text
            style={[
              typography.subheading,
              scaleType(typography.subheading, fontScale),
              styles.center,
              { color: palette.pro },
            ]}
          >
            {t('toasts.pro_unlocked')}
          </Text>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  center: { textAlign: 'center' },
  perks: { gap: 0 },
  divider: { height: stroke.soft },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  perkText: { flexShrink: 1 },
  check: {
    width: CHECK,
    height: CHECK,
    borderRadius: radius.pill,
    borderWidth: stroke.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { gap: spacing.sm },
});
