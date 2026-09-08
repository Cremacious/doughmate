// DoughMate cold start. Sam wakes up in about 1.2 seconds, then hands off to the app.
//
// Four beats, one clock. Sam dozes on a full bleed tomato ground while zzz drift up;
// his eyes open and he squashes down and stretches into a hop; he settles happy and
// the wordmark rises under him; then the ground itself shrinks into the tomato answer
// card and the app is simply there, already laid out behind it. Nothing cross fades
// into place, because the thing that was the splash is the thing that is now the card.
//
// Everything derives from one linear clock in milliseconds, so the whole piece
// is a single animation on the UI thread and the beats cannot drift apart. Under
// reduced motion it is a still ground and a short fade.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useColorScheme, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { SamEmotion } from '@/lib/samEmotion';
import { useSettings } from '@/state/settings';
import { palettes, radius, spacing, typography } from '@/theme';

/** Cue times in ms. The names match the scenes the piece was authored against. */
const CUE = { sleep: 0, wake: 400, wordmark: 850, handoff: 1200 } as const;
/** The ground has finished becoming the card here; what is left is getting out of the way. */
const HANDOFF_END = CUE.handoff + 420;
const RUN_MS = HANDOFF_END + 130;

/** Reduced motion still needs a beat of brand, it just does not need a performance. */
const REDUCED_HOLD_MS = 520;
const REDUCED_FADE_MS = 120;

/**
 * Where the answer card sits on Convert: full width less the gutter, below the header
 * and the mode row. Fixed rather than measured, because everything above it is fixed
 * height chrome and the ground is cross fading with the real card by the time it
 * arrives. Being a few points out for one frame costs nothing; coupling the splash to
 * a screen's layout costs a lot.
 */
const HERO = { gutter: spacing.xl, topBelowInset: 147, height: 183 } as const;

/** Sam and the wordmark, as fractions of the phone. Authored on a 390x844 frame. */
const SAM_WIDTH_PCT = 258 / 390;
const SAM_CENTRE_PCT = 400 / 844;
const WORDMARK_TOP_PCT = 546 / 844;

export interface BootSplashProps {
  /** Called once the piece has finished and the overlay can be unmounted. */
  onDone: () => void;
}

