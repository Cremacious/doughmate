// Shared step timer control for the recipe detail and cook mode screens.
// Starting a timer confirms with a toast; while that step's timer is running,
// the control switches to a countdown that routes to Timers instead of
// silently starting a duplicate.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useNow } from '@/hooks/useNow';
import { formatRemaining, formatStepTime, isTimerDone, timerRemainingMs } from '@/lib/timer';
import { useTimers } from '@/state/timers';
import { spacing, typography } from '@/theme';
import { useToast } from '@/ui/Toast';

export interface StepTimerControlProps {
  recipeId: string;
  stepIndex: number;
  stepText: string;
  time: string;
  durationMs: number;
}

export function StepTimerControl({
  recipeId,
  stepIndex,
  stepText,
  time,
  durationMs,
}: StepTimerControlProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { timers, startTimer } = useTimers();
  const { show } = useToast();
  const now = useNow();

  const stepLabel = t('timers.step_n', { n: stepIndex + 1 });
  const timeLabel = formatStepTime(time);
  const running = timers.find((tm) => tm.recipeId === recipeId && tm.stepLabel === stepLabel);

  if (!running) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('timers.start_step_timer', { time: timeLabel })}
        onPress={() => {
          startTimer({
            label: stepText.trim().slice(0, 40),
            stepLabel,
            recipeId,
            durationMs,
          });
          show({
            message: t('timers.timer_started', { time: timeLabel }),
            variant: 'confirmation',
          });
        }}
        style={styles.startTimerBtn}
      >
        <Text style={[typography.label, { color: palette.proofTeal }]}>
          ▶ {t('timers.start_step_timer', { time: timeLabel })}
        </Text>
      </Pressable>
    );
  }

  const remaining = timerRemainingMs(running, now);
  const done = isTimerDone(running, now);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('timers.view_running_timer')}
      onPress={() => router.push('/timers')}
      style={styles.startTimerBtn}
    >
      <Text style={[typography.label, { color: done ? palette.primary : palette.proofTeal }]}>
        ◷{' '}
        {done ? t('timers.done') : t('timers.step_time_left', { time: formatRemaining(remaining) })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  startTimerBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing['2xs'],
  },
});

export default StepTimerControl;
