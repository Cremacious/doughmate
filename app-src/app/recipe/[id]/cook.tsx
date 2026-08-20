// Cook mode, a full sheet. One step at a time with large targets for messy hands.
// The last step closes with a Sam toast. No back button: swipe down to leave.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { parseDuration } from '@/lib/timer';
import { numeralLine, scaleType } from '@/lib/typeScale';
import { useRecipes } from '@/state/recipes';
import { spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { StepTimerControl } from '@/ui/StepTimerControl';
import { useToast } from '@/ui/Toast';

/** The step number above the instruction. Sized to label the step, not to lead it. */
const STEP_NUMERAL = 56;

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
  // noun from `count_steps` ("steps") in the old cook-only dim colour on the old
  // cook-only canvas, with no header and no footer — a brown screen with no
  // visible text and no way out.
  if (!recipe || steps.length === 0) {
    return (
      <BottomSheet
        size="full"
        onClose={() => router.back()}
        footer={
          <View style={styles.footerCol}>
            {/* The way out of an empty method is to write one, so the primary
                action goes to the editor rather than just dismissing. */}
            {recipe ? (
              <Button
                label={t('recipes.cook_empty_add_steps')}
                onPress={() => router.replace(`/recipe-new?id=${recipe.id}`)}
                size="lg"
                haptic="pop"
              />
            ) : null}
            <Button
              label={t('common.close')}
              onPress={() => router.back()}
              variant="quiet"
              haptic="tap"
            />
          </View>
        }
      >
        <View style={styles.body}>
          <Text
            style={[
              typography.display.md,
              scaleType(typography.display.md, fontScale),
              styles.centred,
              { color: palette.textInk },
            ]}
          >
            {t('recipes.cook_empty_title')}
          </Text>
          <Text
            style={[
              typography.body.lg,
              scaleType(typography.body.lg, fontScale),
              styles.centred,
              { color: palette.textSoft },
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
      header={
        <View style={styles.headerBlock}>
          <Text
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              styles.centred,
              { color: palette.textSoft },
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
              { color: palette.textInk },
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
              { color: palette.textSoft },
            ]}
          >
            {t('recipes.cook_swipe_hint')}
          </Text>
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text
          style={[typography.numeric.hero, numeralLine(STEP_NUMERAL), { color: palette.textInk }]}
        >
          {index + 1}
        </Text>
        <Text
          style={[
            typography.display.xl,
            scaleType(typography.display.xl, fontScale),
            { color: palette.textInk },
          ]}
        >
          {step.text}
        </Text>

        {step.time && stepDurationMs !== null ? (
          <StepTimerControl
            recipeId={recipe.id}
            stepIndex={index}
            stepText={step.text}
            time={step.time}
            durationMs={stepDurationMs}
            size="large"
          />
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerBlock: { alignSelf: 'stretch', paddingHorizontal: spacing.xl, gap: 2 },
  centred: { textAlign: 'center' },
  body: { padding: spacing.xl, gap: spacing.md, flexGrow: 1, justifyContent: 'center' },
  footerCol: { gap: spacing.sm },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
  footerItem: { flex: 1 },
});
