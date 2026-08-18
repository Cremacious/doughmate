// Fresh Bake ScheduleTimeline. A vertical rail of scheduled steps for a bake plan:
// a 14 dot and a 2.5px connector, a start time, the step text, and a duration pill
// (or a checkpoint caption for zero length steps). Ends on a butter finish node.
//
// The next step's row bleeds its teal wash 6px past the card padding, so the row you
// care about reads as part of the rail rather than as another pill. Pure
// presentational, no navigation.
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatClock, type ScheduleStep } from '@/lib/schedule';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, stroke, typography } from '@/theme';

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
  const { palette, fontScale } = useAppTheme();

  return (
    <View>
      {steps.map((step, i) => {
        const isNext = nextIndex != null && i === nextIndex;
        const isCurrent = currentIndex != null && i === currentIndex;
        const emphasize = isNext || isCurrent;

        return (
          <View
            key={i}
            style={[
              styles.row,
              emphasize && [styles.emphasized, { backgroundColor: palette.proofTealWash }],
            ]}
          >
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  step.isCheckpoint
                    ? {
                        backgroundColor: palette.bgSurface,
                        borderWidth: stroke.ink,
                        borderColor: palette.proofTeal,
                      }
                    : { backgroundColor: palette.proofTeal },
                ]}
              />
              <View style={[styles.line, { backgroundColor: palette.border }]} />
            </View>

            <Text
              style={[
                typography.numeric.sm,
                scaleType(typography.numeric.sm, fontScale),
                styles.time,
                { color: step.isCheckpoint ? palette.textFaint : palette.textInk },
              ]}
            >
              {formatClock(step.startAt)}
            </Text>

            <View style={styles.content}>
              <Text
                style={[
                  typography.body.md,
                  scaleType(typography.body.md, fontScale),
                  { color: palette.textInk },
                ]}
              >
                {step.text}
              </Text>
              {step.isCheckpoint ? (
                <Text
                  style={[
                    typography.labelSm,
                    scaleType(typography.labelSm, fontScale),
                    { color: palette.textFaint },
                  ]}
                >
                  {t('bakePlan.checkpoint')}
                </Text>
              ) : (
                <View style={[styles.pill, { backgroundColor: palette.proofTealWash }]}>
                  <Text
                    style={[
                      typography.labelSm,
                      scaleType(typography.labelSm, fontScale),
                      { color: palette.proofTealText },
                    ]}
                  >
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

        <Text
          style={[
            typography.numeric.sm,
            scaleType(typography.numeric.sm, fontScale),
            styles.time,
            { color: palette.textInk },
          ]}
        >
          {formatClock(finishAt)}
        </Text>

        <View style={styles.content}>
          <Text
            style={[
              typography.subheading,
              scaleType(typography.subheading, fontScale),
              { color: palette.textInk },
            ]}
          >
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
  // Bleeds past the card's spacing.lg padding so the next step owns the full width.
  emphasized: {
    borderRadius: radius.md,
    marginHorizontal: -6,
    paddingHorizontal: 6 + spacing['2xs'],
  },
  rail: {
    width: 14,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
  },
  line: {
    width: 2.5,
    flex: 1,
    marginTop: spacing['2xs'],
  },
  time: {
    width: 62,
  },
  content: {
    flex: 1,
    gap: spacing['2xs'],
    alignItems: 'flex-start',
  },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
});

export default ScheduleTimeline;
