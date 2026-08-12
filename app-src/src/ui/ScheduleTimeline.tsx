// Proof ScheduleTimeline. A vertical rail of scheduled steps for a bake plan:
// a dot and connecting line, a start time, the step text, and a duration pill
// (or a checkpoint caption for zero length steps). Ends on a butter colored
// finish node. Pure presentational, no navigation.
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatClock, type ScheduleStep } from '@/lib/schedule';
import { radius, spacing, typography } from '@/theme';

export interface ScheduleTimelineProps {
  steps: ScheduleStep[];
  finishAt: number;
  currentIndex?: number | null;
  nextIndex?: number | null;
}

export function ScheduleTimeline({
  steps,
  finishAt,
  currentIndex = null,
  nextIndex = null,
}: ScheduleTimelineProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  const rowCount = steps.length + 1;

  return (
    <View>
      {steps.map((step, i) => {
        const isNext = nextIndex != null && i === nextIndex;
        const isCurrent = currentIndex != null && i === currentIndex;
        const emphasize = isNext || isCurrent;
        const isLast = i === rowCount - 1;

        return (
          <View
            key={i}
            style={[
              styles.row,
              emphasize && { backgroundColor: palette.proofTealWash, borderRadius: radius.md },
            ]}
          >
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  step.isCheckpoint
                    ? {
                        backgroundColor: palette.bgSurface,
                        borderWidth: 2,
                        borderColor: palette.border,
                      }
                    : { backgroundColor: palette.proofTeal },
                ]}
              />
              {!isLast ? <View style={[styles.line, { backgroundColor: palette.border }]} /> : null}
            </View>

            <Text
              style={[
                typography.numeric.sm,
                styles.time,
                { color: step.isCheckpoint ? palette.textFaint : palette.textInk },
              ]}
            >
              {formatClock(step.startAt)}
            </Text>

            <View style={styles.content}>
              <Text style={[typography.body.md, { color: palette.textInk }]}>{step.text}</Text>
              {step.isCheckpoint ? (
                <Text style={[typography.label, { color: palette.textFaint }]}>
                  {t('bakePlan.checkpoint')}
                </Text>
              ) : (
                <View style={[styles.pill, { backgroundColor: palette.proofTealWash }]}>
                  <Text style={[typography.label, { color: palette.proofTealText }]}>
                    {step.time}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}

      <View style={styles.row}>
        <View style={styles.rail}>
          <View style={[styles.dot, { backgroundColor: palette.accentButter }]} />
        </View>

        <Text style={[typography.numeric.sm, styles.time, { color: palette.textInk }]}>
          {formatClock(finishAt)}
        </Text>

        <View style={styles.content}>
          <Text style={[typography.title, { color: palette.textInk }]}>
            {t('bakePlan.ready_to_enjoy')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing['2xs'],
    gap: spacing.sm,
  },
  rail: {
    width: 12,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: spacing['2xs'],
  },
  time: {
    width: 68,
  },
  content: {
    flex: 1,
    gap: spacing['2xs'],
    alignItems: 'flex-start',
  },
  pill: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
});

export default ScheduleTimeline;
