// Fresh Bake TimerCard. The one running timer the screen promotes becomes a teal hero:
// where it came from, what it is, the time left at hero size, a butter bar, and the
// start and finish clock times as labelled numerals rather than caption text. Every
// other timer is a standard card.
//
// Controls follow status: running (pause, cancel), paused (resume, cancel), done
// (dismiss only). Everything flips to tomato once a timer is done.
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { formatClock } from '@/lib/schedule';
import { formatRemaining, isTimerDone, timerRemainingMs } from '@/lib/timer';
import { numeralLine, scaleType } from '@/lib/typeScale';
import type { Timer } from '@/state/timers';
import { radius, spacing, stroke, typography } from '@/theme';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';

export interface TimerCardProps {
  timer: Timer;
  now: number;
  /** The one timer the screen promotes. At most one per screen. */
  hero?: boolean;
  onPauseResume: () => void;
  onCancel: () => void;
}

/** Hero remaining time. Smaller than the convert hero, which owns a whole screen. */
const HERO_REMAINING = 56;

export function TimerCard({ timer, now, hero = false, onPauseResume, onCancel }: TimerCardProps) {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();

  const remaining = timerRemainingMs(timer, now);
  const done = isTimerDone(timer, now);
  const progress = timer.durationMs > 0 ? 1 - remaining / timer.durationMs : 1;

  const onTeal = hero && !done;
  const inkColor = onTeal ? palette.onTeal : palette.textInk;
  const softColor = onTeal ? palette.onTealSoft : palette.textFaint;
  const timeColor = done ? palette.primary : onTeal ? palette.onTeal : palette.proofTeal;

  interface Dot {
    key: string;
    glyph: string;
    onPress: () => void;
    tone: 'quiet' | 'teal';
    accessibilityLabel: string;
  }

  const cancelDot: Dot = {
    key: 'cancel',
    glyph: '✕',
    onPress: onCancel,
    tone: 'quiet',
    accessibilityLabel: done ? t('timers.dismiss') : t('timers.cancel'),
  };

  const dots: Dot[] = done
    ? [cancelDot]
    : [
        timer.status === 'running'
          ? {
              key: 'pause',
              glyph: '⏸',
              onPress: onPauseResume,
              tone: 'teal',
              accessibilityLabel: t('timers.pause'),
            }
          : {
              key: 'resume',
              glyph: '▶',
              onPress: onPauseResume,
              tone: 'teal',
              accessibilityLabel: t('timers.resume'),
            },
        cancelDot,
      ];

  const controls = (
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
            {
              backgroundColor: onTeal
                ? palette.bgSurface
                : d.tone === 'teal'
                  ? palette.proofTealWash
                  : palette.bgSunken,
            },
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
  );

  // A paused timer has no end time, so it has no clock pair to show either.
  const endsAt = timer.endsAt;
  const startedAt = endsAt === undefined ? undefined : endsAt - timer.durationMs;

  if (!hero) {
    return (
      <Card style={styles.compact}>
        <View style={styles.body}>
          <Text style={[typography.title, { color: inkColor }]} numberOfLines={1}>
            {timer.label}
          </Text>
          {timer.stepLabel ? (
            <Text style={[typography.body.sm, { color: softColor }]} numberOfLines={1}>
              {timer.stepLabel}
            </Text>
          ) : null}
          <Text
            style={[
              typography.numeric.lg,
              scaleType(typography.numeric.lg, fontScale),
              { color: timeColor },
            ]}
          >
            {done ? t('timers.done') : formatRemaining(remaining)}
          </Text>
          <ProgressBar progress={done ? 1 : progress} />
        </View>
        {controls}
      </Card>
    );
  }

  return (
    <Card tier="hero" heroColor={done ? palette.primary : palette.proofTeal}>
      <View style={styles.heroHead}>
        <View style={styles.body}>
          {timer.stepLabel ? (
            <Text
              style={[
                typography.label,
                scaleType(typography.label, fontScale),
                { color: softColor },
              ]}
              numberOfLines={1}
            >
              {timer.stepLabel}
            </Text>
          ) : null}
          <Text
            style={[
              typography.subheading,
              scaleType(typography.subheading, fontScale),
              { color: inkColor },
            ]}
            numberOfLines={1}
          >
            {timer.label}
          </Text>
        </View>
        {controls}
      </View>

      <View style={styles.remainingRow}>
        <Text
          style={[
            typography.numeric.hero,
            numeralLine(HERO_REMAINING * fontScale),
            { color: timeColor },
          ]}
        >
          {done ? t('timers.done') : formatRemaining(remaining)}
        </Text>
        {!done ? (
          <Text
            style={[
              typography.subheading,
              scaleType(typography.subheading, fontScale),
              { color: softColor },
            ]}
          >
            {t('timers.left')}
          </Text>
        ) : null}
      </View>

      <ProgressBar progress={done ? 1 : progress} onHero height={10} />

      {/* Labelled numerals, not a caption: both times are things you read off. */}
      {endsAt !== undefined && startedAt !== undefined ? (
        <View style={styles.clockRow}>
          {[
            { label: t('timers.started'), value: formatClock(startedAt) },
            { label: t('timers.done_at'), value: formatClock(endsAt) },
          ].map((pair) => (
            <View key={pair.label} style={styles.clockPair}>
              <Text
                style={[
                  typography.labelSm,
                  scaleType(typography.labelSm, fontScale),
                  { color: softColor },
                ]}
              >
                {pair.label}
              </Text>
              <Text
                style={[
                  typography.numeric.sm,
                  scaleType(typography.numeric.sm, fontScale),
                  { color: inkColor },
                ]}
              >
                {pair.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  compact: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  body: { flex: 1, gap: spacing['2xs'], alignItems: 'flex-start' },
  heroHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  remainingRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  clockRow: { flexDirection: 'row', gap: spacing['2xl'], marginTop: spacing['2xs'] },
  clockPair: { gap: 1 },
  controls: { flexDirection: 'row', gap: spacing.xs },
  dot: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: stroke.soft,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TimerCard;
