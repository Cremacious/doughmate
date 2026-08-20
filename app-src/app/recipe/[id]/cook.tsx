// Cook mode, a full sheet. One step at a time with large targets for messy hands.
// The last step closes with a Sam toast. No back button: swipe down to leave.
//
// This is the only screen that inverts on both themes. Standing at a counter with a
// timer running, the screen is a work surface rather than a page, so it goes dark and
// the step text gets the whole width.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatStepTime, parseDuration } from '@/lib/timer';
import { numeralLine, scaleType } from '@/lib/typeScale';
import { useRecipes } from '@/state/recipes';
import { radius, spacing, stroke, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { StepTimerControl } from '@/ui/StepTimerControl';
import { useToast } from '@/ui/Toast';

/** The ghost step number sitting behind the instruction. */
const GHOST = 96;

export default function CookModeSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
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

  // Reachable when a recipe has no method yet. It used to render the bare unit
  // noun from `count_steps` ("steps") in cookDim on the cook canvas, with no
  // header and no footer — a brown screen with no visible text and no way out.
  if (!recipe || steps.length === 0) {
    return (
      <BottomSheet
        size="full"
        onClose={() => router.back()}
        canvasColor={palette.cookCanvas}
        footerColor={palette.cookFooter}
        footer={
          <Button label={t('common.close')} onPress={() => router.back()} size="lg" haptic="tap" />
        }
      >
        <View style={styles.body}>
          <Text
            style={[
              typography.display.md,
              scaleType(typography.display.md, fontScale),
              styles.centred,
              { color: palette.onPrimary },
            ]}
          >
            {t('recipes.cook_empty_title')}
          </Text>
          {/* onPrimary rather than cookDim: this line carries the only
              instruction on the screen, and cookDim on the cook canvas is about
              2:1, which is what made the old empty state look blank. Size, not
              colour, separates it from the heading. */}
          <Text
            style={[
              typography.body.lg,
              scaleType(typography.body.lg, fontScale),
              styles.centred,
              { color: palette.onPrimary },
            ]}
          >
            {t('recipes.cook_empty_body')}
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
      canvasColor={palette.cookCanvas}
      footerColor={palette.cookFooter}
      header={
        <View style={styles.headerBlock}>
          <Text
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              styles.centred,
              { color: palette.cookDim },
            ]}
            numberOfLines={1}
          >
            {recipe.name}
          </Text>
          <Text
            style={[
              typography.subheading,
              scaleType(typography.subheading, fontScale),
              styles.centred,
              { color: palette.onPrimary },
            ]}
          >
            {t('recipes.cook_step', { current: index + 1, total: steps.length })}
          </Text>
        </View>
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
                  size="lg"
                  haptic="tap"
                />
              </View>
            ) : null}
            <View style={styles.footerItem}>
              <Button
                label={last ? t('recipes.cook_done') : t('recipes.cook_next')}
                onPress={() => (last ? finish() : setIndex((i) => i + 1))}
                size="lg"
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
          <Text
            style={[
              typography.body.sm,
              scaleType(typography.body.sm, fontScale),
              styles.centred,
              { color: palette.cookDim },
            ]}
          >
            {t('recipes.cook_swipe_hint')}
          </Text>
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
                  backgroundColor: i === index ? palette.primary : palette.cookGhost,
                },
              ]}
            />
          ))}
        </View>

        <Text style={[typography.numeric.hero, numeralLine(GHOST), { color: palette.cookGhost }]}>
          {index + 1}
        </Text>
        <Text
          style={[
            typography.display.xl,
            scaleType(typography.display.xl, fontScale),
            { color: palette.onPrimary },
          ]}
        >
          {step.text}
        </Text>

        {step.time ? (
          <View style={styles.timerRow}>
            <View style={[styles.duration, { backgroundColor: palette.proofTeal }]}>
              <Text
                style={[
                  typography.numeric.lg,
                  scaleType(typography.numeric.lg, fontScale),
                  { color: palette.onTeal },
                ]}
              >
                {formatStepTime(step.time)}
              </Text>
            </View>
            {stepDurationMs !== null ? (
              <View style={styles.timerControl}>
                <StepTimerControl
                  recipeId={recipe.id}
                  stepIndex={index}
                  stepText={step.text}
                  time={step.time}
                  durationMs={stepDurationMs}
                  size="large"
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerBlock: { alignSelf: 'stretch', paddingHorizontal: spacing.xl, gap: 2 },
  centred: { textAlign: 'center' },
  body: { padding: spacing.xl, gap: spacing.md, flexGrow: 1, justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  dot: { height: 8, borderRadius: radius.pill },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  duration: {
    borderRadius: radius.lg,
    borderWidth: stroke.ink,
    borderColor: 'transparent',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  timerControl: { flex: 1, minWidth: 180 },
  footerCol: { gap: spacing.sm },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
  footerItem: { flex: 1 },
});
