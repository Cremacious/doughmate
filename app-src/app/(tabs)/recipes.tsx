// Recipes tab. Rebuilt as the flagship Recipe Box in phase 4.
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography } from '@/theme';
import { Screen } from '@/ui/Screen';

export default function RecipesScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  return (
    <Screen title={t('tabs.recipes')}>
      <Text style={[typography.body.md, styles.note, { color: palette.textSoft }]}>
        The Recipe Box is coming together.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ note: { paddingTop: spacing.xl } });
