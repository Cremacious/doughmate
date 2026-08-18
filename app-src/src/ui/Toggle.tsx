// Fresh Bake Toggle. 52x32 outlined track, 24 knob that carries its own ink stroke so
// it reads against both the sunken off state and the tomato on state. Dark mode drops
// every stroke, because ink on a dark canvas is just a smudge.
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { triggerHaptic } from '@/lib/haptics';
import { radius, stroke } from '@/theme';

/** Track 52 wide, less 2px stroke and 2px padding a side, less the 24 knob. */
const TRAVEL = 20;
const DURATION = 160;

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ value, onValueChange }: ToggleProps) {
  const { palette, isDark } = useAppTheme();
  const reduced = useReducedMotion();
  const x = useSharedValue(value ? TRAVEL : 0);

  useEffect(() => {
    const target = value ? TRAVEL : 0;
    x.value = reduced ? target : withTiming(target, { duration: DURATION });
  }, [value, reduced, x]);

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => {
        triggerHaptic('select');
        onValueChange(!value);
      }}
      style={[
        styles.track,
        {
          backgroundColor: value ? palette.primary : palette.bgSunken,
          borderWidth: isDark ? 0 : stroke.ink,
          borderColor: palette.outline,
          // Without a stroke the knob needs the room back, or it sits off centre.
          padding: isDark ? 4 : 2,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.knob,
          knobStyle,
          {
            backgroundColor: value ? palette.onPrimary : palette.bgSurface,
            borderWidth: isDark ? 0 : stroke.ink,
            borderColor: palette.outline,
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 52,
    height: 32,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  knob: { width: 24, height: 24, borderRadius: radius.pill },
});

export default Toggle;
