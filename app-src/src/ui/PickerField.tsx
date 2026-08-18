// Fresh Bake picker field. Same geometry as Input so a row of mixed fields lines up;
// tapping opens a sheet rather than a dropdown, so nothing below it shifts.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, stroke, typography } from '@/theme';
import { fieldHeight } from './fieldMetrics';

export interface PickerFieldProps {
  value: string;
  onPress: () => void;
  label?: string;
  /** Numeric values render in Space Grotesk like every other number. */
  numeric?: boolean;
  /** Sunken fill for the compact unit cell in an ingredient row. */
  sunken?: boolean;
}

export function PickerField({
  value,
  onPress,
  label,
  numeric = false,
  sunken = false,
}: PickerFieldProps) {
  const { palette, fontScale } = useAppTheme();

  const valueStyle = numeric
    ? [typography.numeric.md, scaleType(typography.numeric.md, fontScale)]
    : [typography.title, scaleType(typography.title, fontScale)];

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
        accessibilityLabel={label ? `${label}. ${value}` : value}
        onPress={() => {
          triggerHaptic('tap');
          onPress();
        }}
        style={[
          styles.box,
          {
            height: fieldHeight(fontScale),
            backgroundColor: sunken ? palette.bgSunken : palette.bgCanvas,
            borderColor: palette.borderField,
            borderWidth: sunken ? 0 : stroke.soft,
          },
        ]}
      >
        <Text style={[...valueStyle, styles.value, { color: palette.textInk }]} numberOfLines={1}>
          {value}
        </Text>
        <Text style={[typography.title, { color: palette.textFaint }]}>▾</Text>
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
    gap: spacing.xs,
  },
  value: { flexShrink: 1 },
});

export default PickerField;
