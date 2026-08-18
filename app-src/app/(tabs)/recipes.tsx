// Recipes tab: the Recipe Box, and the Bakes journal, switched by a segmented
// control. Recipes keeps its tag filter and RecipeCard list; Bakes shows a
// chronological list of BakeCards. Both create actions live on the corner FAB, and
// both empty states are the Fresh Bake hero rather than a centred pair of lines.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { useBakes } from '@/state/bakes';
import { useRecipes } from '@/state/recipes';
import { spacing } from '@/theme';
import { BakeCard } from '@/ui/BakeCard';
import { Chip } from '@/ui/Chip';
import { EmptyState } from '@/ui/EmptyState';
import { RecipeCard } from '@/ui/RecipeCard';
import { Screen } from '@/ui/Screen';
import { SegmentedControl } from '@/ui/SegmentedControl';

export default function RecipesScreen() {
  const { t } = useTranslation();
  const { recipes } = useRecipes();
  const { bakes } = useBakes();
  const [tag, setTag] = useState<string | null>(null);
  const [segment, setSegment] = useState<'recipes' | 'bakes'>('recipes');
  const [now] = useState(() => Date.now());

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
  const logABake = () => router.push('/bake-new');

  const onRecipes = segment === 'recipes';

  return (
    <Screen
      title={t('tabs.recipes')}
      eyebrow={t('recipes.eyebrow_saved', {
        count: onRecipes ? recipes.length : bakes.length,
      })}
      settingsLabel={t('common.open_settings')}
      fab={{
        iconName: 'add',
        onPress: onRecipes ? newRecipe : logABake,
        accessibilityLabel: onRecipes ? t('recipes.new_recipe_action') : t('bakes.log_a_bake'),
      }}
    >
      <SegmentedControl
        options={[
          { id: 'recipes', label: t('bakes.seg_recipes') },
          { id: 'bakes', label: t('bakes.seg_bakes') },
        ]}
        value={segment}
        onChange={setSegment}
      />

      {onRecipes ? (
        recipes.length === 0 ? (
          <EmptyState
            headline={t('recipes.empty_title')}
            body={t('recipes.empty_body_full')}
            primary={{ label: t('recipes.new_recipe_action'), onPress: newRecipe }}
            secondary={{ label: t('bakes.log_a_bake'), onPress: logABake }}
          />
        ) : (
          <>
            {tags.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.tagRow}
              >
                {/* Filters are butter: browsing, not deciding. */}
                <Chip
                  label={`${t('recipes.tag_all')} ${recipes.length}`}
                  emphasis="butter"
                  selected={tag === null}
                  onPress={() => setTag(null)}
                />
                {tags.map((x) => (
                  <Chip
                    key={x}
                    label={x}
                    emphasis="butter"
                    selected={tag === x}
                    onPress={() => setTag(x)}
                  />
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
          </>
        )
      ) : bakes.length === 0 ? (
        <EmptyState
          headline={t('bakes.empty_title')}
          body={t('bakes.empty_body')}
          primary={{ label: t('bakes.log_a_bake'), onPress: logABake }}
          secondary={{ label: t('recipes.new_recipe_action'), onPress: newRecipe }}
          emotion="happy"
        />
      ) : (
        bakes.map((b) => (
          <BakeCard
            key={b.id}
            bake={b}
            now={now}
            onPress={() => router.push(`/bake-new?id=${b.id}`)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Room below so a selected chip's hard shadow is not clipped by the scroll view.
  tagRow: { gap: spacing.sm, paddingBottom: spacing.xs, paddingRight: spacing.xl },
});
