import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';

export default function RecipesScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('recipes.title')} subtitle={t('recipes.empty_body')}>
      <Button label={t('scaler.title')} onPress={() => router.push('/scaler')} />
    </Screen>
  );
}