export function BootSplash({ onDone }: BootSplashProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const reduced = useReducedMotion();
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  // The face is the one thing that cuts rather than eases, so it is state, not a
  // shared value: asleep, eyes open, one blink, then happy for the rest of the piece.
  const [emotion, setEmotion] = useState<SamEmotion>('sleepy');

  const clock = useSharedValue(0);
  const out = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      const timer = setTimeout(() => {
        out.value = withTiming(1, { duration: REDUCED_FADE_MS }, (finished) => {
          if (finished) {
            runOnJS(onDone)();
          }
        });
      }, REDUCED_HOLD_MS);
      return () => clearTimeout(timer);
    }

    clock.value = withTiming(RUN_MS, { duration: RUN_MS, easing: Easing.linear }, (finished) => {
      if (finished) {
        runOnJS(onDone)();
      }
    });

    const faces: [number, SamEmotion][] = [
      [CUE.wake, 'idle'],
      [545, 'sleepy'],
      [585, 'idle'],
      [CUE.wordmark - 250, 'happy'],
    ];
    const timers = faces.map(([at, face]) => setTimeout(() => setEmotion(face), at));
    return () => timers.forEach(clearTimeout);
  }, [reduced, clock, out, onDone]);

  const samWidth = screenW * SAM_WIDTH_PCT;
  const heroTop = insets.top + HERO.topBelowInset;
  const heroWidth = screenW - HERO.gutter * 2;
  const morphsIntoCard = settings.onboarded;

  // The ground. Full bleed at rest, the answer card by the end of the handoff, and
  // gone a breath later once the real card is underneath it.
  //
  // Only when Convert is what the app is opening onto. On a first run the app opens
  // onto onboarding, which is butter and has no answer card, so morphing into one
  // would drop a tomato rectangle onto a screen that has nowhere to put it. There the
  // ground simply leaves.
  const groundStyle = useAnimatedStyle(() => {
    if (reduced) {
      return { left: 0, top: 0, width: screenW, height: screenH, borderRadius: 0, opacity: 1 };
    }
    const clamp = { extrapolateLeft: Extrapolation.CLAMP, extrapolateRight: Extrapolation.CLAMP };
    if (!morphsIntoCard) {
      return {
        left: 0,
        top: 0,
        width: screenW,
        height: screenH,
        borderRadius: 0,
        opacity: interpolate(clock.value, [CUE.handoff, HANDOFF_END], [1, 0], clamp),
      };
    }
    const morph = [CUE.handoff, HANDOFF_END];
    return {
      left: interpolate(clock.value, morph, [0, HERO.gutter], clamp),
      top: interpolate(clock.value, morph, [0, heroTop], clamp),
      width: interpolate(clock.value, morph, [screenW, heroWidth], clamp),
      height: interpolate(clock.value, morph, [screenH, HERO.height], clamp),
      borderRadius: interpolate(clock.value, morph, [0, radius.hero], clamp),
      opacity: interpolate(clock.value, [HANDOFF_END, RUN_MS], [1, 0], clamp),
    };
  }, [reduced, morphsIntoCard, screenW, screenH, heroTop, heroWidth]);

  // Sam: squash, stretch, hop, settle. Then he shrinks and leaves with the ground.
  const samStyle = useAnimatedStyle(() => {
    if (reduced) {
      return { opacity: 1, transform: [] };
    }
    const clamp = { extrapolateLeft: Extrapolation.CLAMP, extrapolateRight: Extrapolation.CLAMP };
    const scaleY = interpolate(
      clock.value,
      [400, 520, 660, 780, 900, 1000],
      [1, 0.9, 1.14, 0.94, 1.03, 1],
      clamp
    );
    const scaleX = interpolate(
      clock.value,
      [400, 520, 660, 780, 900, 1000],
      [1, 1.08, 0.92, 1.06, 0.98, 1],
      clamp
    );
    const hop = interpolate(clock.value, [520, 660, 780, 870, 1000], [0, -26, 0, -5, 0], clamp);
    const tilt = interpolate(clock.value, [600, 680, 820, 1000], [0, -2.4, 1.6, 0], clamp);

    // The handoff lifts him out of the frame the card is arriving into.
    const leave = interpolate(clock.value, [CUE.handoff, CUE.handoff + 280], [1, 0.46], clamp);
    const lift = interpolate(clock.value, [CUE.handoff, CUE.handoff + 300], [0, -96], clamp);

    return {
      opacity: interpolate(clock.value, [CUE.handoff + 40, CUE.handoff + 220], [1, 0], clamp),
      transform: [
        { translateY: lift + hop },
        { scale: leave },
        { scaleX },
        { scaleY },
        { rotate: `${tilt}deg` },
      ],
    };
  }, [reduced]);

  const wordmarkStyle = useAnimatedStyle(() => {
    if (reduced) {
      return { opacity: 1, transform: [] };
    }
    const clamp = { extrapolateLeft: Extrapolation.CLAMP, extrapolateRight: Extrapolation.CLAMP };
    const rise = interpolate(clock.value, [CUE.wordmark + 20, CUE.wordmark + 260], [18, 0], clamp);
    const appear = interpolate(clock.value, [CUE.wordmark + 20, CUE.wordmark + 220], [0, 1], clamp);
    const leave = interpolate(clock.value, [CUE.handoff, CUE.handoff + 140], [0, 1], clamp);
    return { opacity: Math.min(appear, 1 - leave), transform: [{ translateY: rise }] };
  }, [reduced]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: 1 - out.value }), []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.ground, { backgroundColor: palette.primary }, groundStyle]} />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.sam,
          {
            width: samWidth,
            left: (screenW - samWidth) / 2,
            top: screenH * SAM_CENTRE_PCT - samWidth / 2,
          },
          samStyle,
        ]}
      >
        <Sam size={samWidth} emotion={emotion} crust={palette.samCrustPale} />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.wordmark, { top: screenH * WORDMARK_TOP_PCT }, wordmarkStyle]}
      >
        <Text style={[typography.display.xl, styles.centre, { color: palette.onPrimary }]}>
          {t('app.name')}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * The frame shown between the native launch screen and the first themed render,
 * while fonts resolve. Without it a cold start goes tomato, white, tomato.
 *
 * No provider has mounted yet, so it cannot read the app's theme setting — but it
 * does not need to. It reads the system scheme, which is exactly what the native
 * splash was configured against, so the two are the same colour and the seam
 * between them is invisible.
 */
export function BootGround() {
  const scheme = useColorScheme();
  const tomato = scheme === 'dark' ? palettes.dark.primary : palettes.light.primary;
  return <View style={[styles.prelude, { backgroundColor: tomato }]} />;
}

const styles = StyleSheet.create({
  overlay: { overflow: 'hidden' },
  ground: { position: 'absolute' },
  sam: { position: 'absolute', alignItems: 'center', transformOrigin: '50% 92%' },
  wordmark: { position: 'absolute', left: 0, right: 0 },
  centre: { textAlign: 'center' },
  prelude: { flex: 1 },
});

export default BootSplash;
