// Fresh Bake hard shadow. React Native cannot draw an offset, unblurred shadow
// portably: iOS honours shadowRadius 0, but Android's elevation always blurs and
// ignores offset entirely. So we draw the shadow ourselves, as a solid same-radius
// View sitting behind the content. Identical on both platforms.
//
// Pressed: the shadow shrinks from its rest offset to hardShadow.pressed while the
// content translates down and right by exactly that difference, so the control
// appears to sit down into its own shadow and its outer footprint never moves.
// Reduced motion (and dark mode, which has no shadow to sit into) drops opacity
// to press.reducedOpacity instead.
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { hardShadow, press } from '@/theme';

export interface HardShadowOffset {
  x: number;
  y: number;
  color: string;
}

export interface HardShadowProps {
  children: ReactNode;
  /** A token from `hardShadow`: control, hero or card. Defaults to control. */
  offset?: HardShadowOffset;
  /** Must match the child's borderRadius so the shadow traces its shape. */
  radius: number;
  /** Overrides the token colour, for shadows that are not ink. */
  color?: string;
  /** True while the control is held down. */
  pressed?: boolean;
  /** Applied to the wrapper, which keeps the content's layout box. */
  style?: StyleProp<ViewStyle>;
}

export function HardShadow({
  children,
  offset = hardShadow.control,
  radius,
  color,
  pressed = false,
  style,
}: HardShadowProps) {
  const { isDark } = useAppTheme();
  const reduced = useReducedMotion();

  // Dark mode has no ink outline, so an ink shadow reads as grime. Drop it.
  const visible = !isDark && offset.color !== 'transparent';

  const shadowStyle = useAnimatedStyle(() => {
    const target = pressed ? hardShadow.pressed : offset;
    if (reduced) {
      return { transform: [{ translateX: target.x }, { translateY: target.y }] };
    }
    return {
      transform: [
        { translateX: withTiming(target.x, { duration: press.duration }) },
        { translateY: withTiming(target.y, { duration: press.duration }) },
      ],
    };
  }, [pressed, offset, reduced]);

  const contentStyle = useAnimatedStyle(() => {
    // No shadow to sink into, or motion is off: fall back to a dip in opacity.
    if (!visible || reduced) {
      return { opacity: pressed ? press.reducedOpacity : 1, transform: [] };
    }
    const travelX = pressed ? offset.x - hardShadow.pressed.x : 0;
    const travelY = pressed ? offset.y - hardShadow.pressed.y : 0;
    return {
      opacity: 1,
      transform: [
        { translateX: withTiming(travelX, { duration: press.duration }) },
        { translateY: withTiming(travelY, { duration: press.duration }) },
      ],
    };
  }, [pressed, offset, reduced, visible]);

  if (!visible) {
    return (
      <View style={style}>
        <Animated.View style={contentStyle}>{children}</Animated.View>
      </View>
    );
  }

  return (
    <View style={style}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: color ?? offset.color, borderRadius: radius },
          shadowStyle,
        ]}
      />
      <Animated.View style={contentStyle}>{children}</Animated.View>
    </View>
  );
}

export default HardShadow;
