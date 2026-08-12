// Recipes tab: the Recipe Box, and the Bakes journal, switched by a segmented
// control. Recipes keeps its tag filter, RecipeCard list, and New recipe button.
// Bakes shows a chronological list of BakeCards (or a Sam empty state) and a Log
// a bake button.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBakes } from '@/state/bakes';
import { useRecipes } from '@/state/recipes';
import { spacing, typography } from '@/theme';
import { BakeCard } from '@/ui/BakeCard';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { RecipeCard } from '@/ui/RecipeCard';
import { Screen } from '@/ui/Screen';
import { SegmentedControl } from '@/ui/SegmentedControl';

export default function RecipesScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
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

  const footer =
    segment === 'recipes' ? (
      <Button label={t('recipes.new_recipe')} onPress={newRecipe} haptic="pop" />
    ) : (
      <Button label={t('bakes.log_a_bake')} onPress={logABake} haptic="pop" />
    );

  return (
    <Screen title={t('tabs.recipes')} footer={footer}>
      <SegmentedControl
        options={[
          { id: 'recipes', label: t('bakes.seg_recipes') },
          { id: 'bakes', label: t('bakes.seg_bakes') },
        ]}
        value={segment}
        onChange={setSegment}
      />

      {segment === 'recipes' ? (
        recipes.length === 0 ? (
          <View style={styles.empty}>
            <Sam size={132} />
            <Text style={[typography.display.md, styles.emptyTitle, { color: palette.textInk }]}>
              {t('recipes.empty_title')}
            </Text>
            <Text style={[typography.body.md, styles.emptyBody, { color: palette.textSoft }]}>
              {t('recipes.empty_body_full')}
            </Text>
          </View>
        ) : (
          <>
            {tags.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.tagRow}
              >
                <Chip
                  label={t('recipes.tag_all')}
                  selected={tag === null}
                  onPress={() => setTag(null)}
                />
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
          </>
        )
      ) : bakes.length === 0 ? (
        <View style={styles.empty}>
          <Sam size={132} />
          <Text style={[typography.display.md, styles.emptyTitle, { color: palette.textInk }]}>
            {t('bakes.empty_title')}
          </Text>
          <Text style={[typography.body.md, styles.emptyBody, { color: palette.textSoft }]}>
            {t('bakes.empty_body')}
          </Text>
        </View>
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
  tagRow: { gap: spacing.sm, paddingBottom: spacing.xs },
  empty: { alignItems: 'center', paddingTop: spacing['3xl'], gap: spacing.sm },
  emptyTitle: { textAlign: 'center', marginTop: spacing.md },
  emptyBody: { textAlign: 'center', maxWidth: 280 },
});
