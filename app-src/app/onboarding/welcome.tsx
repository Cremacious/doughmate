import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OnboardingPage } from '@/components/OnboardingPage';
import { useSettings } from '@/state/settings';

export default function Welcome() {
  const { t } = useTranslation();
  const { update } = useSettings();

  const skip = () => {
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingPage
      title={t('app.name')}
      body={t('onboarding.screen1.greeting')}
      primaryLabel={t('onboarding.screen1.cta')}
      onPrimary={() => router.push('/onboarding/features')}
      secondaryLabel={t('onboarding.screen1.skip')}
      onSecondary={skip}
    />
  );
}
