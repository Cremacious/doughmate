// Cook mode, a full sheet. One step at a time with large targets for messy hands.
// The last step closes with a Sam toast. No back button: swipe down to leave.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatStepTime, parseDuration } from '@/lib/timer';
import { useRecipes } from '@/state/recipes';
import { spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { StepTimerControl } from '@/ui/StepTimerControl';
import { useToast } from '@/ui/Toast';

export default function CookModeSheet() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipe } = useRecipes();
  const { show } = useToast();

  const recipe = getRecipe(id);
  const steps = recipe?.steps ?? [];
  const [index, setIndex] = useState(0);

  const finish = () => {
    router.back();
    show({ message: t('recipes.cook_finished'), variant: 'confirmation' });
  };

  if (!recipe || steps.length === 0) {
    return (
      <BottomSheet size="full" onClose={() => router.back()}>
        <View style={styles.body}>
          <Text style={[typography.body.lg, { color: palette.textSoft }]}>
            {t('recipes.meta_steps', { count: 0 })}
          </Text>
        </View>
      </BottomSheet>
    );
  }

  const step = steps[index]!;
  const last = index === steps.length - 1;
  const stepDurationMs = step.time ? parseDuration(step.time) : null;

  return (
    <BottomSheet
      size="full"
      onClose={() => router.back()}
      header={
        <Text style={[typography.title, styles.counter, { color: palette.textSoft }]}>
          {recipe.name} · {t('recipes.cook_step', { current: index + 1, total: steps.length })}
        </Text>
      }
      footer={
        <View style={styles.footerCol}>
          <View style={styles.footerRow}>
            {index > 0 ? (
              <View style={styles.footerItem}>
                <Button
                  label={t('recipes.cook_back')}
                  onPress={() => setIndex((i) => Math.max(0, i - 1))}
                  variant="quiet"
                  haptic="tap"
                />
              </View>
            ) : null}
            <View style={styles.footerItem}>
              <Button
                label={last ? t('recipes.cook_done') : t('recipes.cook_next')}
                onPress={() => (last ? finish() : setIndex((i) => i + 1))}
                haptic="pop"
              />
            </View>
          </View>
          {last ? (
            <Button
              label={t('bakes.log_this_bake')}
              onPress={() => router.push(`/bake-new?recipeId=${recipe.id}`)}
              variant="quiet"
              haptic="tap"
            />
          ) : null}
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === index ? 22 : 8,
                  backgroundColor: i === index ? palette.primary : palette.grabber,
                },
              ]}
            />
          ))}
        </View>

        <Text style={[typography.numeric.hero, { color: palette.textFaint }]}>{index + 1}</Text>
        <Text style={[typography.display.md, { color: palette.textInk }]}>{step.text}</Text>
        {step.time ? (
          <Text style={[typography.heading, { color: palette.proofTeal }]}>
            {formatStepTime(step.time)}
          </Text>
        ) : null}
        {step.time && stepDurationMs !== null ? (
          <StepTimerControl
            recipeId={recipe.id}
            stepIndex={index}
            stepText={step.text}
            time={step.time}
            durationMs={stepDurationMs}
          />
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  counter: { marginTop: spacing.xs, textAlign: 'center', paddingHorizontal: spacing.xl },
  body: { padding: spacing.xl, gap: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  dot: { height: 8, borderRadius: 999 },
  footerCol: { gap: spacing.sm },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
  footerItem: { flex: 1 },
});
