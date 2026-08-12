// Onboarding step 1 of 6: Sam says hello.
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
      total={6}
      hero={<Sam size={150} state="idle" />}
      title={t('onboarding.welcome.title')}
      body={t('onboarding.welcome.body')}
      primaryLabel={t('onboarding.welcome.cta')}
      onPrimary={() => router.push('/onboarding/features')}
      secondaryLabel={t('onboarding.skip')}
      onSecondary={skip}
    />
  );
}
