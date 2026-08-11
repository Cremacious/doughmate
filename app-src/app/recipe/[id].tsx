// Recipe detail, a tall sheet. Scale block recomputes every ingredient per line,
// baker's percentages sit behind Pro, and the footer starts cook mode.
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatQuantity } from '@/lib/convert';
import { bakersPercentages } from '@/lib/recipe';
import { usePro } from '@/state/pro';
import { type RecipeIngredient, useRecipes } from '@/state/recipes';
import { spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Stepper } from '@/ui/Stepper';
import { useToast } from '@/ui/Toast';

const FACTOR_CHIPS = [0.5, 1, 2];

function ingredientText(ingredient: RecipeIngredient, factor: number): string {
  const { amount, unit, item } = ingredient;
  if (typeof amount !== 'number') {
    return item;
  }
  const scaled = formatQuantity(amount * factor);
  const head = unit ? `${scaled} ${unit}` : scaled;
  return item ? `${head} ${item}` : head;
}

export default function RecipeDetailSheet() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipe, removeRecipe, restoreRecipe } = useRecipes();
  const { isPro } = usePro();
  const { show } = useToast();

  const recipe = getRecipe(id);
  const baseServings = recipe && recipe.servings > 0 ? recipe.servings : 1;
  const [factor, setFactor] = useState(1);

  const bakers = useMemo(() => (recipe ? bakersPercentages(recipe.ingredients) : null), [recipe]);

  if (!recipe) {
    return (
      <BottomSheet size="tall" onClose={() => router.back()}>
        {null}
      </BottomSheet>
    );
  }

  const metaParts = [
    t('recipes.meta_ingredients', { count: recipe.ingredients.length }),
    t('recipes.meta_steps', { count: recipe.steps.length }),
  ];
  if (recipe.yieldLabel.trim()) {
    metaParts.push(recipe.yieldLabel.trim());
  }

  const factorLabel =
    factor === 1 ? t('recipes.original') : t('recipes.now_at', { factor: formatQuantity(factor) });

  const del = () => {
    removeRecipe(recipe.id);
    router.back();
    show({
      message: t('recipes.toast_deleted'),
      actionLabel: t('recipes.button_undo'),
      onAction: () => restoreRecipe(recipe),
    });
  };

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <Text style={[typography.display.lg, styles.title, { color: palette.textInk }]}>
          {recipe.name}
        </Text>
      }
      footer={
        <Button
          label={t('recipes.start_baking')}
          onPress={() => router.push(`/recipe/${recipe.id}/cook`)}
          haptic="pop"
        />
      }
    >
      <View style={styles.body}>
        <Text style={[typography.body.sm, { color: palette.textSoft }]}>
          {metaParts.join('  ·  ')}
        </Text>

        {/* Scale */}
        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('recipes.scale_heading')}
        </Text>
        <Card style={styles.stack}>
          <View style={styles.rowBetween}>
            <Text style={[typography.body.lg, { color: palette.textInk }]}>
              {t('recipes.servings')}
            </Text>
            <Text style={[typography.numeric.sm, { color: palette.primaryText }]}>
              {factorLabel}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Stepper
              value={Math.max(1, Math.round(baseServings * factor))}
              onChange={(v) => setFactor(v / baseServings)}
            />
            <View style={styles.chips}>
              {FACTOR_CHIPS.map((f) => (
                <Chip
                  key={f}
                  label={`${formatQuantity(f)}x`}
                  selected={factor === f}
                  onPress={() => setFactor(f)}
                />
              ))}
            </View>
          </View>
        </Card>

        {/* Ingredients */}
        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('recipes.ingredients_heading')}
        </Text>
        <Card style={styles.list}>
          {recipe.ingredients.length === 0 ? (
            <Text style={[typography.body.md, { color: palette.textFaint }]}>
              {t('recipes.meta_ingredients', { count: 0 })}
            </Text>
          ) : (
            recipe.ingredients.map((ing, i) => (
              <Text key={i} style={[typography.body.lg, { color: palette.textInk }]}>
                {ingredientText(ing, factor)}
              </Text>
            ))
          )}
        </Card>

        {/* Baker's percentages */}
        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('recipes.bakers_pct')}
        </Text>
        {isPro ? (
          <Card style={styles.list}>
            {bakers ? (
              bakers.map((row, i) => (
                <View key={i} style={styles.rowBetween}>
                  <Text style={[typography.body.md, { color: palette.textInk }]}>{row.item}</Text>
                  <Text style={[typography.numeric.sm, { color: palette.proofTeal }]}>
                    {formatQuantity(row.pct)}%
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[typography.body.md, { color: palette.textFaint }]}>
                {t('recipes.bakers_empty')}
              </Text>
            )}
          </Card>
        ) : (
          <Card onPress={() => router.push('/paywall')} style={styles.locked}>
            <Text style={[typography.body.lg, { color: palette.pro }]}>
              {t('recipes.bakers_locked')}
            </Text>
            <Text style={[typography.body.lg, { color: palette.pro }]}>›</Text>
          </Card>
        )}

        {/* Method */}
        {recipe.steps.length > 0 ? (
          <>
            <Text style={[typography.label, { color: palette.textSoft }]}>
              {t('recipes.method_heading')}
            </Text>
            <Card style={styles.steps}>
              {recipe.steps.map((step, i) => (
                <View key={i} style={styles.step}>
                  <Text
                    style={[typography.numeric.sm, styles.stepNum, { color: palette.textFaint }]}
                  >
                    {i + 1}
                  </Text>
                  <View style={styles.stepText}>
                    <Text style={[typography.body.lg, { color: palette.textInk }]}>
                      {step.text}
                    </Text>
                    {step.time ? (
                      <Text style={[typography.body.sm, { color: palette.proofTeal }]}>
                        {step.time}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        {/* Notes */}
        {recipe.notes?.trim() ? (
          <>
            <Text style={[typography.label, { color: palette.textSoft }]}>
              {t('recipes.notes_heading')}
            </Text>
            <Card>
              <Text style={[typography.body.md, { color: palette.textSoft }]}>{recipe.notes}</Text>
            </Card>
          </>
        ) : null}

        <Button
          label={t('recipes.delete_recipe')}
          onPress={del}
          variant="destructive"
          haptic="tap"
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs, textAlign: 'center', paddingHorizontal: spacing.xl },
  body: { padding: spacing.xl, gap: spacing.sm },
  stack: { gap: spacing.md },
  list: { gap: spacing.xs },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexShrink: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  locked: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  steps: { gap: spacing.md },
  step: { flexDirection: 'row', gap: spacing.md },
  stepNum: { minWidth: 20 },
  stepText: { flex: 1, gap: spacing['2xs'] },
});
