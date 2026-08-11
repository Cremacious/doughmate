// Proof Stepper. Two circular buttons around a tabular number.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { spacing, typography } from '@/theme';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}

export function Stepper({ value, onChange, min = 1, step = 1 }: StepperProps) {
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

  return (
    <View style={styles.row}>
      {button('−', () => onChange(Math.max(min, value - step)))}
      <Text style={[typography.numeric.lg, { color: palette.textInk }]}>{value}</Text>
      {button('+', () => onChange(value + step))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  circle: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});

export default Stepper;
