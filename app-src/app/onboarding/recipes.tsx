// Onboarding step 3 of 6: the Recipe Box.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/state/settings';
import { IconBadge } from '@/ui/IconBadge';
import { OnboardingScaffold } from '@/ui/OnboardingScaffold';

export default function OnboardingRecipes() {
  const { t } = useTranslation();
  const { update } = useSettings();

  const skip = () => {
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingScaffold
      step={3}
      total={5}
      hero={<IconBadge name="recipes" tint="primary" />}
      title={t('onboarding.recipes.title')}
      body={t('onboarding.recipes.body')}
      primaryLabel={t('onboarding.next')}
      onPrimary={() => router.push('/onboarding/starters')}
      secondaryLabel={t('onboarding.skip')}
      onSecondary={skip}
    />
  );
}
