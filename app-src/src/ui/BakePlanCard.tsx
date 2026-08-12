// Proof BakePlanCard. The armed bake plan: recipe name, when it will be ready,
// a quiet cancel control, and a Next up chip that stays current on a minute
// tick. Tapping the card body opens the full schedule; Cancel does not.
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useNow } from '@/hooks/useNow';
import { triggerHaptic } from '@/lib/haptics';
import { formatClock, formatDayLabel, planProgress } from '@/lib/schedule';
import type { BakePlan } from '@/state/bakePlan';
import { radius, spacing, typography } from '@/theme';

export interface BakePlanCardProps {
  plan: BakePlan;
  onCancel: () => void;
  onPress: () => void;
}

export function BakePlanCard({ plan, onCancel, onPress }: BakePlanCardProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const now = useNow(60_000);

  const progress = planProgress(plan.steps, plan.finishAt, now);
  const nextStep =
    progress.nextIndex != null
      ? plan.steps[progress.nextIndex]
      : progress.currentIndex != null
        ? plan.steps[progress.currentIndex]
        : plan.steps[0];

  const readyWhen = `${formatDayLabel(plan.finishAt, now)} ${formatClock(plan.finishAt)}`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: palette.bgSurface,
          borderColor: palette.proofTeal,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[typography.title, { color: palette.textInk }]} numberOfLines={1}>
            {plan.recipeName}
          </Text>
          <Text style={[typography.body.sm, { color: palette.textFaint }]}>
            {t('bakePlan.ready_at', { when: readyWhen })}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('bakePlan.cancel')}
          hitSlop={spacing.xs}
          onPress={() => {
            triggerHaptic('tap');
            onCancel();
          }}
          style={styles.cancel}
        >
          <Text style={[typography.label, { color: palette.danger }]}>{t('bakePlan.cancel')}</Text>
        </Pressable>
      </View>

      {progress.done ? (
        <Text style={[typography.body.md, { color: palette.proofTealText }]}>
          {t('bakePlan.done')}
        </Text>
      ) : nextStep ? (
        <View style={[styles.chip, { backgroundColor: palette.proofTealWash }]}>
          <Text style={[typography.label, { color: palette.proofTealText }]}>
            {t('bakePlan.next_up')}
          </Text>
          <Text
            style={[typography.body.sm, styles.chipText, { color: palette.textInk }]}
            numberOfLines={1}
          >
            {nextStep.text}
          </Text>
          <Text style={[typography.numeric.sm, { color: palette.textFaint }]}>
            {formatClock(nextStep.startAt)}
          </Text>
        </View>
      ) : null}

      {plan.steps.length > 0 ? (
        <Text style={[typography.body.sm, { color: palette.textFaint }]} numberOfLines={1}>
          {plan.steps.map((s) => s.text).join(' · ')}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerText: { flex: 1, gap: spacing['2xs'] },
  cancel: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing['2xs'],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  chipText: { flexShrink: 1 },
});

export default BakePlanCard;
