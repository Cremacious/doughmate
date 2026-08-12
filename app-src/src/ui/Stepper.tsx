// Proof Stepper. Two circular buttons around a tabular number.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { spacing, typography } from '@/theme';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** When true, + past max wraps to min and − below min wraps to max. */
  wrap?: boolean;
}

export function Stepper({ value, onChange, min = 1, max, step = 1, wrap = false }: StepperProps) {
  const { palette, fontScale } = useAppTheme();
  const size = fontScale > 1 ? 56 : 48;

  const button = (glyph: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        triggerHaptic('select');
        onPress();
      }}
      style={[styles.circle, { width: size, height: size, backgroundColor: palette.bgSunken }]}
    >
      <Text style={[typography.heading, { color: palette.textSoft }]}>{glyph}</Text>
    </Pressable>
  );

  const decrement = () => {
    if (wrap && value <= min && max !== undefined) {
      onChange(max);
      return;
    }
    onChange(Math.max(min, value - step));
  };

  const increment = () => {
    const ceiling = max ?? Infinity;
    if (wrap && value >= ceiling) {
      onChange(min);
      return;
    }
    onChange(Math.min(ceiling, value + step));
  };

  return (
    <View style={styles.row}>
      {button('−', decrement)}
      <Text style={[typography.numeric.lg, { color: palette.textInk }]}>{value}</Text>
      {button('+', increment)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  circle: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});

export default Stepper;
