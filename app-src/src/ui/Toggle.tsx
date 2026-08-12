// Proof Toggle. 51x31 track, 27 knob, 160ms travel (snaps under reduced motion).
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { triggerHaptic } from '@/lib/haptics';

const TRAVEL = 20;

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ value, onValueChange }: ToggleProps) {
  const { palette } = useAppTheme();
  const reduced = useReducedMotion();
  const x = useSharedValue(value ? TRAVEL : 0);

  useEffect(() => {
    const target = value ? TRAVEL : 0;
    x.value = reduced ? target : withTiming(target, { duration: 160 });
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
      style={[styles.track, { backgroundColor: value ? palette.primary : palette.border }]}
    >
      <Animated.View style={[styles.knob, knobStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 51,
    height: 31,
    borderRadius: 999,
    padding: 2,
    justifyContent: 'center',
  },
  knob: {
    width: 27,
    height: 27,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
});

export default Toggle;
