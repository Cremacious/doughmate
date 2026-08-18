// A labeled button showing the current unit, opens a unit picker on press.
// Shares Input's label treatment and the field baseline, so an amount and its unit
// sit level beside each other in a row.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, stroke, typography } from '@/theme';
import { fieldHeight } from './fieldMetrics';

export interface UnitPickerFieldProps {
  value: string;
  placeholder: string;
  onPress: () => void;
  /** Sits above the field in the same face Input uses. */
  label?: string;
  accessibilityLabel?: string;
}

export function UnitPickerField({
  value,
  placeholder,
  onPress,
  label,
  accessibilityLabel,
}: UnitPickerFieldProps) {
  const { palette, fontScale } = useAppTheme();

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text
          numberOfLines={1}
          style={[
            typography.label,
            scaleType(typography.label, fontScale),
            { color: palette.textFaint },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={[
          styles.field,
          {
            height: fieldHeight(fontScale),
            backgroundColor: palette.bgSunken,
            borderColor: palette.borderField,
          },
        ]}
      >
        <Text
          style={[
            typography.body.lg,
            scaleType(typography.body.lg, fontScale),
            styles.value,
            { color: value ? palette.textInk : palette.textFaint },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Text style={[typography.body.md, { color: palette.textFaint }]}>▾</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    borderWidth: stroke.soft,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  // Takes the room the chevron does not, so a long unit truncates instead of
  // pushing the chevron off the field.
  value: { flexShrink: 1 },
});

export default UnitPickerField;
