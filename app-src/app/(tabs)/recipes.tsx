// Recipes tab: the Recipe Box. Tag filter, a list of RecipeCards, and a bottom
// anchored New recipe button. Empty state greets with Sam.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRecipes } from '@/state/recipes';
import { spacing, typography } from '@/theme';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { RecipeCard } from '@/ui/RecipeCard';
import { Screen } from '@/ui/Screen';

export default function RecipesScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { recipes } = useRecipes();
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => r.tags.forEach((x) => set.add(x)));
    return [...set];
  }, [recipes]);

  const shown = useMemo(
    () => (tag ? recipes.filter((r) => r.tags.includes(tag)) : recipes),
    [recipes, tag]
  );

  const newRecipe = () => router.push('/recipe-new');

  if (recipes.length === 0) {
    return (
      <Screen
        title={t('tabs.recipes')}
        footer={<Button label={t('recipes.new_recipe')} onPress={newRecipe} haptic="pop" />}
      >
        <View style={styles.empty}>
          <Sam size={132} />
          <Text style={[typography.display.md, styles.emptyTitle, { color: palette.textInk }]}>
            {t('recipes.empty_title')}
          </Text>
          <Text style={[typography.body.md, styles.emptyBody, { color: palette.textSoft }]}>
            {t('recipes.empty_body_full')}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title={t('tabs.recipes')}
      footer={<Button label={t('recipes.new_recipe')} onPress={newRecipe} haptic="pop" />}
    >
      {tags.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.tagRow}
        >
          <Chip label={t('recipes.tag_all')} selected={tag === null} onPress={() => setTag(null)} />
          {tags.map((x) => (
            <Chip key={x} label={x} selected={tag === x} onPress={() => setTag(x)} />
          ))}
        </ScrollView>
      ) : null}

      {shown.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onPress={() => router.push(`/recipe/${recipe.id}`)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tagRow: { gap: spacing.sm, paddingBottom: spacing.xs },
  empty: { alignItems: 'center', paddingTop: spacing['3xl'], gap: spacing.sm },
  emptyTitle: { textAlign: 'center', marginTop: spacing.md },
  emptyBody: { textAlign: 'center', maxWidth: 280 },
});
