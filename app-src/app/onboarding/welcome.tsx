// Onboarding step 1 of 6: Sam says hello.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSettings } from '@/state/settings';
import { OnboardingScaffold } from '@/ui/OnboardingScaffold';

export default function Welcome() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { update } = useSettings();

  const skip = () => {
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingScaffold
      step={1}
      total={5}
      hero={<Sam size={196} emotion="happy" crust={palette.samCrustPale} />}
      title={t('onboarding.welcome.title')}
      body={t('onboarding.welcome.body')}
      primaryLabel={t('onboarding.welcome.cta')}
      onPrimary={() => router.push('/onboarding/features')}
      secondaryLabel={t('onboarding.skip')}
      onSecondary={skip}
    />
  );
}
