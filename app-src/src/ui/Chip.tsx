// Fresh Bake Chip. Two emphases that are deliberately not interchangeable: ink is a
// hard choice the baker is making (a unit, a type), butter is a softer one they are
// filtering or browsing by. Using the wrong one makes a filter look like an answer.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { hardShadow, radius, spacing, stroke, typography } from '@/theme';
import { HardShadow } from './HardShadow';

export type ChipEmphasis = 'ink' | 'butter';
export type ChipSize = 'sm' | 'md';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** Ink for unit and type selection, butter for filters and the active mode. */
  emphasis?: ChipEmphasis;
  size?: ChipSize;
  /** Labels that are a number the baker reads, so they take Space Grotesk. */
  numeric?: boolean;
  /** Lifts the selected chip onto a hard shadow, for the one choice on a screen. */
  raised?: boolean;
}

const HEIGHTS = { sm: { normal: 36, floured: 46 }, md: { normal: 44, floured: 56 } } as const;

export function Chip({
  label,
  selected = false,
  onPress,
  emphasis = 'ink',
  size = 'sm',
  numeric = false,
  raised = false,
}: ChipProps) {
  const { palette, fontScale } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  const floured = fontScale > 1;
  const butter = emphasis === 'butter';

  const face = numeric ? typography.numeric.sm : typography.chip;
  const fill = selected ? (butter ? palette.accentButter : palette.primary) : 'transparent';
  const fg = selected ? (butter ? palette.onButter : palette.onPrimary) : palette.textSoft;

  const body = (
    <View
      style={[
        styles.chip,
        {
          height: floured ? HEIGHTS[size].floured : HEIGHTS[size].normal,
          backgroundColor: fill,
          // A selected butter chip keeps a soft ink edge so it does not float;
          // a selected ink chip is already its own edge.
          borderWidth: selected && !butter ? 0 : stroke.soft,
          borderColor: selected && butter ? palette.outline : palette.borderField,
        },
      ]}
    >
      <Text numberOfLines={1} style={[face, scaleType(face, fontScale), { color: fg }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        triggerHaptic('select');
        onPress();
      }}
    >
      {raised ? (
        <HardShadow
          offset={selected ? hardShadow.control : hardShadow.none}
          radius={radius.pill}
          pressed={pressed}
        >
          {body}
        </HardShadow>
      ) : (
        body
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Chip;
