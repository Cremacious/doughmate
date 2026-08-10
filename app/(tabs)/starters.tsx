import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';

export default function StartersScreen() {
  const { t } = useTranslation();
  return <Screen title={t('starters.title')} subtitle={t('starters.empty_body')} />;
}
