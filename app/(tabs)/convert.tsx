import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';

export default function ConvertScreen() {
  const { t } = useTranslation();
  return <Screen title={t('tabs.convert')} subtitle={t('converter.sam_greeting_default')} />;
}
