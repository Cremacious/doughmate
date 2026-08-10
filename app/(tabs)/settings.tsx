import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';

export default function SettingsScreen() {
  const { t } = useTranslation();
  return <Screen title={t('settings.title')} subtitle={t('app.tagline')} />;
}
