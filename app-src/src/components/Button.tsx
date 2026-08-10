// Reusable button. Primary (jam), secondary (dough), and ghost variants.
// Fires a named haptic on press. Colours and radius come from theme tokens.
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic, type HapticName } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  haptic?: HapticName;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  haptic = 'tap',
}: ButtonProps) {
  const { palette, fontScale } = useAppTheme();

  const background =
    variant === 'primary' ? palette.jam : variant === 'secondary' ? palette.dough : 'transparent';
  const textColor =
    variant === 'primary' ? '#FFFFFF' : variant === 'ghost' ? palette.crust : palette.choc;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        triggerHaptic(haptic);
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
      ]}
    >
      <Text
        style={[typography.body.lg, scaleType(typography.body.lg, fontScale), { color: textColor }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
