// Gives its child a little spring pop whenever `trigger` changes. Skips the
// animation entirely when reduced motion is on.
import { type ReactNode, useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { spring } from '@/theme';

export interface PopInProps {
  children: ReactNode;
  trigger: unknown;
}

export function PopIn({ children, trigger }: PopInProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      return;
    }
    scale.value = withSequence(withTiming(1.12, { duration: 110 }), withSpring(1, spring.medium));
  }, [trigger, reduced, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default PopIn;
