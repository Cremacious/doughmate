// Shared step timer control for the recipe detail and cook mode screens.
// Starting a timer confirms with a toast; while that step's timer is running,
// the control switches to a countdown that routes to Timers instead of silently
// starting a duplicate. `size="large"` renders a full width filled button for
// cook mode; the default compact size is a quiet text control for the recipe
// detail step list.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useNow } from '@/hooks/useNow';
import { formatRemaining, formatStepTime, isTimerDone, timerRemainingMs } from '@/lib/timer';
import { useTimers } from '@/state/timers';
import { radius, spacing, typography } from '@/theme';
import { useToast } from '@/ui/Toast';

export interface StepTimerControlProps {
  recipeId: string;
  stepIndex: number;
  stepText: string;
  time: string;
  durationMs: number;
  size?: 'compact' | 'large';
}

export function StepTimerControl({
  recipeId,
  stepIndex,
  stepText,
  time,
  durationMs,
  size = 'compact',
}: StepTimerControlProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { timers, startTimer } = useTimers();
  const { show } = useToast();
  const now = useNow();

  const large = size === 'large';
  const stepLabel = t('timers.step_n', { n: stepIndex + 1 });
  const timeLabel = formatStepTime(time);
  const running = timers.find((tm) => tm.recipeId === recipeId && tm.stepLabel === stepLabel);

  if (!running) {
    const label = `▶ ${t('timers.start_step_timer', { time: timeLabel })}`;
    const onPress = () => {
      startTimer({ label: stepText.trim().slice(0, 40), stepLabel, recipeId, durationMs });
      show({ message: t('timers.timer_started', { time: timeLabel }), variant: 'confirmation' });
    };
    return large ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('timers.start_step_timer', { time: timeLabel })}
        onPress={onPress}
        style={[styles.largeBtn, { backgroundColor: palette.proofTeal }]}
      >
        <Text style={[typography.title, { color: palette.bgSurface }]}>{label}</Text>
      </Pressable>
    ) : (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('timers.start_step_timer', { time: timeLabel })}
        onPress={onPress}
        style={styles.compactBtn}
      >
        <Text style={[typography.label, { color: palette.proofTeal }]}>{label}</Text>
      </Pressable>
    );
  }

  const remaining = timerRemainingMs(running, now);
  const done = isTimerDone(running, now);
  const label = `◷ ${done ? t('timers.done') : t('timers.step_time_left', { time: formatRemaining(remaining) })}`;

  return large ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('timers.view_running_timer')}
      onPress={() => router.push('/timers')}
      style={[styles.largeBtn, { backgroundColor: palette.proofTealWash }]}
    >
      <Text style={[typography.title, { color: done ? palette.primary : palette.proofTealText }]}>
        {label}
      </Text>
    </Pressable>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('timers.view_running_timer')}
      onPress={() => router.push('/timers')}
      style={styles.compactBtn}
    >
      <Text style={[typography.label, { color: done ? palette.primary : palette.proofTeal }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compactBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing['2xs'],
  },
  largeBtn: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
});

export default StepTimerControl;
