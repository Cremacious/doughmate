// Proof RecipeCard. Title, a total time on the right, a meta line, and the tag row.
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { Recipe } from '@/state/recipes';
import { spacing, typography } from '@/theme';
import { Card } from './Card';

export interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  const parts = [
    t('recipes.meta_ingredients', { count: recipe.ingredients.length }),
    t('recipes.meta_steps', { count: recipe.steps.length }),
  ];
  if (recipe.yieldLabel.trim()) {
    parts.push(recipe.yieldLabel.trim());
  }

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.head}>
        <Text style={[typography.display.md, styles.title, { color: palette.textInk }]}>
          {recipe.name}
        </Text>
        {recipe.totalTime ? (
          <Text style={[typography.numeric.sm, { color: palette.textFaint }]}>
            {recipe.totalTime}
          </Text>
        ) : null}
      </View>

      <Text style={[typography.body.sm, { color: palette.textSoft }]}>{parts.join('  ·  ')}</Text>

      {recipe.tags.length > 0 ? (
        <View style={styles.tags}>
          {recipe.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: palette.bgSunken }]}>
              <Text style={[typography.label, { color: palette.textSoft }]}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: { flexShrink: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2xs'], marginTop: spacing['2xs'] },
  tag: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 5 },
});

export default RecipeCard;
