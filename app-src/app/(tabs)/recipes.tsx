import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';

export default function RecipesScreen() {
  const { t } = useTranslation();
  return <Screen title={t('recipes.title')} subtitle={t('recipes.empty_body')} />;
}
