// Fresh Bake progress bar. Replaces the ring: a bar reads at a glance from across a
// kitchen and lines up with the text above it. Teal while proofing, butter on a hero
// card where teal would vanish into the fill.
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { radius, spring } from '@/theme';

export interface ProgressBarProps {
  /** 0 to 1. Clamped. */
  progress: number;
  /** Bars sitting on a hero fill go butter on a translucent ink track. */
  onHero?: boolean;
  height?: 8 | 10;
  /** Overrides the fill colour. */
  color?: string;
}

export function ProgressBar({ progress, onHero = false, height = 8, color }: ProgressBarProps) {
  const { palette } = useAppTheme();
  const reduced = useReducedMotion();
  const clamped = Math.min(1, Math.max(0, progress));
  const width = useSharedValue(clamped);

  useEffect(() => {
    width.value = reduced ? clamped : withSpring(clamped, spring.medium);
  }, [clamped, reduced, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[
        styles.track,
        { height, backgroundColor: onHero ? palette.heroDim : palette.bgSunken },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color ?? (onHero ? palette.accentButter : palette.proofTeal) },
          fillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: radius.pill, overflow: 'hidden', width: '100%' },
  fill: { height: '100%', borderRadius: radius.pill },
});

export default ProgressBar;
