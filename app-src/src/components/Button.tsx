// Reusable button. Primary (jam), secondary (dough), and ghost variants.
// Squishes on press (unless reduced motion) and fires a named haptic.
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { triggerHaptic, type HapticName } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, spring, typography } from '@/theme';

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
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const squish = (to: number) => {
    if (!reduced) {
      scale.value = withSpring(to, spring.quick);
    }
  };

  const background =
    variant === 'primary' ? palette.jam : variant === 'secondary' ? palette.dough : 'transparent';
  const textColor =
    variant === 'primary' ? '#FFFFFF' : variant === 'ghost' ? palette.crust : palette.choc;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => squish(0.96)}
      onPressOut={() => squish(1)}
      onPress={() => {
        triggerHaptic(haptic);
        onPress();
      }}
    >
      <Animated.View
        style={[
          styles.button,
          animStyle,
          { backgroundColor: background, opacity: disabled ? 0.4 : 1 },
        ]}
      >
        <Text
          style={[
            typography.body.lg,
            scaleType(typography.body.lg, fontScale),
            { color: textColor },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
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
