// Starters tab. Rebuilt in phase 5.
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography } from '@/theme';
import { Screen } from '@/ui/Screen';

export default function StartersScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  return (
    <Screen title={t('tabs.starters')}>
      <Text style={[typography.body.md, styles.note, { color: palette.textSoft }]}>
        Your starters are coming together.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ note: { paddingTop: spacing.xl } });
