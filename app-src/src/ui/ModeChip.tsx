// Proof mode chip. Icon plus label, used in the Convert mode row. The selected
// chip inverts (ink fill, canvas content) so state reads without colour alone.
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { spacing } from '@/theme';
import { Icon, type IconName } from './Icon';

export interface ModeChipProps {
  iconName: IconName;
  label: string;
  selected: boolean;
  onPress: () => void;
  outlined?: boolean;
}

export function ModeChip({ iconName, label, selected, onPress, outlined = false }: ModeChipProps) {
  const { palette, fontScale } = useAppTheme();
  const bg = selected ? palette.textInk : outlined ? 'transparent' : palette.bgSunken;
  const fg = selected ? palette.bgCanvas : palette.textSoft;

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
          height: fontScale > 1 ? 52 : 44,
          backgroundColor: bg,
          borderWidth: outlined ? 1.5 : 0,
          borderColor: palette.border,
        },
      ]}
    >
      <Icon name={iconName} size={17} color={fg} />
      <Text style={{ fontFamily: 'NunitoSans_700Bold', fontSize: 14 * fontScale, color: fg }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
});

export default ModeChip;
