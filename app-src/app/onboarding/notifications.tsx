// Onboarding step 3: offer feeding reminders and the weekly tip.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Sam } from '@/components/Sam';
import { useSettings } from '@/state/settings';
import { OnboardingScaffold } from '@/ui/OnboardingScaffold';

export default function Notifications() {
  const { t } = useTranslation();
  const { update } = useSettings();

  const finish = (reminders: boolean) => {
    update('starterReminders', reminders);
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingScaffold
      step={3}
      total={3}
      hero={<Sam size={150} state="idle" />}
      title={t('onboarding.screen3.title')}
      body={t('onboarding.screen3.body')}
      primaryLabel={t('onboarding.screen3.yes')}
      onPrimary={() => finish(true)}
      secondaryLabel={t('onboarding.screen3.no')}
      onSecondary={() => finish(false)}
    />
  );
}
