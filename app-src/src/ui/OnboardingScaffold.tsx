// Fresh Bake onboarding scaffold. Full bleed butter, no card and no chrome: these
// screens are one idea each, and a card around a single idea is just a smaller screen.
// A hero slot, headline and body, optional middle content, progress dots, and a
// primary plus a quiet exit.
//
// The step change happens here rather than in the stack. Each block enters 40ms after
// the one above it, so the screen assembles top down instead of arriving in one piece.
// The hero is the only element allowed to be theatrical: it scales up from 0.88 with
// a light overshoot. Everything else is a fade and a short rise.
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { triggerHaptic } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { easing, radius, shadow, spacing, spring, transition, typography } from '@/theme';

const PRIMARY_HEIGHT = 58;
const DOT = 9;
const DOT_ACTIVE = 26;

/** How far the text and footer rise into place. The hero scales instead. */
const TEXT_RISE = 18;
const FOOTER_RISE = 22;

export interface OnboardingScaffoldProps {
  step: number;
  total: number;
  hero: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  /** Optional quiet exit; omitted on the final step. */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/**
 * The dot morphs rather than swapping. Each step is its own route, so the footer
 * remounts and there is nothing to animate from — the dot therefore starts at the
 * width it held on the step before and springs to the width it holds now, which is
 * the same picture the user would have seen had the footer persisted.
 */
function ProgressDot({ active, wasActive }: { active: boolean; wasActive: boolean }) {
  const { palette } = useAppTheme();
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? (active ? 1 : 0) : wasActive ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      p.value = active ? 1 : 0;
      return;
    }
    p.value = withSpring(active ? 1 : 0, spring.quick);
  }, [active, reduced, p]);

  const style = useAnimatedStyle(() => ({
    width: interpolate(p.value, [0, 1], [DOT, DOT_ACTIVE]),
    backgroundColor: interpolateColor(p.value, [0, 1], [palette.heroDim, palette.primary]),
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function OnboardingScaffold({
  step,
  total,
  hero,
  title,
  body,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: OnboardingScaffoldProps) {
  const { palette, fontScale } = useAppTheme();
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);

  // Steps run forward, so the dot that was wide is the one before this one.
  const previousIndex = step - 2;

  const heroIn = useSharedValue(reduced ? 1 : 0);
  const textIn = useSharedValue(reduced ? 1 : 0);
  const footerIn = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    const fade = { duration: transition.reducedMs };
    const rise = {
      duration: transition.stepInMs,
      easing: Easing.bezier(...easing.standard),
    };

    if (reduced) {
      heroIn.value = withTiming(1, fade);
      textIn.value = withTiming(1, fade);
      footerIn.value = withTiming(1, fade);
      return;
    }

    heroIn.value = withSpring(1, spring.quick);
    textIn.value = withDelay(transition.stepStaggerMs, withTiming(1, rise));
    footerIn.value = withDelay(transition.stepStaggerMs * 2, withTiming(1, rise));
  }, [reduced, heroIn, textIn, footerIn]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: Math.min(heroIn.value, 1),
    transform: reduced ? [] : [{ scale: interpolate(heroIn.value, [0, 1], [0.88, 1]) }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textIn.value,
    transform: reduced ? [] : [{ translateY: interpolate(textIn.value, [0, 1], [TEXT_RISE, 0]) }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerIn.value,
    transform: reduced
      ? []
      : [{ translateY: interpolate(footerIn.value, [0, 1], [FOOTER_RISE, 0]) }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.accentButter }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.hero, heroStyle]}>{hero}</Animated.View>
        <Animated.View style={[styles.textGroup, textStyle]}>
          <Text
            style={[
              typography.display.xl,
              scaleType(typography.display.xl, fontScale),
              styles.center,
              { color: palette.onButter },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              typography.body.lg,
              scaleType(typography.body.lg, fontScale),
              styles.center,
              { color: palette.onButterBody },
            ]}
          >
            {body}
          </Text>
        </Animated.View>
        {children ? (
          <Animated.View style={[styles.middle, textStyle]}>{children}</Animated.View>
        ) : null}
      </View>

      <Animated.View style={[styles.footer, footerStyle]}>
        <View style={styles.dots}>
          {Array.from({ length: total }).map((_, i) => (
            <ProgressDot key={i} active={i === step - 1} wasActive={i === previousIndex} />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          onPress={() => {
            triggerHaptic('pop');
            onPrimary();
          }}
          style={[
            styles.primary,
            shadow.md,
            { backgroundColor: palette.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text
            style={[
              typography.button,
              scaleType(typography.button, fontScale),
              { color: palette.accentButter },
            ]}
          >
            {primaryLabel}
          </Text>
        </Pressable>

        {secondaryLabel && onSecondary ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              triggerHaptic('tap');
              onSecondary();
            }}
            style={styles.skip}
          >
            <Text
              style={[
                typography.button,
                scaleType(typography.button, fontScale),
                { color: palette.onButterSoft },
              ]}
            >
              {secondaryLabel}
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  hero: { marginBottom: spacing['2xl'] },
  textGroup: { gap: spacing.sm, alignItems: 'center', maxWidth: 340 },
  center: { textAlign: 'center' },
  middle: { alignItems: 'center', marginTop: spacing['2xl'] },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignSelf: 'center',
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  dot: { height: DOT, borderRadius: radius.pill },
  primary: {
    height: PRIMARY_HEIGHT,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: { height: 48, alignItems: 'center', justifyContent: 'center' },
});

export default OnboardingScaffold;
