// Sam, DoughMate's sourdough mascot. One chubby outlined boule, drawn in
// react native svg so it renders identically on web and native, with an
// expressive face per emotion. The crust and outline come from the theme's Sam
// tokens; the small accents (cheeks, sparkles) are a fixed brand palette,
// intentional in both light and dark.
import { type ComponentType, type ReactNode, useEffect } from 'react';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, type GProps, Path } from 'react-native-svg';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { SamEmotion } from '@/lib/samEmotion';

/**
 * Idle motion, in the drawing's own units and milliseconds.
 *
 * Breath and sway are deliberately not multiples of each other, so the loop never
 * lands on the same pose twice in a row and never reads as a GIF. Both are anchored
 * near his base, so he squashes rather than floats. The blink is a scaleY on the eye
 * group alone, offbeat from both, and it costs one shared value.
 */
const IDLE = {
  breathMs: 2100,
  breathScale: 1.025,
  /** Rise at the top of a breath, in viewBox units. */
  breathRise: 2.5,
  swayMs: 4200,
  swayDeg: 1.6,
  blinkGapMs: 2300,
  blinkMs: 45,
  /** Eye line in viewBox units: the blink pivots here, not on the loaf's centre. */
  eyeY: 54,
} as const;

/** Below this, idle motion is a twitch rather than a breath. Footnote Sams stay still. */
const IDLE_MIN_SIZE = 56;

const ASPECT = 104 / 120;
/** Tight crop drops the drawing's slack so Sam fills a circular avatar. */
const TIGHT_VIEWBOX = '6 12 108 84';
const TIGHT_ASPECT = 84 / 108;

const SHADOW = '#8B5A2B';
const CHEEK = '#F2A0A0';
const SPARKLE = '#2C7A70';
const ALERT = '#F2603C';
const ZZZ = '#A08D7C';
const SHINE = '#FFFFFF';

export interface SamProps {
  /** Rendered width in points. Height keeps the 120x104 aspect ratio. */
  size?: number;
  /** Which face to show. Defaults to a gentle idle smile. */
  emotion?: SamEmotion;
  /**
   * Crops the viewBox in to the loaf itself. Use inside a circular avatar so Sam
   * fills the circle instead of floating in the middle of it.
   */
  tightCrop?: boolean;
  /**
   * Overrides the crust fill. Pass `samCrustPale` on a butter or plum hero, where
   * the usual crust disappears into the fill.
   */
  crust?: string;
  /**
   * Breathe, sway and blink. For the large Sams that carry a screen: onboarding,
   * empty states, the paywall and the starter hero. Ignored under reduced motion and
   * below IDLE_MIN_SIZE, where the same motion reads as a twitch.
   */
  idle?: boolean;
}

/**
 * One shared value drives every eye group in every face.
 *
 * The matrix rather than `scaleY` plus `originY`: react-native-svg resolves those two
 * into a matrix in JavaScript, on the way to the native view, and animated props go
 * straight to the native view instead. Writing the matrix ourselves is the same
 * transform — scale about the eye line — expressed where the animation can reach it.
 */
function useBlinkProps(blink: { value: number }) {
  return useAnimatedProps(() => ({
    matrix: [1, 0, 0, blink.value, 0, IDLE.eyeY * (1 - blink.value)],
  }));
}

type BlinkProps = ReturnType<typeof useBlinkProps>;

/**
 * `matrix` is what react-native-svg's own setNativeProps forwards to the native view,
 * but it is deliberately absent from the declarative GProps, which takes scaleY and
 * originY instead. Widening the type here is the one place that difference has to be
 * written down.
 */
const AnimatedG = Animated.createAnimatedComponent(G) as ComponentType<
  GProps & { children?: ReactNode; animatedProps?: BlinkProps }
>;

