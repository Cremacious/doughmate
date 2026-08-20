// Recipe detail, a tall sheet. Scale block recomputes every ingredient per line,
// baker's percentages sit behind Pro, and the footer starts cook mode.
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatQuantity, type NumberFormat } from '@/lib/convert';
import { bakersPercentages, groupBySection, levainBuild, type LevainBuild } from '@/lib/recipe';
import { tagStripFor } from '@/lib/recipeTag';
import { formatStepTime, parseDuration } from '@/lib/timer';
import { scaleType } from '@/lib/typeScale';
import { usePro } from '@/state/pro';
import { type RecipeIngredient, useRecipes } from '@/state/recipes';
import { useSettings } from '@/state/settings';
import { hardShadow, radius, spacing, stroke, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { HardShadow } from '@/ui/HardShadow';
import { IconButton } from '@/ui/IconButton';
import { Input } from '@/ui/Input';
import { StepTimerControl } from '@/ui/StepTimerControl';
import { Stepper } from '@/ui/Stepper';
import { Tip } from '@/ui/Tip';

function ingAmountText(ingredient: RecipeIngredient, factor: number, format: NumberFormat): string {
  if (typeof ingredient.amount !== 'number') return ingredient.unit;
  const scaled = formatQuantity(ingredient.amount * factor, {
    format,
    unit: ingredient.unit,
  });
  return ingredient.unit ? `${scaled} ${ingredient.unit}` : scaled;
}

export default function RecipeDetailSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipe } = useRecipes();
  const { isPro } = usePro();
  const { settings } = useSettings();

  const recipe = getRecipe(id);
  const baseServings = recipe && recipe.servings > 0 ? recipe.servings : 1;
  const [factor, setFactor] = useState(1);

  const bakers = useMemo(() => (recipe ? bakersPercentages(recipe.ingredients) : null), [recipe]);

  const [levainTarget, setLevainTarget] = useState('');
  const [levainHydration, setLevainHydration] = useState(100);
  const [levainRatio, setLevainRatio] = useState('1:2:2');

  const levain: LevainBuild | null = useMemo(() => {
    const target = Number(levainTarget);
    if (!Number.isFinite(target) || target <= 0) {
      return null;
    }
    return levainBuild(target, levainRatio, levainHydration);
  }, [levainTarget, levainRatio, levainHydration]);

  if (!recipe) {
    return (
      <BottomSheet size="tall" onClose={() => router.back()}>
        {null}
      </BottomSheet>
    );
  }

  const strip = tagStripFor(recipe.tags, t);
  const stripColor =
    strip === 'teal'
      ? palette.proofTealText
      : strip === 'butter'
        ? palette.butterText
        : palette.primaryText;

  // Three tiles, each leading with its number. A joined grey sentence hid all three.
  const metaTiles: { value: string; label: string }[] = [
    {
      value: String(recipe.ingredients.length),
      label: t('recipes.count_ingredients', { count: recipe.ingredients.length }),
    },
    {
      value: String(recipe.steps.length),
      label: t('recipes.count_steps', { count: recipe.steps.length }),
    },
    {
      value: recipe.yieldLabel.trim() || String(recipe.servings),
      label: recipe.yieldLabel.trim() ? t('recipes.new_yield_label') : t('recipes.servings'),
    },
  ];

  const scaled = factor !== 1;
  const canPlanBake = recipe.steps.some((s) => s.time && parseDuration(s.time) !== null);

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {recipe.tags.length > 0 ? (
              <Text
                style={[
                  typography.label,
                  scaleType(typography.label, fontScale),
                  { color: stripColor },
                ]}
                numberOfLines={1}
              >
                {recipe.tags.join(' · ')}
              </Text>
            ) : null}
            <Text
              style={[
                typography.display.lg,
                scaleType(typography.display.lg, fontScale),
                { color: palette.textInk },
              ]}
              numberOfLines={2}
            >
              {recipe.name}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('recipes.edit')}
            onPress={() => router.push(`/recipe-new?id=${recipe.id}`)}
          >
            <HardShadow offset={hardShadow.control} radius={radius.pill}>
              <View
                style={[
                  styles.editBtn,
                  { backgroundColor: palette.bgSurface, borderColor: palette.outline },
                ]}
              >
                <Text
                  style={[
                    typography.chip,
                    scaleType(typography.chip, fontScale),
                    { color: palette.textInk },
                  ]}
                >
                  {t('recipes.edit')}
                </Text>
              </View>
            </HardShadow>
          </Pressable>
        </View>
      }
      footer={
        <View style={styles.footerCol}>
          <View style={styles.footerRow}>
            <View style={styles.footerPrimary}>
              <Button
                label={t('recipes.start_baking')}
                onPress={() => router.push(`/recipe/${recipe.id}/cook`)}
                haptic="pop"
              />
            </View>
            {canPlanBake ? (
              <IconButton
                iconName="timer"
                size={54}
                radius={radius.xl}
                accessibilityLabel={t('bakePlan.title')}
                onPress={() => router.push(`/bake-plan?recipeId=${recipe.id}`)}
              />
            ) : null}
          </View>
          <Button
            label={t('bakes.log_a_bake')}
            onPress={() => router.push(`/bake-new?recipeId=${recipe.id}`)}
            variant="quiet"
            haptic="tap"
          />
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Tip id="recipe.scale" text={t('tips.recipe_scale')} />
        <View style={styles.metaRow}>
          {metaTiles.map((tile) => (
            <View key={tile.label} style={[styles.metaTile, { backgroundColor: palette.bgSunken }]}>
              <Text
                style={[
                  typography.numeric.md,
                  scaleType(typography.numeric.md, fontScale),
                  { color: palette.textInk },
                ]}
                numberOfLines={1}
              >
                {tile.value}
              </Text>
              <Text
                style={[
                  typography.labelSm,
                  scaleType(typography.labelSm, fontScale),
                  { color: palette.textFaint },
                ]}
                numberOfLines={1}
              >
                {tile.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Scale */}
        <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
          {t('recipes.scale_heading')}
        </Text>
        <Card tier="hero" heroColor={palette.accentButter} style={styles.scaleCard}>
          <View style={styles.scaleTop}>
            <Text
              style={[
                typography.subheading,
                scaleType(typography.subheading, fontScale),
                { color: palette.onButter },
              ]}
            >
              {t('recipes.serves')}
            </Text>
            <Stepper
              value={Math.max(1, Math.round(baseServings * factor))}
              onChange={(v) => setFactor(v / baseServings)}
              decrementLabel={t('recipes.servings')}
              incrementLabel={t('recipes.servings')}
            />
          </View>
          {scaled ? (
            <View style={[styles.scaleNote, { borderTopColor: palette.outline }]}>
              <Text
                style={[
                  typography.numeric.sm,
                  scaleType(typography.numeric.sm, fontScale),
                  { color: palette.onButter },
                ]}
              >
                {t('recipes.now_at', { factor: formatQuantity(factor) })}
              </Text>
              <Pressable accessibilityRole="button" onPress={() => setFactor(1)}>
                <Text
                  style={[
                    typography.labelSm,
                    scaleType(typography.labelSm, fontScale),
                    { color: palette.onButterSoft },
                  ]}
                >
                  {t('recipes.reset')}
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
                      style={[
                        typography.numeric.sm,
                        scaleType(typography.numeric.sm, fontScale),
                        styles.ingAmt,
                        { color: palette.primary },
                      ]}
                    >
                      {ingAmountText(ing, factor, settings.numberFormat)}
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
          <>
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
            <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
              {t('recipes.levain_heading')}
            </Text>
            <Card style={styles.list}>
              <Input
                label={t('recipes.levain_target_label')}
                value={levainTarget}
                onChangeText={setLevainTarget}
                placeholder={t('recipes.levain_target_placeholder')}
                numeric
              />
              <View style={styles.rowBetween}>
                {[80, 100, 125].map((h) => (
                  <Chip
                    key={h}
                    label={`${h}%`}
                    numeric
                    selected={levainHydration === h}
                    onPress={() => setLevainHydration(h)}
                  />
                ))}
              </View>
              <View style={styles.rowBetween}>
                {['1:1:1', '1:2:2', '1:5:5'].map((r) => (
                  <Chip
                    key={r}
                    label={r}
                    numeric
                    selected={levainRatio === r}
                    onPress={() => setLevainRatio(r)}
                  />
                ))}
              </View>
              {levain ? (
                <>
                  <View style={styles.rowBetween}>
                    <Text style={[typography.body.md, { color: palette.textInk }]}>
                      {t('recipes.levain_seed')}
                    </Text>
                    <Text style={[typography.numeric.sm, { color: palette.proofTeal }]}>
                      {formatQuantity(levain.seed, { format: 'decimal' })} g
                    </Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={[typography.body.md, { color: palette.textInk }]}>
                      {t('recipes.levain_flour')}
                    </Text>
                    <Text style={[typography.numeric.sm, { color: palette.proofTeal }]}>
                      {formatQuantity(levain.flour, { format: 'decimal' })} g
                    </Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={[typography.body.md, { color: palette.textInk }]}>
                      {t('recipes.levain_water')}
                    </Text>
                    <Text style={[typography.numeric.sm, { color: palette.proofTeal }]}>
                      {formatQuantity(levain.water, { format: 'decimal' })} g
                    </Text>
                  </View>
                </>
              ) : null}
            </Card>
          </>
        ) : (
          <Card tier="quiet" onPress={() => router.push('/paywall')} style={styles.locked}>
            <View style={[styles.proBadge, { backgroundColor: palette.proWash }]}>
              <Text
                style={[
                  typography.labelSm,
                  scaleType(typography.labelSm, fontScale),
                  { color: palette.pro },
                ]}
              >
                {t('common.pro')}
              </Text>
            </View>
            <Text
              style={[
                typography.body.lg,
                scaleType(typography.body.lg, fontScale),
                styles.lockedText,
                { color: palette.pro },
              ]}
            >
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
              {recipe.steps.map((step, i) => {
                const stepDurationMs = step.time ? parseDuration(step.time) : null;
                return (
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
                            ⏱ {formatStepTime(step.time)}
                          </Text>
                        </View>
                      ) : null}
                      {step.time && stepDurationMs !== null ? (
                        <StepTimerControl
                          recipeId={recipe.id}
                          stepIndex={i}
                          stepText={step.text}
                          time={step.time}
                          durationMs={stepDurationMs}
                        />
                      ) : null}
                    </View>
                  </View>
                );
              })}
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
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  footerCol: { gap: spacing.sm },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignSelf: 'stretch',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
  },
  headerText: { flexShrink: 1, gap: 2 },
  editBtn: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: stroke.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  footerPrimary: { flex: 1 },
  metaRow: { flexDirection: 'row', gap: spacing.sm },
  metaTile: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 1,
  },
  proBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  lockedText: { flex: 1 },
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
    borderTopWidth: stroke.soft,
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
  ingAmt: { minWidth: 58 },
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
