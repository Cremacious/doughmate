import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OnboardingPage } from '@/components/OnboardingPage';
import { useSettings } from '@/state/settings';

export default function Features() {
  const { t } = useTranslation();
  const { update } = useSettings();

  const skip = () => {
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingPage
      title={t('tabs.convert')}
      body={t('onboarding.screen2.features')}
      primaryLabel={t('onboarding.screen2.cta')}
      onPrimary={() => router.push('/onboarding/notifications')}
      secondaryLabel={t('onboarding.screen2.skip')}
      onSecondary={skip}
    />
  );
}
