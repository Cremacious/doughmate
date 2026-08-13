// Onboarding step 5 of 5 (final): Swaps, then into the app.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/state/settings';
import { IconBadge } from '@/ui/IconBadge';
import { OnboardingScaffold } from '@/ui/OnboardingScaffold';

export default function OnboardingSwaps() {
  const { t } = useTranslation();
  const { update } = useSettings();

  const finish = () => {
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingScaffold
      step={5}
      total={5}
      hero={<IconBadge name="swaps" tint="teal" />}
      title={t('onboarding.swaps.title')}
      body={t('onboarding.swaps.body')}
      primaryLabel={t('onboarding.start')}
      onPrimary={finish}
    />
  );
}
