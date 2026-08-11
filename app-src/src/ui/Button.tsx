// Proof Button. Variants primary / secondary / quiet / destructive, sizes md / lg.
// Pill shape, squishes on press (unless reduced motion), fires a named haptic.
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { triggerHaptic, type HapticName } from '@/lib/haptics';
import { spacing, spring, typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  haptic?: HapticName;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  haptic = 'tap',
  fullWidth = true,
}: ButtonProps) {
  const { palette, fontScale } = useAppTheme();
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const floured = fontScale > 1;
  const height = size === 'lg' ? (floured ? 64 : 56) : floured ? 56 : 48;

  const bg =
    variant === 'primary'
      ? palette.primary
      : variant === 'secondary'
        ? palette.bgSunken
        : variant === 'destructive'
          ? palette.dangerWash
          : 'transparent';
  const fg =
    variant === 'primary'
      ? palette.onPrimary
      : variant === 'destructive'
        ? palette.danger
        : variant === 'quiet'
          ? palette.textSoft
          : palette.textInk;

  const isDisabled = disabled || loading;

  const squish = (to: number) => {
    if (!reduced) {
      scale.value = withSpring(to, spring.quick);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={() => squish(0.97)}
      onPressOut={() => squish(1)}
      onPress={() => {
        triggerHaptic(haptic);
        onPress();
      }}
      style={fullWidth ? styles.full : undefined}
    >
      <Animated.View
        style={[
          styles.button,
          animStyle,
          {
            height,
            backgroundColor: bg,
            opacity: isDisabled ? 0.35 : 1,
            borderWidth: variant === 'quiet' ? 1.5 : 0,
            borderColor: palette.border,
          },
          variant === 'primary' && !isDisabled ? styles.primaryShadow : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <View style={styles.content}>
            {icon}
            <Text
              style={{
                fontFamily: typography.title.fontFamily,
                fontSize: 16 * fontScale,
                lineHeight: 20 * fontScale,
                color: fg,
              }}
            >
              {label}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  full: { width: '100%' },
  button: {
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  primaryShadow: {
    shadowColor: '#F2603C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 4,
  },
});

export default Button;
