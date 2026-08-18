// Onboarding step 2 of 6: Convert. One clean example instead of crammed cards.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useSettings } from '@/state/settings';
import { radius, spacing, stroke, typography } from '@/theme';
import { IconBadge } from '@/ui/IconBadge';
import { OnboardingScaffold } from '@/ui/OnboardingScaffold';

function ExampleChip() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  return (
    <View
      style={[styles.chip, { backgroundColor: palette.bgSurface, borderColor: palette.outline }]}
    >
      <Text style={[typography.body.lg, { color: palette.textInk }]}>
        {t('onboarding.convert.example_from')}
      </Text>
      <Text style={[typography.body.lg, { color: palette.textFaint }]}>→</Text>
      <Text style={[typography.numeric.sm, { color: palette.primary }]}>
        {t('onboarding.convert.example_to')}
      </Text>
    </View>
  );
}

export default function Features() {
  const { t } = useTranslation();
  const { update } = useSettings();

  const skip = () => {
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingScaffold
      step={2}
      total={5}
      hero={<IconBadge name="convert" tint="primary" />}
      title={t('onboarding.convert.title')}
      body={t('onboarding.convert.body')}
      primaryLabel={t('onboarding.next')}
      onPrimary={() => router.push('/onboarding/recipes')}
      secondaryLabel={t('onboarding.skip')}
      onSecondary={skip}
    >
      <ExampleChip />
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: stroke.ink,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
