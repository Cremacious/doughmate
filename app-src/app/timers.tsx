// Timers sheet. Lists every live fermentation timer with a live countdown, plus
// a custom timer builder: big Hours and Minutes steppers, quick pick chips, a
// live preview, and Start.
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useNow } from '@/hooks/useNow';
import { triggerHaptic } from '@/lib/haptics';
import { atLimit, FREE_TIMER_LIMIT } from '@/lib/limits';
import { activeTimerCount, formatRemaining } from '@/lib/timer';
import { scaleType } from '@/lib/typeScale';
import { useBakePlan } from '@/state/bakePlan';
import { usePro } from '@/state/pro';
import { useTimers } from '@/state/timers';
import { radius, spacing, stroke, typography } from '@/theme';
import { BakePlanCard } from '@/ui/BakePlanCard';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { Stepper } from '@/ui/Stepper';
import { TimerCard } from '@/ui/TimerCard';

const QUICK_PICKS = [
  { label: '15m', hours: 0, minutes: 15 },
  { label: '30m', hours: 0, minutes: 30 },
  { label: '1h', hours: 1, minutes: 0 },
  { label: '4h', hours: 4, minutes: 0 },
];

export default function TimersSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const now = useNow();
  const { timers, startTimer, pauseTimer, resumeTimer, cancelTimer } = useTimers();
  const { plan, cancelPlan } = useBakePlan();
  const { isPro } = usePro();

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [label, setLabel] = useState('');
  // Which tile the stepper is editing. The active one is ink filled.
  const [unit, setUnit] = useState<'hours' | 'minutes'>('hours');

  const durationMs = (hours * 3600 + minutes * 60) * 1000;

  const start = () => {
    // Free bakers run one timer at a time. A second one is the Pro upgrade, so the
    // paywall replaces the start rather than the timer failing silently.
    if (atLimit(activeTimerCount(timers, now), FREE_TIMER_LIMIT, isPro)) {
      router.push('/paywall');
      return;
    }
    startTimer({ label: label.trim() || t('timers.title'), durationMs });
    setHours(0);
    setMinutes(0);
    setLabel('');
  };

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <View style={styles.headerBlock}>
          <Text
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              { color: timers.length > 0 ? palette.proofTealText : palette.textFaint },
            ]}
          >
            {timers.length > 0
              ? t('timers.eyebrow_running', { count: timers.length })
              : t('timers.eyebrow_none')}
          </Text>
          <Text
            style={[
              typography.display.md,
              scaleType(typography.display.md, fontScale),
              { color: palette.textInk },
            ]}
          >
            {t('timers.title')}
          </Text>
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {plan ? (
          <View style={styles.section}>
            <Text style={[typography.label, { color: palette.textSoft }]}>
              {t('bakePlan.section')}
            </Text>
            <BakePlanCard
              plan={plan}
              onCancel={cancelPlan}
              onPress={() => router.push(`/bake-plan?recipeId=${plan.recipeId}`)}
            />
          </View>
        ) : null}

        {timers.length === 0 ? (
          <View style={styles.empty}>
            <Sam size={96} />
            <Text style={[typography.heading, styles.center, { color: palette.textInk }]}>
              {t('timers.empty_title')}
            </Text>
            <Text style={[typography.body.md, styles.center, { color: palette.textSoft }]}>
              {t('timers.empty_body')}
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[typography.label, { color: palette.textSoft }]}>
              {t('timers.running')}
            </Text>
            <View style={styles.list}>
              {timers.map((timer, i) => (
                <TimerCard
                  key={timer.id}
                  timer={timer}
                  now={now}
                  hero={i === 0}
                  onPauseResume={() =>
                    timer.status === 'running' ? pauseTimer(timer.id) : resumeTimer(timer.id)
                  }
                  onCancel={() => cancelTimer(timer.id)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.ruledLabel}>
          <View style={[styles.rule, { backgroundColor: palette.divider }]} />
          <Text
            style={[
              typography.labelSm,
              scaleType(typography.labelSm, fontScale),
              { color: palette.textFaint },
            ]}
          >
            {t('timers.custom')}
          </Text>
          <View style={[styles.rule, { backgroundColor: palette.divider }]} />
        </View>

        <Card>
          <Input
            label={t('timers.label_optional')}
            value={label}
            onChangeText={setLabel}
            placeholder={t('timers.label_placeholder')}
          />

          <Text
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              { color: palette.textFaint },
            ]}
          >
            {t('timers.how_long')}
          </Text>

          <View style={styles.tileRow}>
            {[
              { id: 'hours' as const, value: hours, label: t('timers.hours') },
              { id: 'minutes' as const, value: minutes, label: t('timers.minutes') },
            ].map((tile) => {
              const active = unit === tile.id;
              return (
                <Pressable
                  key={tile.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    triggerHaptic('select');
                    setUnit(tile.id);
                  }}
                  style={[
                    styles.tile,
                    {
                      backgroundColor: active ? palette.primary : palette.bgCanvas,
                      borderColor: active ? palette.primary : palette.borderField,
                      borderWidth: active ? 0 : stroke.soft,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.numeric.lg,
                      scaleType(typography.numeric.lg, fontScale),
                      { color: active ? palette.accentButter : palette.textInk },
                    ]}
                  >
                    {tile.value}
                  </Text>
                  <Text
                    style={[
                      typography.labelSm,
                      scaleType(typography.labelSm, fontScale),
                      { color: active ? palette.accentButter : palette.textFaint },
                    ]}
                  >
                    {tile.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* One stepper, driving whichever tile is active. */}
          <Stepper
            value={unit === 'hours' ? hours : minutes}
            onChange={unit === 'hours' ? setHours : setMinutes}
            min={0}
            step={unit === 'hours' ? 1 : 5}
            spread
            decrementLabel={unit === 'hours' ? t('timers.hours') : t('timers.minutes')}
            incrementLabel={unit === 'hours' ? t('timers.hours') : t('timers.minutes')}
          />

          <View style={styles.chips}>
            {QUICK_PICKS.map((pick) => (
              <Chip
                key={pick.label}
                label={pick.label}
                numeric
                selected={hours === pick.hours && minutes === pick.minutes}
                onPress={() => {
                  setHours(pick.hours);
                  setMinutes(pick.minutes);
                }}
              />
            ))}
          </View>

          <Text
            style={[
              typography.numeric.md,
              scaleType(typography.numeric.md, fontScale),
              styles.preview,
              { color: palette.textSoft },
            ]}
          >
            {formatRemaining(durationMs)}
          </Text>

          <Button
            label={t('timers.start')}
            onPress={start}
            disabled={hours === 0 && minutes === 0}
            haptic="pop"
          />
        </Card>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerBlock: { alignSelf: 'stretch', paddingHorizontal: spacing.xl, marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing['3xl'] },
  empty: { alignItems: 'center', gap: spacing['2xs'], paddingVertical: spacing.xl },
  center: { textAlign: 'center' },
  section: { gap: spacing.md },
  list: { gap: spacing.sm },
  ruledLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  rule: { flex: 1, height: stroke.hairline },
  tileRow: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    height: 60,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