function Face({ emotion, ink, blink }: { emotion: SamEmotion; ink: string; blink: BlinkProps }) {
  switch (emotion) {
    case 'idle':
      return (
        <G>
          <AnimatedG animatedProps={blink}>
            <Circle cx={47} cy={54} r={3} fill={ink} />
            <Circle cx={73} cy={54} r={3} fill={ink} />
          </AnimatedG>
          <Path
            d="M52 66 q8 6 16 0"
            stroke={ink}
            strokeWidth={2.6}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
    case 'happy':
      return (
        <G>
          <Ellipse cx={36} cy={62} rx={6} ry={3.6} fill={CHEEK} opacity={0.5} />
          <Ellipse cx={84} cy={62} rx={6} ry={3.6} fill={CHEEK} opacity={0.5} />
          <G stroke={ink} strokeWidth={2.6} fill="none" strokeLinecap="round">
            <AnimatedG animatedProps={blink}>
              <Path d="M42 56 q5 -5 10 0" />
              <Path d="M68 56 q5 -5 10 0" />
            </AnimatedG>
            <Path d="M50 65 q10 9 20 0" />
          </G>
        </G>
      );
    case 'excited':
      return (
        <G>
          <Path
            d="M22 28 l0 8 M18 32 l8 0"
            stroke={SPARKLE}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
          <Path
            d="M98 24 l0 6 M95 27 l6 0"
            stroke={SPARKLE}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
          <AnimatedG animatedProps={blink}>
            <Circle cx={47} cy={54} r={4} fill={ink} />
            <Circle cx={73} cy={54} r={4} fill={ink} />
            <Circle cx={48.6} cy={52.4} r={1.3} fill={SHINE} />
            <Circle cx={74.6} cy={52.4} r={1.3} fill={SHINE} />
          </AnimatedG>
          <Path d="M50 65 q10 11 20 0 z" fill={ink} />
        </G>
      );
    case 'curious':
      return (
        <G>
          <Path
            d="M67 45 q6 -4 11 1"
            stroke={ink}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
          />
          <AnimatedG animatedProps={blink}>
            <Circle cx={47} cy={55} r={3} fill={ink} />
            <Circle cx={73} cy={52} r={3} fill={ink} />
          </AnimatedG>
          <Path
            d="M54 67 q6 3 12 0"
            stroke={ink}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
    case 'hungry':
      return (
        <G>
          <Path d="M95 22 l0 8" stroke={ALERT} strokeWidth={2.6} strokeLinecap="round" />
          <Circle cx={95} cy={34} r={1.5} fill={ALERT} />
          <AnimatedG animatedProps={blink}>
            <Circle cx={47} cy={54} r={4.4} fill={ink} />
            <Circle cx={73} cy={54} r={4.4} fill={ink} />
            <Circle cx={48.7} cy={52.1} r={1.5} fill={SHINE} />
            <Circle cx={74.7} cy={52.1} r={1.5} fill={SHINE} />
          </AnimatedG>
          <Ellipse cx={60} cy={69} rx={3.2} ry={3.8} fill={ink} />
        </G>
      );
    case 'sleepy':
      return (
        <G>
          <Path
            d="M84 30 h6 l-6 6 h6"
            stroke={ZZZ}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M93 22 h4 l-4 4 h4"
            stroke={ZZZ}
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <G stroke={ink} strokeWidth={2.6} strokeLinecap="round">
            <Path d="M42 55 h10" />
            <Path d="M68 55 h10" />
          </G>
          <Path d="M56 68 h8" stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
        </G>
      );
  }
}

export function Sam({
  size = 96,
  emotion = 'idle',
  tightCrop = false,
  crust,
  idle = false,
}: SamProps) {
  const { palette } = useAppTheme();
  const reduced = useReducedMotion();
  const ink = palette.samOutline;
  const crustFill = crust ?? palette.samCrust;

  const live = idle && !reduced && size >= IDLE_MIN_SIZE;

  const breath = useSharedValue(0);
  const sway = useSharedValue(0);
  const blink = useSharedValue(1);

  useEffect(() => {
    if (!live) {
      breath.value = 0;
      sway.value = 0;
      blink.value = 1;
      return;
    }
    const smooth = Easing.inOut(Easing.quad);
    breath.value = withRepeat(withTiming(1, { duration: IDLE.breathMs, easing: smooth }), -1, true);
    sway.value = withRepeat(withTiming(1, { duration: IDLE.swayMs, easing: smooth }), -1, true);
    blink.value = withRepeat(
      withSequence(
        withDelay(IDLE.blinkGapMs, withTiming(0.08, { duration: IDLE.blinkMs })),
        withTiming(1, { duration: IDLE.blinkMs })
      ),
      -1,
      false
    );
  }, [live, breath, sway, blink]);

  // The rise is authored in viewBox units, so it has to travel with the drawing.
  const unit = size / 120;

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(breath.value, [0, 1], [0, -IDLE.breathRise * unit]) },
      { scale: interpolate(breath.value, [0, 1], [1, IDLE.breathScale]) },
      { rotate: `${interpolate(sway.value, [0, 1], [-IDLE.swayDeg, IDLE.swayDeg])}deg` },
    ],
  }));

  const blinkProps = useBlinkProps(blink);

  return (
    // Anchored near his base rather than his centre, so a breath squashes him into
    // the surface he is standing on instead of floating him off it.
    <Animated.View style={[{ transformOrigin: '50% 92%' }, bodyStyle]}>
      <Svg
        width={size}
        height={size * (tightCrop ? TIGHT_ASPECT : ASPECT)}
        viewBox={tightCrop ? TIGHT_VIEWBOX : '0 0 120 104'}
      >
        <Ellipse cx={60} cy={98} rx={40} ry={4.5} fill={SHADOW} opacity={0.18} />
        {/* 3.0 so the loaf holds its own beside a 2px outlined card. */}
        <Path
          d="M14 64 C14 32 40 20 60 20 C80 20 106 32 106 64 C106 82 88 92 60 92 C32 92 14 82 14 64 Z"
          fill={crustFill}
          stroke={ink}
          strokeWidth={3}
        />
        <Face emotion={emotion} ink={ink} blink={blinkProps} />
      </Svg>
    </Animated.View>
  );
}

export default Sam;
