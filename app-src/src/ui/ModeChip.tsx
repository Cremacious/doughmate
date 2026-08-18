// Fresh Bake mode chip for the Convert row. Only the selected mode spells out its
// name; every other mode collapses to a circular icon and the row ends with a +N pill
// that opens the full tray. That is what keeps six converters inside 390px without
// the row scroll clipping, which is what it used to do.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { hardShadow, radius, spacing, stroke, typography } from '@/theme';
import { HardShadow } from './HardShadow';
import { Icon, type IconName } from './Icon';

export interface ModeChipProps {
  iconName: IconName;
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** 44 at fontScale.normal, 56 in floured fingers. Both are square when collapsed. */
function useChipSize() {
  const { fontScale } = useAppTheme();
  return fontScale > 1 ? 56 : 44;
}

export function ModeChip({ iconName, label, selected, onPress }: ModeChipProps) {
  const { palette, fontScale } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  const size = useChipSize();

  const fg = selected ? palette.onButter : palette.textSoft;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        triggerHaptic('select');
        onPress();
      }}
    >
      <HardShadow
        offset={selected ? hardShadow.control : hardShadow.none}
        radius={radius.pill}
        pressed={pressed}
      >
        <View
          style={[
            styles.chip,
            {
              height: size,
              // Collapsed chips are circles; the selected one grows to fit its name.
              width: selected ? undefined : size,
              paddingHorizontal: selected ? spacing.md : 0,
              backgroundColor: selected ? palette.accentButter : 'transparent',
              borderWidth: selected ? stroke.ink : stroke.soft,
              borderColor: selected ? palette.outline : palette.borderField,
            },
          ]}
        >
          <Icon name={iconName} size={Math.round(size * 0.41)} color={fg} />
          {selected ? (
            <Text
              numberOfLines={1}
              style={[typography.chip, scaleType(typography.chip, fontScale), { color: fg }]}
            >
              {label}
            </Text>
          ) : null}
        </View>
      </HardShadow>
    </Pressable>
  );
}

export interface ModeOverflowChipProps {
  /** How many modes are hidden behind the tray. */
  count: number;
  label: string;
  onPress: () => void;
}

/** The `+N` pill that ends the row and opens the mode tray. */
export function ModeOverflowChip({ count, label, onPress }: ModeOverflowChipProps) {
  const { palette, fontScale } = useAppTheme();
  const size = useChipSize();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        triggerHaptic('select');
        onPress();
      }}
      style={[
        styles.chip,
        {
          height: size,
          paddingHorizontal: spacing.md,
          borderWidth: stroke.soft,
          borderColor: palette.borderField,
        },
      ]}
    >
      <Text
        // A count, so Space Grotesk like every other number the baker reads.
        style={[
          typography.numeric.sm,
          scaleType(typography.numeric.sm, fontScale),
          { color: palette.textSoft },
        ]}
      >
        {`+${count}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
  },
});

export default ModeChip;
