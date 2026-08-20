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
import { atLimit, FREE_TIMER_LIMIT } from '@/lib/limits';
import {
  activeTimerCount,
  formatRemaining,
  formatStepTime,
  isTimerDone,
  timerRemainingMs,
} from '@/lib/timer';
import { usePro } from '@/state/pro';
import { useTimers } from '@/state/timers';
import { Icon } from '@/ui/Icon';
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
  const { palette, fontScale } = useAppTheme();
  const { timers, startTimer } = useTimers();
  const { isPro } = usePro();
  const { show } = useToast();
  const now = useNow();

  const large = size === 'large';
  // Matches HEIGHTS.lg in src/ui/Button.tsx, so this control and the primary
  // button beneath it in cook mode sit at the same height.
  const largeHeight = fontScale > 1 ? 72 : 60;
  const stepLabel = t('timers.step_n', { n: stepIndex + 1 });
  const timeLabel = formatStepTime(time);
  const running = timers.find((tm) => tm.recipeId === recipeId && tm.stepLabel === stepLabel);

  if (!running) {
    const startLabel = t('timers.start_step_timer', { time: timeLabel });
    const onPress = () => {
      // Free bakers run one timer at a time. Overlapping stages are the Pro upgrade.
      if (atLimit(activeTimerCount(timers, now), FREE_TIMER_LIMIT, isPro)) {
        router.push('/paywall');
        return;
      }
      startTimer({ label: stepText.trim().slice(0, 40), stepLabel, recipeId, durationMs });
      show({ message: t('timers.timer_started', { time: timeLabel }), variant: 'confirmation' });
    };
    return large ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={startLabel}
        onPress={onPress}
        style={[styles.largeBtn, { height: largeHeight, backgroundColor: palette.proofTeal }]}
      >
        <Icon name="timer" size={22} color={palette.onTeal} />
        <Text style={[typography.title, { color: palette.onTeal }]}>{startLabel}</Text>
      </Pressable>
    ) : (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={startLabel}
        onPress={onPress}
        style={styles.compactBtn}
      >
        <Text style={[typography.label, { color: palette.proofTeal }]}>{`▶ ${startLabel}`}</Text>
      </Pressable>
    );
  }

  const remaining = timerRemainingMs(running, now);
  const done = isTimerDone(running, now);
  const runningLabel = done
    ? t('timers.done')
    : t('timers.step_time_left', { time: formatRemaining(remaining) });
  const runningColor = done ? palette.primary : palette.proofTealText;

  return large ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('timers.view_running_timer')}
      onPress={() => router.push('/timers')}
      style={[styles.largeBtn, { height: largeHeight, backgroundColor: palette.proofTealWash }]}
    >
      <Icon name="timer" size={22} color={runningColor} />
      <Text style={[typography.title, { color: runningColor }]}>{runningLabel}</Text>
    </Pressable>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('timers.view_running_timer')}
      onPress={() => router.push('/timers')}
      style={styles.compactBtn}
    >
      <Text style={[typography.label, { color: done ? palette.primary : palette.proofTeal }]}>
        {`◷ ${runningLabel}`}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
  },
});

export default StepTimerControl;
