// Onboarding step 2: three sample results to show what Sam handles.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useSettings } from '@/state/settings';
import { radius, spacing, typography } from '@/theme';
import { OnboardingScaffold } from '@/ui/OnboardingScaffold';

function SampleCard({ value, label }: { value: string; label: string }) {
  const { palette } = useAppTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: palette.bgSurface, borderColor: palette.border }]}
    >
      <Text style={[typography.numeric.lg, { color: palette.primary }]}>{value}</Text>
      <Text style={[typography.body.sm, { color: palette.textSoft }]}>{label}</Text>
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
      total={3}
      hero={<View />}
      title={t('onboarding.screen2.title')}
      body={t('onboarding.screen2.features')}
      primaryLabel={t('onboarding.screen2.cta')}
      onPrimary={() => router.push('/onboarding/notifications')}
      secondaryLabel={t('onboarding.screen2.skip')}
      onSecondary={skip}
    >
      <View style={styles.row}>
        <SampleCard
          value={t('onboarding.screen2.sample1_value')}
          label={t('onboarding.screen2.sample1_label')}
        />
        <SampleCard
          value={t('onboarding.screen2.sample2_value')}
          label={t('onboarding.screen2.sample2_label')}
        />
        <SampleCard
          value={t('onboarding.screen2.sample3_value')}
          label={t('onboarding.screen2.sample3_label')}
        />
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing['2xs'],
    alignItems: 'center',
  },
});
