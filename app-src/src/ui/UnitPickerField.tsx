// A labeled button showing the current unit, opens a unit picker on press.
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, spacing, typography } from '@/theme';

export interface UnitPickerFieldProps {
  value: string;
  placeholder: string;
  onPress: () => void;
}

export function UnitPickerField({ value, placeholder, onPress }: UnitPickerFieldProps) {
  const { palette, fontScale } = useAppTheme();
  const floured = fontScale > 1;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.field,
        {
          height: floured ? 64 : 56,
          backgroundColor: palette.bgSurface,
          borderColor: palette.border,
        },
      ]}
    >
      <Text
        style={[typography.body.lg, { color: value ? palette.textInk : palette.textFaint }]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <Text style={[typography.body.md, { color: palette.textFaint }]}>▾</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
});

export default UnitPickerField;
