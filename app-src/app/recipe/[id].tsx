// Recipe detail, a tall sheet. Scale block recomputes every ingredient per line,
// baker's percentages sit behind Pro, and the footer starts cook mode.
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatQuantity } from '@/lib/convert';
import { bakersPercentages, groupBySection } from '@/lib/recipe';
import { usePro } from '@/state/pro';
import { type RecipeIngredient, useRecipes } from '@/state/recipes';
import { radius, spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Stepper } from '@/ui/Stepper';
import { Tip } from '@/ui/Tip';
import { useToast } from '@/ui/Toast';

function ingAmountText(ingredient: RecipeIngredient, factor: number): string {
  if (typeof ingredient.amount !== 'number') return ingredient.unit;
  const scaled = formatQuantity(ingredient.amount * factor);
  return ingredient.unit ? `${scaled} ${ingredient.unit}` : scaled;
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

  const scaled = factor !== 1;

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
        <View style={styles.headerRow}>
          <Text style={[typography.display.lg, styles.title, { color: palette.textInk }]}>
            {recipe.name}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('recipes.edit')}
            onPress={() => router.push(`/recipe-new?id=${recipe.id}`)}
            style={[styles.editBtn, { backgroundColor: palette.bgSunken }]}
          >
            <Text style={[typography.title, { color: palette.textInk }]}>
              ✎ {t('recipes.edit')}
            </Text>
          </Pressable>
        </View>
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
        <Tip id="recipe.scale" text={t('tips.recipe_scale')} />
        <Text style={[typography.body.sm, { color: palette.textSoft }]}>
          {metaParts.join('  ·  ')}
        </Text>

        {/* Scale */}
        <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
          {t('recipes.scale_heading')}
        </Text>
        <Card style={styles.scaleCard}>
          <View style={styles.scaleTop}>
            <Text style={[typography.body.lg, { color: palette.textInk }]}>
              {t('recipes.serves')}
            </Text>
            <Stepper
              value={Math.max(1, Math.round(baseServings * factor))}
              onChange={(v) => setFactor(v / baseServings)}
            />
          </View>
          {scaled ? (
            <View style={[styles.scaleNote, { borderTopColor: palette.border }]}>
              <Text style={[typography.numeric.sm, { color: palette.primaryText }]}>
                {t('recipes.now_at', { factor: formatQuantity(factor) })}
              </Text>
              <Pressable accessibilityRole="button" onPress={() => setFactor(1)}>
                <Text style={[typography.label, { color: palette.textSoft }]}>
                  ↺ {t('recipes.reset')}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </Card>

        {/* Ingredients */}
        <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
          {t('recipes.ingredients_heading')}
        </Text>
        <Card style={styles.list}>
          {recipe.ingredients.length === 0 ? (
            <Text style={[typography.body.md, { color: palette.textFaint }]}>
              {t('recipes.meta_ingredients', { count: 0 })}
            </Text>
          ) : (
            groupBySection(recipe.ingredients).map((group, gi) => (
              <View key={gi} style={styles.group}>
                {group.section ? (
                  <View style={[styles.sectionPill, { backgroundColor: palette.proofTealWash }]}>
                    <Text style={[typography.label, { color: palette.proofTealText }]}>
                      {group.section}
                    </Text>
                  </View>
                ) : null}
                {group.items.map((ing, ii) => (
                  <View key={ii} style={styles.ingRow}>
                    <Text
                      style={[typography.numeric.sm, styles.ingAmt, { color: palette.primary }]}
                    >
                      {ingAmountText(ing, factor)}
                    </Text>
                    <Text style={[typography.body.lg, styles.ingItem, { color: palette.textInk }]}>
                      {ing.item}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </Card>

        {/* Baker's percentages */}
        <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
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
            <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
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
                      <View style={[styles.timePill, { backgroundColor: palette.proofTealWash }]}>
                        <Text style={[typography.body.sm, { color: palette.proofTealText }]}>
                          ⏱ {step.time}
                        </Text>
                      </View>
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
            <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    alignSelf: 'stretch',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
  },
  title: { flexShrink: 1 },
  editBtn: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.xl, gap: spacing.md },
  sectionLabel: { marginTop: spacing.sm },
  list: { gap: spacing.sm },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  locked: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  scaleCard: { gap: spacing.md },
  scaleTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scaleNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },

  group: { gap: spacing.xs },
  sectionPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    marginBottom: spacing['2xs'],
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    paddingVertical: spacing['2xs'],
  },
  ingAmt: { minWidth: 66 },
  ingItem: { flexShrink: 1 },

  steps: { gap: spacing.md },
  step: { flexDirection: 'row', gap: spacing.md },
  stepNum: { minWidth: 20 },
  stepText: { flex: 1, gap: spacing['2xs'] },
  timePill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: spacing['2xs'],
  },
});
