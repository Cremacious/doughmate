// Onboarding step 5 of 6: Swaps.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/state/settings';
import { IconBadge } from '@/ui/IconBadge';
import { OnboardingScaffold } from '@/ui/OnboardingScaffold';

export default function OnboardingSwaps() {
  const { t } = useTranslation();
  const { update } = useSettings();

  const skip = () => {
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingScaffold
      step={5}
      total={6}
      hero={<IconBadge name="swaps" tint="teal" />}
      title={t('onboarding.swaps.title')}
      body={t('onboarding.swaps.body')}
      primaryLabel={t('onboarding.next')}
      onPrimary={() => router.push('/onboarding/notifications')}
      secondaryLabel={t('onboarding.skip')}
      onSecondary={skip}
    />
  );
}
