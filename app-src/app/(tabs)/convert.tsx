// Convert tab. Rebuilt with all six modes in phase 3.
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography } from '@/theme';
import { Screen } from '@/ui/Screen';

export default function ConvertScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  return (
    <Screen title={t('tabs.convert')}>
      <Text style={[typography.body.md, styles.note, { color: palette.textSoft }]}>
        The converter is coming together.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ note: { paddingTop: spacing.xl } });
