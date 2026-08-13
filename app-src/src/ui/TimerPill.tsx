// Floating active timers pill. Mounted at the root, so it floats above every
// screen whenever a timer is running or a bake plan is armed. The body shows the
// soonest to finish timer (plus a +N when there are more) and opens the Timers
// sheet; inline controls pause, resume, and stop that timer without leaving the
// screen. Hidden on the Timers and Plan a bake sheets, and in cook mode, where
// the timer is already shown in context.
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
  const { timers, pauseTimer, resumeTimer, cancelTimer } = useTimers();
  const { plan } = useBakePlan();
  const pathname = usePathname();

  if (pathname === '/timers' || pathname === '/bake-plan' || pathname.endsWith('/cook')) {
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
  const paused = primary.status === 'paused';
  const remaining = timerRemainingMs(primary, now);
  const progress = primary.durationMs > 0 ? 1 - remaining / primary.durationMs : 1;
  const timeColor = done ? palette.primary : palette.proofTealText;
  const timeText = done ? t('timers.done') : formatRemaining(remaining);
  const label = extra > 0 ? `${primary.label} +${extra}` : primary.label;

  const control = (glyph: string, onPress: () => void, a11y: string, danger?: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      style={[styles.ctrl, { backgroundColor: palette.bgSurface }]}
    >
      <Text style={[typography.title, { color: danger ? palette.danger : palette.proofTealText }]}>
        {glyph}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 90 }]}>
      <View style={[styles.pill, shadow.md, { backgroundColor: palette.proofTealWash }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} ${timeText}`}
          onPress={() => {
            triggerHaptic('tap');
            router.push('/timers');
          }}
          style={styles.tapArea}
        >
          <ProgressRing progress={done ? 1 : progress} due={done} size={28} />
          <View style={styles.body}>
            <Text style={[typography.title, { color: palette.textInk }]} numberOfLines={1}>
              {label}
            </Text>
            <Text style={[typography.numeric.sm, { color: timeColor }]}>{timeText}</Text>
          </View>
        </Pressable>
        {done ? (
          control('✕', () => cancelTimer(primary.id), t('timers.dismiss'), true)
        ) : (
          <>
            {control(
              paused ? '▶' : '❚❚',
              () => (paused ? resumeTimer(primary.id) : pauseTimer(primary.id)),
              t(paused ? 'timers.resume' : 'timers.pause')
            )}
            {control('✕', () => cancelTimer(primary.id), t('timers.cancel'), true)}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  tapArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  body: { flex: 1, gap: 1 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    marginHorizontal: 9,
  },
  ctrl: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TimerPill;
