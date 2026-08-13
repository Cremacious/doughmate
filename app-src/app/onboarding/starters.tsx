// Onboarding step 4 of 6: Starters.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/state/settings';
import { IconBadge } from '@/ui/IconBadge';
import { OnboardingScaffold } from '@/ui/OnboardingScaffold';

export default function OnboardingStarters() {
  const { t } = useTranslation();
  const { update } = useSettings();

  const skip = () => {
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingScaffold
      step={4}
      total={5}
      hero={<IconBadge name="starters" tint="teal" />}
      title={t('onboarding.starters.title')}
      body={t('onboarding.starters.body')}
      primaryLabel={t('onboarding.next')}
      onPrimary={() => router.push('/onboarding/swaps')}
      secondaryLabel={t('onboarding.skip')}
      onSecondary={skip}
    />
  );
}
