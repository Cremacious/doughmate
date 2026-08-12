// Onboarding step 6 of 6: offer feeding reminders and the weekly tip.
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
      step={6}
      total={6}
      hero={<Sam size={150} state="idle" />}
      title={t('onboarding.reminders.title')}
      body={t('onboarding.reminders.body')}
      primaryLabel={t('onboarding.reminders.yes')}
      onPrimary={() => finish(true)}
      secondaryLabel={t('onboarding.reminders.no')}
      onSecondary={() => finish(false)}
    />
  );
}
