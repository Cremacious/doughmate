// Proof TimerCard. A teal progress ring, the label and optional step, the time
// left, and controls that follow the timer's status: running (pause, cancel),
// paused (resume, cancel), done (dismiss only). The ring and time flip to the
// due color once a timer is done.
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { formatRemaining, isTimerDone, timerRemainingMs } from '@/lib/timer';
import type { Timer } from '@/state/timers';
import { radius, spacing, typography } from '@/theme';
import { ProgressRing } from './ProgressRing';

export interface TimerCardProps {
  timer: Timer;
  now: number;
  onPauseResume: () => void;
  onCancel: () => void;
}

export function TimerCard({ timer, now, onPauseResume, onCancel }: TimerCardProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  const remaining = timerRemainingMs(timer, now);
  const done = isTimerDone(timer, now);
  const progress = timer.durationMs > 0 ? 1 - remaining / timer.durationMs : 1;
  const timeColor = done ? palette.primary : palette.proofTeal;

  interface Dot {
    key: string;
    glyph: string;
    onPress: () => void;
    tone: 'quiet' | 'teal';
    accessibilityLabel?: string;
  }

  const dots: Dot[] = done
    ? [
        {
          key: 'dismiss',
          glyph: '✕',
          onPress: onCancel,
          tone: 'quiet',
          accessibilityLabel: t('timers.dismiss'),
        },
      ]
    : timer.status === 'running'
      ? [
          { key: 'pause', glyph: '⏸', onPress: onPauseResume, tone: 'teal' },
          { key: 'cancel', glyph: '✕', onPress: onCancel, tone: 'quiet' },
        ]
      : [
          { key: 'resume', glyph: '▶', onPress: onPauseResume, tone: 'teal' },
          { key: 'cancel', glyph: '✕', onPress: onCancel, tone: 'quiet' },
        ];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.bgSurface,
          borderColor: done ? palette.primary : palette.border,
        },
      ]}
    >
      <ProgressRing progress={done ? 1 : progress} due={done} />

      <View style={styles.body}>
        <Text style={[typography.title, { color: palette.textInk }]} numberOfLines={1}>
          {timer.label}
        </Text>
        {timer.stepLabel ? (
          <Text style={[typography.body.sm, { color: palette.textFaint }]} numberOfLines={1}>
            {timer.stepLabel}
          </Text>
        ) : null}
        <Text style={[typography.numeric.lg, { color: timeColor }]}>
          {done ? t('timers.done') : formatRemaining(remaining)}
        </Text>
      </View>

      <View style={styles.controls}>
        {dots.map((d) => (
          <Pressable
            key={d.key}
            accessibilityRole="button"
            accessibilityLabel={d.accessibilityLabel}
            onPress={() => {
              triggerHaptic('tap');
              d.onPress();
            }}
            style={[
              styles.dot,
              { backgroundColor: d.tone === 'teal' ? palette.proofTealWash : palette.bgSunken },
            ]}
          >
            <Text
              style={[
                typography.title,
                { color: d.tone === 'teal' ? palette.proofTealText : palette.textSoft },
              ]}
            >
              {d.glyph}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  body: { flex: 1, gap: spacing['2xs'], alignItems: 'flex-start' },
  controls: { flexDirection: 'row', gap: spacing.xs },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TimerCard;
