// Timers sheet. Lists every live fermentation timer with a live countdown, plus
// a custom timer builder: big Hours and Minutes steppers, quick pick chips, a
// live preview, and Start.
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useNow } from '@/hooks/useNow';
import { formatRemaining } from '@/lib/timer';
import { useBakePlan } from '@/state/bakePlan';
import { useTimers } from '@/state/timers';
import { spacing, typography } from '@/theme';
import { BakePlanCard } from '@/ui/BakePlanCard';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
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
  const { palette } = useAppTheme();
  const now = useNow();
  const { timers, startTimer, pauseTimer, resumeTimer, cancelTimer } = useTimers();
  const { plan, cancelPlan } = useBakePlan();

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [label, setLabel] = useState('');

  const durationMs = (hours * 3600 + minutes * 60) * 1000;

  const start = () => {
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
        <Text style={[typography.display.md, styles.title, { color: palette.textInk }]}>
          {t('timers.title')}
        </Text>
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
              {timers.map((timer) => (
                <TimerCard
                  key={timer.id}
                  timer={timer}
                  now={now}
                  onPauseResume={() =>
                    timer.status === 'running' ? pauseTimer(timer.id) : resumeTimer(timer.id)
                  }
                  onCancel={() => cancelTimer(timer.id)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[typography.label, { color: palette.textSoft }]}>{t('timers.custom')}</Text>

          <Text style={[typography.numeric.hero, styles.preview, { color: palette.textInk }]}>
            {formatRemaining(durationMs)}
          </Text>

          <Text style={[typography.label, { color: palette.textSoft }]}>
            {t('timers.how_long')}
          </Text>

          <View style={styles.stepperRow}>
            <View style={styles.stepperCol}>
              <Text style={[typography.label, { color: palette.textFaint }]}>
                {t('timers.hours')}
              </Text>
              <Stepper value={hours} onChange={setHours} min={0} />
            </View>
            <View style={styles.stepperCol}>
              <Text style={[typography.label, { color: palette.textFaint }]}>
                {t('timers.minutes')}
              </Text>
              <Stepper value={minutes} onChange={setMinutes} min={0} step={5} />
            </View>
          </View>

          <View style={styles.chips}>
            {QUICK_PICKS.map((pick) => (
              <Chip
                key={pick.label}
                label={pick.label}
                selected={hours === pick.hours && minutes === pick.minutes}
                onPress={() => {
                  setHours(pick.hours);
                  setMinutes(pick.minutes);
                }}
              />
            ))}
          </View>

          <Input
            label={t('timers.label_optional')}
            value={label}
            onChangeText={setLabel}
            placeholder={t('timers.label_placeholder')}
          />

          <Button
            label={t('timers.start')}
            onPress={start}
            disabled={hours === 0 && minutes === 0}
            haptic="pop"
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing['2xl'], paddingBottom: spacing['3xl'] },
  empty: { alignItems: 'center', gap: spacing['2xs'], paddingVertical: spacing.xl },
  center: { textAlign: 'center' },
  section: { gap: spacing.md },
  list: { gap: spacing.sm },
  preview: { textAlign: 'center' },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stepperCol: { alignItems: 'center', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
