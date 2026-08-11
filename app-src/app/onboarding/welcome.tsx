// Onboarding step 1: Sam says hello.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Sam } from '@/components/Sam';
import { useSettings } from '@/state/settings';
import { OnboardingScaffold } from '@/ui/OnboardingScaffold';

export default function Welcome() {
  const { t } = useTranslation();
  const { update } = useSettings();

  const skip = () => {
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingScaffold
      step={1}
      total={3}
      hero={<Sam size={150} state="idle" />}
      title={t('onboarding.screen1.title')}
      body={t('onboarding.screen1.body')}
      primaryLabel={t('onboarding.screen1.cta')}
      onPrimary={() => router.push('/onboarding/features')}
      secondaryLabel={t('onboarding.screen1.skip')}
      onSecondary={skip}
    />
  );
}
