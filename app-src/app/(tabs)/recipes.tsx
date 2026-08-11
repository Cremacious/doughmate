// The Recipe Box. Lists saved recipes with delete + undo, and entries to add a
// new recipe or open the scaler.
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { FREE_RECIPE_LIMIT } from '@/lib/limits';
import { usePro } from '@/state/pro';
import { type Recipe, useRecipes } from '@/state/recipes';
import { shadow, spacing, typography } from '@/theme';

export default function RecipesScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { recipes, removeRecipe, restoreRecipe } = useRecipes();
  const { isPro } = usePro();

  const addRecipe = () => {
    if (!isPro && recipes.length >= FREE_RECIPE_LIMIT) {
      router.push('/paywall');
    } else {
      router.push('/recipe-new');
    }
  };

  const [deleted, setDeleted] = useState<Recipe | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const onDelete = (recipe: Recipe) => {
    triggerHaptic('warning');
    setDeleted(recipe);
    removeRecipe(recipe.id);
    clearTimer();
    timer.current = setTimeout(() => setDeleted(null), 4000);
  };

  const onUndo = () => {
    if (deleted) {
      restoreRecipe(deleted);
    }
    setDeleted(null);
    clearTimer();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[typography.display.md, { color: palette.choc }]}>{t('recipes.title')}</Text>
          <Button label={t('recipes.button_add')} variant="secondary" onPress={addRecipe} />
        </View>

        {recipes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[typography.body.lg, styles.center, { color: palette.chocSoft }]}>
              {t('recipes.empty_title')}
            </Text>
            <Text style={[typography.body.md, styles.center, { color: palette.chocSoft }]}>
              {t('recipes.empty_body')}
            </Text>
            <Button
              label={t('scaler.title')}
              variant="ghost"
              onPress={() => router.push('/scaler')}
            />
          </View>
        ) : (
          recipes.map((recipe) => (
            <Card key={recipe.id} style={styles.card}>
              <Text style={[typography.body.lg, { color: palette.choc }]}>{recipe.name}</Text>
              {recipe.lines.length > 0 ? (
                <Text style={[typography.body.sm, { color: palette.chocSoft }]}>
                  {recipe.lines.join('\n')}
                </Text>
              ) : null}
              <View style={styles.cardActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: '/scaler',
                      params: { recipe: recipe.lines.join('\n') },
                    })
                  }
                >
                  <Text style={[typography.body.md, { color: palette.crust }]}>
                    {t('recipes.button_scale')}
                  </Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => onDelete(recipe)}>
                  <Text style={[typography.body.md, { color: palette.jam }]}>
                    {t('recipes.button_delete')}
                  </Text>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {deleted ? (
        <View
          style={[
            styles.undo,
            shadow.lg,
            { backgroundColor: bg.elevated, bottom: insets.bottom + 78 },
          ]}
        >
          <Text style={[typography.body.md, { color: palette.choc }]}>
            {t('recipes.toast_deleted')}
          </Text>
          <Pressable accessibilityRole="button" onPress={onUndo}>
            <Text style={[typography.body.lg, { color: palette.crust }]}>
              {t('recipes.button_undo')}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['3xl'] * 2, gap: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  empty: { alignItems: 'center', gap: spacing.sm, marginTop: spacing['3xl'] },
  center: { textAlign: 'center' },
  card: { gap: spacing.sm },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.xl,
    marginTop: spacing.xs,
  },
  undo: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
  },
});
