import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OnboardingPage } from '@/components/OnboardingPage';
import { useSettings } from '@/state/settings';

export default function Notifications() {
  const { t } = useTranslation();
  const { update } = useSettings();

  const finish = (reminders: boolean) => {
    update('starterReminders', reminders);
    update('onboarded', true);
    router.replace('/(tabs)/convert');
  };

  return (
    <OnboardingPage
      title={t('tabs.starters')}
      body={t('onboarding.screen3.prompt')}
      primaryLabel={t('onboarding.screen3.yes')}
      onPrimary={() => finish(true)}
      secondaryLabel={t('onboarding.screen3.no')}
      onSecondary={() => finish(false)}
    />
  );
}
