// Gives its child a little spring pop whenever `trigger` changes. Under reduced
// motion the pop becomes a short fade, so a changed answer still announces itself
// without anything moving.
import { type ReactNode, useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration, spring } from '@/theme';

export interface PopInProps {
  children: ReactNode;
  trigger: unknown;
}

export function PopIn({ children, trigger }: PopInProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      opacity.value = withSequence(
        withTiming(0, { duration: duration.instant / 2 }),
        withTiming(1, { duration: duration.instant / 2 })
      );
      return;
    }
    scale.value = withSequence(withTiming(1.12, { duration: 110 }), withSpring(1, spring.medium));
  }, [trigger, reduced, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default PopIn;
