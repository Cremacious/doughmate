// Fresh Bake Stepper. Two outlined circles around a Space Grotesk value. `spread`
// pushes the buttons out to the row edges with the value centred, which is how the
// egg count and the floured fingers amount field read.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, stroke, typography } from '@/theme';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** When true, + past max wraps to min and − below min wraps to max. */
  wrap?: boolean;
  /** Buttons out to the row edges, value centred between them. */
  spread?: boolean;
  /** Circle diameter at fontScale.normal. 44 by default, 52 on the egg count. */
  size?: number;
  /** Rendered instead of the raw value, for units and formatted amounts. */
  formatValue?: (value: number) => string;
  decrementLabel?: string;
  incrementLabel?: string;
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  wrap = false,
  spread = false,
  size = 44,
  formatValue,
  decrementLabel,
  incrementLabel,
}: StepperProps) {
  const { palette, fontScale } = useAppTheme();
  // Floured fingers takes the 44 circle to 60; a larger base scales with it.
  const diameter = fontScale > 1 ? Math.round(size * (60 / 44)) : size;

  const button = (glyph: string, onPress: () => void, label: string | undefined) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        triggerHaptic('select');
        onPress();
      }}
      style={[
        styles.circle,
        {
          width: diameter,
          height: diameter,
          backgroundColor: palette.bgCanvas,
          borderColor: palette.outline,
          borderWidth: stroke.ink,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: 'NunitoSans_800ExtraBold',
          fontSize: 22 * fontScale,
          lineHeight: 26 * fontScale,
          color: palette.textInk,
        }}
      >
        {glyph}
      </Text>
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
    <View style={[styles.row, spread ? styles.spread : styles.grouped]}>
      {button('−', decrement, decrementLabel)}
      <Text
        style={[
          typography.numeric.lg,
          scaleType(typography.numeric.lg, fontScale),
          styles.value,
          { color: palette.textInk },
        ]}
      >
        {formatValue ? formatValue(value) : value}
      </Text>
      {button('+', increment, incrementLabel)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  grouped: { gap: spacing.lg },
  spread: { justifyContent: 'space-between', flex: 1 },
  circle: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  value: { textAlign: 'center' },
});

export default Stepper;
