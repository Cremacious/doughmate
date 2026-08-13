// Floating active timers pill. Mounted at the root, so it floats above every
// screen (tabs and full screen sheets alike) whenever a timer is running or a
// bake plan is armed, showing the soonest to finish timer and a +N count for
// the rest. Tapping it opens the Timers sheet. Hidden on the Timers and Plan a
// bake sheets, where it would be redundant and could overlap their actions.
import { router, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useNow } from '@/hooks/useNow';
import { triggerHaptic } from '@/lib/haptics';
import { formatClock, planProgress } from '@/lib/schedule';
import { formatRemaining, isTimerDone, timerRemainingMs } from '@/lib/timer';
import { useBakePlan } from '@/state/bakePlan';
import { useTimers } from '@/state/timers';
import { radius, shadow, spacing, typography } from '@/theme';
import { ProgressRing } from './ProgressRing';

export function TimerPill() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { timers } = useTimers();
  const { plan } = useBakePlan();
  const pathname = usePathname();

  if (pathname === '/timers' || pathname === '/bake-plan') {
    return null;
  }

  if (timers.length === 0) {
    const progress = plan ? planProgress(plan.steps, plan.finishAt, now) : null;
    if (!plan || !progress || progress.done) {
      return null;
    }

    const nextStep =
      progress.nextIndex != null
        ? plan.steps[progress.nextIndex]
        : progress.currentIndex != null
          ? plan.steps[progress.currentIndex]
          : plan.steps[0];

    if (!nextStep) {
      return null;
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('bakePlan.pill_next', { step: nextStep.text })} ${t('bakePlan.pill_starts', { when: formatClock(nextStep.startAt) })}`}
        onPress={() => {
          triggerHaptic('tap');
          router.push('/timers');
        }}
        style={[styles.wrap, { bottom: insets.bottom + 90 }]}
      >
        <View style={[styles.pill, shadow.md, { backgroundColor: palette.proofTealWash }]}>
          <View style={[styles.dot, { backgroundColor: palette.proofTeal }]} />
          <View style={styles.body}>
            <Text style={[typography.title, { color: palette.textInk }]} numberOfLines={1}>
              {t('bakePlan.pill_next', { step: nextStep.text })}
            </Text>
            <Text style={[typography.numeric.sm, { color: palette.proofTealText }]}>
              {t('bakePlan.pill_starts', { when: formatClock(nextStep.startAt) })}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  const primary = timers[0]!;
  const extra = timers.length - 1;
  const done = isTimerDone(primary, now);
  const remaining = timerRemainingMs(primary, now);
  const progress = primary.durationMs > 0 ? 1 - remaining / primary.durationMs : 1;
  const timeColor = done ? palette.primary : palette.proofTealText;
  const timeText = done ? t('timers.done') : formatRemaining(remaining);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${primary.label} ${timeText}`}
      onPress={() => {
        triggerHaptic('tap');
        router.push('/timers');
      }}
      style={[styles.wrap, { bottom: insets.bottom + 90 }]}
    >
      <View style={[styles.pill, shadow.md, { backgroundColor: palette.proofTealWash }]}>
        <ProgressRing progress={done ? 1 : progress} due={done} size={28} />
        <View style={styles.body}>
          <Text style={[typography.title, { color: palette.textInk }]} numberOfLines={1}>
            {primary.label}
          </Text>
          <Text style={[typography.numeric.sm, { color: timeColor }]}>{timeText}</Text>
        </View>
        {extra > 0 ? (
          <View style={[styles.badge, { backgroundColor: palette.proofTeal }]}>
            <Text style={[typography.label, styles.badgeText, { color: palette.bgSurface }]}>
              +{extra}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  body: { flex: 1, gap: 1 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    marginHorizontal: 9,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xs'],
  },
  badgeText: { letterSpacing: 0 },
});

export default TimerPill;
