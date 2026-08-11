// Proof Chip (options). Selectable pill. Single select rows compose these.
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { spacing, typography } from '@/theme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  const { palette, fontScale } = useAppTheme();
  const floured = fontScale > 1;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        triggerHaptic('select');
        onPress();
      }}
      style={[
        styles.chip,
        {
          height: floured ? 44 : 36,
          backgroundColor: selected ? palette.primary : palette.bgSunken,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: typography.title.fontFamily,
          fontSize: 14 * fontScale,
          color: selected ? palette.onPrimary : palette.textSoft,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Chip;
