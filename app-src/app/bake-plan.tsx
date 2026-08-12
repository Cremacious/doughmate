// Plan a bake sheet. Pick a ready by time, preview the backward schedule from
// buildSchedule, and arm step reminders. If a plan is already armed for this
// recipe, show its live timeline and a Cancel button instead of the picker.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useNow } from '@/hooks/useNow';
import { triggerHaptic } from '@/lib/haptics';
import { ensureNotificationPermission } from '@/lib/notifications';
import {
  buildSchedule,
  composeFinishAt,
  earliestFinish,
  formatClock,
  formatDayLabel,
  isFeasible,
  planProgress,
  totalActiveMs,
} from '@/lib/schedule';
import { formatRemaining } from '@/lib/timer';
import { type BakePlan, useBakePlan } from '@/state/bakePlan';
import { useRecipes } from '@/state/recipes';
import { radius, spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { ScheduleTimeline } from '@/ui/ScheduleTimeline';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { Stepper } from '@/ui/Stepper';

const DAY_KEYS = [0, 1, 2, 3];

export default function BakePlanSheet() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { recipeId } = useLocalSearchParams<{ recipeId?: string }>();
  const { getRecipe } = useRecipes();
  const { plan, armPlan, cancelPlan } = useBakePlan();
  const now = useNow(60_000);

  const recipe = recipeId ? getRecipe(recipeId) : undefined;

  // Default target: tomorrow, 8:00 AM.
  const [dayOffset, setDayOffset] = useState(1);
  const [hour12, setHour12] = useState(8);
  const [minute, setMinute] = useState(0);
  const [meridiem, setMeridiem] = useState<'AM' | 'PM'>('AM');

  const close = () => router.back();

  if (!recipe || recipe.steps.length === 0) {
    return (
      <BottomSheet
        size="tall"
        onClose={close}
        header={
          <Text style={[typography.display.md, styles.title, { color: palette.textInk }]}>
            {t('bakePlan.title')}
          </Text>
        }
      >
        <View style={styles.empty}>
          <Sam size={96} />
          <Text style={[typography.body.md, styles.center, { color: palette.textSoft }]}>
            {t('bakePlan.empty')}
          </Text>
        </View>
      </BottomSheet>
    );
  }

  // composeFinishAt zeroes seconds/ms (minute granular), so feasibility and
  // earliest math must compare against a minute floored `now` too — otherwise
  // a `finishAt` that lands exactly on `now`'s minute reads as already past
  // by up to 59s of live seconds.
  const nowMinute = Math.floor(now / 60_000) * 60_000;

  const finishAt = composeFinishAt(now, dayOffset, hour12, minute, meridiem);
  const armedForThisRecipe = plan != null && plan.recipeId === recipe.id;
  const feasible = isFeasible(recipe.steps, finishAt, nowMinute);
  const schedule = buildSchedule(recipe.steps, finishAt);
  const totalMs = totalActiveMs(recipe.steps);
  const earliest = earliestFinish(recipe.steps, nowMinute);

  const armThisPlan = async () => {
    await ensureNotificationPermission();
    armPlan({ recipeId: recipe.id, recipeName: recipe.name, steps: recipe.steps, finishAt });
    close();
  };

  // Decompose `earliest` back into picker parts. `earliest` is already minute
  // granular (built from nowMinute above), so when its minute lands on a 5
  // minute boundary the recomposed finishAt equals `earliest` exactly, and
  // isFeasible(finishAt, nowMinute) reduces to nowMinute >= nowMinute — true.
  // The picker only supports 5 minute increments, so a non multiple of 5
  // minute is rounded UP to the next 5 minute mark (never down): feasibility
  // requires finishAt - total >= nowMinute, and earliest === nowMinute + total
  // exactly, so rounding up guarantees the composed finishAt stays at or after
  // `earliest` and therefore feasible either way.
  const useEarliestTime = () => {
    const target = new Date(earliest);
    const startOfNow = new Date(now);
    startOfNow.setHours(0, 0, 0, 0);
    const startOfTarget = new Date(earliest);
    startOfTarget.setHours(0, 0, 0, 0);
    let offset = Math.round((startOfTarget.getTime() - startOfNow.getTime()) / 86_400_000);
    let hour24 = target.getHours();
    let nextMinute = target.getMinutes();
    const remainder = nextMinute % 5;
    if (remainder !== 0) {
      nextMinute = nextMinute - remainder + 5;
      if (nextMinute === 60) {
        nextMinute = 0;
        hour24 += 1;
        if (hour24 === 24) {
          hour24 = 0;
          offset += 1;
        }
      }
    }
    const nextMeridiem: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
    const nextHour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    setDayOffset(offset);
    setHour12(nextHour12);
    setMinute(nextMinute);
    setMeridiem(nextMeridiem);
  };

  return (
    <BottomSheet
      size="tall"
      onClose={close}
      header={
        <Text style={[typography.display.md, styles.title, { color: palette.textInk }]}>
          {t('bakePlan.title')}
        </Text>
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.heading, { color: palette.textInk }]}>{recipe.name}</Text>

        {plan && armedForThisRecipe ? (
          <ArmedSection plan={plan} now={now} palette={palette} t={t} onCancel={cancelPlan} />
        ) : (
          <>
            <View style={styles.section}>
              <Text style={[typography.label, { color: palette.textSoft }]}>
                {t('bakePlan.ready_by')}
              </Text>

              <View style={styles.dayChips}>
                {DAY_KEYS.map((k) => {
                  const dayStart = composeFinishAt(now, k, 12, 0, 'AM');
                  const selected = k === dayOffset;
                  return (
                    <Pressable
                      key={k}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        triggerHaptic('select');
                        setDayOffset(k);
                      }}
                      style={[
                        styles.dayChip,
                        {
                          backgroundColor: selected ? palette.proofTeal : palette.bgSurface,
                          borderColor: palette.border,
                          borderWidth: selected ? 0 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          typography.label,
                          { color: selected ? palette.onPrimary : palette.textSoft },
                        ]}
                      >
                        {formatDayLabel(dayStart, now)}
                      </Text>
                      <Text
                        style={[
                          typography.numeric.lg,
                          { color: selected ? palette.onPrimary : palette.textInk },
                        ]}
                      >
                        {new Date(dayStart).getDate()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.stepperRow}>
                <View style={styles.stepperCol}>
                  <Text style={[typography.label, { color: palette.textFaint }]}>
                    {t('bakePlan.hours')}
                  </Text>
                  <Stepper value={hour12} onChange={setHour12} min={1} max={12} wrap />
                </View>
                <View style={styles.stepperCol}>
                  <Text style={[typography.label, { color: palette.textFaint }]}>
                    {t('bakePlan.minutes')}
                  </Text>
                  <Stepper value={minute} onChange={setMinute} min={0} max={55} step={5} wrap />
                </View>
              </View>

              <SegmentedControl
                options={[
                  { id: 'AM' as const, label: t('bakePlan.am') },
                  { id: 'PM' as const, label: t('bakePlan.pm') },
                ]}
                value={meridiem}
                onChange={setMeridiem}
              />
            </View>

            {feasible ? (
              <View style={styles.section}>
                <Text style={[typography.label, { color: palette.textSoft }]}>
                  {t('bakePlan.your_schedule')}
                </Text>

                <View style={[styles.hero, { backgroundColor: palette.proofTealWash }]}>
                  <Text style={[typography.label, { color: palette.proofTealText }]}>
                    {t('bakePlan.start_baking')}
                  </Text>
                  <Text style={[typography.numeric.lg, { color: palette.proofTealText }]}>
                    {`${formatDayLabel(schedule.startAt, now)} ${formatClock(schedule.startAt)}`}
                  </Text>
                </View>

                <ScheduleTimeline steps={schedule.steps} finishAt={finishAt} />

                <Button label={t('bakePlan.arm')} onPress={() => void armThisPlan()} haptic="pop" />
                <Text style={[typography.body.sm, styles.center, { color: palette.textFaint }]}>
                  {t('bakePlan.arm_hint')}
                </Text>
              </View>
            ) : (
              <View
                style={[styles.section, styles.warning, { backgroundColor: palette.dangerWash }]}
              >
                <Text style={[typography.heading, { color: palette.danger }]}>
                  {t('bakePlan.not_enough_time')}
                </Text>
                <Text style={[typography.body.md, { color: palette.textInk }]}>
                  {t('bakePlan.not_enough_body', {
                    total: formatRemaining(totalMs),
                    target: formatClock(finishAt),
                    start: formatClock(finishAt - totalMs),
                  })}
                </Text>
                <Text style={[typography.body.md, { color: palette.textInk }]}>
                  {t('bakePlan.earliest', {
                    when: `${formatDayLabel(earliest, now)} ${formatClock(earliest)}`,
                  })}
                </Text>
                <Button
                  label={t('bakePlan.use_earliest')}
                  variant="secondary"
                  onPress={useEarliestTime}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

interface ArmedSectionProps {
  plan: BakePlan;
  now: number;
  palette: ReturnType<typeof useAppTheme>['palette'];
  t: ReturnType<typeof useTranslation>['t'];
  onCancel: () => void;
}

function ArmedSection({ plan, now, palette, t, onCancel }: ArmedSectionProps) {
  const progress = planProgress(plan.steps, plan.finishAt, now);
  const steps = plan.steps.map((s, index) => ({ ...s, index }));

  return (
    <View style={styles.section}>
      <Text style={[typography.label, { color: palette.textSoft }]}>
        {t('bakePlan.your_schedule')}
      </Text>
      <Text style={[typography.body.md, { color: palette.textSoft }]}>
        {t('bakePlan.ready_at', {
          when: `${formatDayLabel(plan.finishAt, now)} ${formatClock(plan.finishAt)}`,
        })}
      </Text>

      <ScheduleTimeline
        steps={steps}
        finishAt={plan.finishAt}
        currentIndex={progress.currentIndex}
        nextIndex={progress.nextIndex}
      />

      <Button label={t('bakePlan.cancel')} variant="destructive" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing['2xl'], paddingBottom: spacing['3xl'] },
  empty: { alignItems: 'center', gap: spacing['2xs'], paddingVertical: spacing.xl },
  center: { textAlign: 'center' },
  section: { gap: spacing.md },
  dayChips: { flexDirection: 'row', gap: spacing.sm },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xs'],
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    minHeight: 64,
  },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stepperCol: { alignItems: 'center', gap: spacing.sm },
  hero: { borderRadius: radius.lg, padding: spacing.md, gap: spacing['2xs'] },
  warning: { borderRadius: radius.lg, padding: spacing.md },
});
