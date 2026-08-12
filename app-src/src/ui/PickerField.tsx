// Proof picker field. Shows the current value; tapping opens a sheet.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { radius, spacing, typography } from '@/theme';

export interface PickerFieldProps {
  value: string;
  onPress: () => void;
  label?: string;
}

export function PickerField({ value, onPress, label }: PickerFieldProps) {
  const { palette, fontScale } = useAppTheme();

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[typography.label, { color: palette.textSoft }]}>{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          triggerHaptic('tap');
          onPress();
        }}
        style={[styles.box, { height: fontScale > 1 ? 64 : 56, backgroundColor: palette.bgSunken }]}
      >
        <Text
          style={[typography.title, styles.value, { color: palette.textInk }]}
          numberOfLines={1}
        >
          {value}
        </Text>
        <Text style={[typography.title, { color: palette.textSoft }]}>▾</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  value: { flexShrink: 1 },
});

export default PickerField;
