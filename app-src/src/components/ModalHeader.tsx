// Title row with a close control for modal screens.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography } from '@/theme';

export interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
}

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <View style={styles.header}>
      <Text style={[typography.display.md, { color: palette.choc }]}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('scaler.close')}
        onPress={onClose ?? (() => router.back())}
        style={styles.close}
      >
        <Text style={[typography.body.lg, { color: palette.crust }]}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  close: {
    padding: spacing.sm,
  },
});

export default ModalHeader;
