// Fresh Bake RecipeCard. A list card: standard fill, ink outline, a soft card shadow,
// and an 8px tag strip along the top edge that says what kind of bake this is before
// you have read the name.
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { tagStripFor } from '@/lib/recipeTag';
import { scaleType } from '@/lib/typeScale';
import type { Recipe } from '@/state/recipes';
import { radius, spacing, typography } from '@/theme';
import { Card } from './Card';
import { MetaRow, type MetaItem } from './MetaRow';

export interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();

  const strip = tagStripFor(recipe.tags, t);
  const stripColor =
    strip === 'teal'
      ? palette.proofTeal
      : strip === 'butter'
        ? palette.accentButter
        : palette.primary;

  const meta: MetaItem[] = [
    {
      value: recipe.ingredients.length,
      label: t('recipes.count_ingredients', { count: recipe.ingredients.length }),
    },
    { value: recipe.steps.length, label: t('recipes.count_steps', { count: recipe.steps.length }) },
  ];
  if (recipe.yieldLabel.trim()) {
    meta.push({ label: recipe.yieldLabel.trim() });
  }

  return (
    <Card onPress={onPress} stripColor={stripColor}>
      <View style={styles.head}>
        <Text
          style={[
            typography.heading,
            scaleType(typography.heading, fontScale),
            styles.title,
            { color: palette.textInk },
          ]}
        >
          {recipe.name}
        </Text>
        {recipe.totalTime ? (
          <Text
            style={[
              typography.numeric.sm,
              scaleType(typography.numeric.sm, fontScale),
              { color: palette.textFaint },
            ]}
          >
            {recipe.totalTime}
          </Text>
        ) : null}
      </View>

      <MetaRow items={meta} />

      {recipe.tags.length > 0 ? (
        <View style={styles.tags}>
          {recipe.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: palette.bgSunken }]}>
              <Text
                style={[
                  typography.labelSm,
                  scaleType(typography.labelSm, fontScale),
                  { color: palette.textSoft },
                ]}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: { flexShrink: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2xs'], marginTop: spacing['2xs'] },
  tag: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 5 },
});

export default RecipeCard;
