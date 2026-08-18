// Fresh Bake Button. Variants primary / ink / secondary / quiet / destructive, sizes
// md / lg. Squared off at radius.xl, not a pill, with a 2px ink outline that carries
// the whole system. Filled variants ride a hard shadow and sit down into it on press.
//
// `ink` is the primary action *on* a hero fill, where tomato would put a second hero
// colour on the screen. It needs a lighter surface under it, so do not use it straight
// on the dark canvas.
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic, type HapticName } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { hardShadow, radius, spacing, stroke, typography } from '@/theme';
import { HardShadow } from './HardShadow';

export type ButtonVariant = 'primary' | 'ink' | 'secondary' | 'quiet' | 'destructive';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  /** Rendered after the label, for a price or a count that belongs to the action. */
  trailing?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  haptic?: HapticName;
  fullWidth?: boolean;
}

/** Heights at fontScale.normal; floured fingers swaps to the taller column. */
const HEIGHTS = {
  md: { normal: 54, floured: 64 },
  lg: { normal: 60, floured: 72 },
} as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  trailing,
  disabled = false,
  loading = false,
  haptic = 'tap',
  fullWidth = true,
}: ButtonProps) {
  const { palette, fontScale } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  const floured = fontScale > 1;
  const height = floured ? HEIGHTS[size].floured : HEIGHTS[size].normal;
  const isDisabled = disabled || loading;

  // Disabled outranks the variant: one flat sunken slab, no shadow, no emphasis.
  const fill = isDisabled
    ? palette.bgSunken
    : variant === 'primary'
      ? palette.primary
      : variant === 'ink'
        ? palette.outline
        : variant === 'secondary'
          ? palette.bgSurface
          : variant === 'destructive'
            ? palette.dangerWash
            : 'transparent';

  const fg = isDisabled
    ? palette.textDisabled
    : variant === 'primary' || variant === 'ink'
      ? palette.onPrimary
      : variant === 'destructive'
        ? palette.danger
        : variant === 'quiet'
          ? palette.textSoft
          : palette.textInk;

  const borderColor = isDisabled
    ? palette.border
    : variant === 'destructive'
      ? palette.danger
      : variant === 'quiet'
        ? palette.border
        : palette.outline;

  // Ink is its own edge, so it takes no border on top of its fill.
  const borderWidth =
    variant === 'ink' && !isDisabled ? 0 : variant === 'quiet' ? stroke.soft : stroke.ink;

  // Primary and ink carry a shadow, and it grows with the button.
  const filled = variant === 'primary' || variant === 'ink';
  const shadowOffset =
    isDisabled || !filled ? hardShadow.none : size === 'lg' ? hardShadow.hero : hardShadow.control;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        triggerHaptic(haptic);
        onPress();
      }}
      style={fullWidth ? styles.full : undefined}
    >
      <HardShadow
        offset={shadowOffset}
        radius={radius.xl}
        // Quiet has no fill to press into, so it never dips.
        pressed={pressed && variant !== 'quiet'}
      >
        <View
          style={[
            styles.button,
            {
              height,
              backgroundColor: fill,
              borderColor,
              borderWidth,
              borderStyle: variant === 'quiet' ? 'dashed' : 'solid',
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={fg} />
          ) : (
            <View style={styles.content}>
              {icon}
              <Text
                numberOfLines={1}
                style={[typography.button, scaleType(typography.button, fontScale), { color: fg }]}
              >
                {label}
              </Text>
              {trailing}
            </View>
          )}
        </View>
      </HardShadow>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  full: { width: '100%' },
  button: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

export default Button;
