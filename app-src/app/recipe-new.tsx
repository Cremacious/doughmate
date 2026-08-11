// New recipe, a tall sheet. Ingredients and method are one per line; each
// ingredient line is parsed into amount, unit and item so it can scale later.
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { parseIngredientLine } from '@/lib/recipe';
import { useRecipes } from '@/state/recipes';
import { radius, spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { useToast } from '@/ui/Toast';

const TAG_KEYS = ['tag_sourdough', 'tag_bread', 'tag_sweet', 'tag_quick', 'tag_everyday'] as const;

function toLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

export default function NewRecipeSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { addRecipe } = useRecipes();
  const { show } = useToast();

  const [name, setName] = useState('');
  const [yieldLabel, setYieldLabel] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [method, setMethod] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const ingredientLines = toLines(ingredients);
  const trimmedName = name.trim();
  const canSave = trimmedName !== '' || ingredientLines.length > 0;

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));

  const save = () => {
    addRecipe({
      name: trimmedName || ingredientLines[0] || t('recipes.new_recipe'),
      yieldLabel: yieldLabel.trim(),
      ingredients: ingredientLines.map(parseIngredientLine),
      steps: toLines(method).map((text) => ({ text })),
      tags,
    });
    router.back();
    show({ message: t('recipes.toast_saved'), variant: 'confirmation' });
  };

  const areaStyle = [
    typography.body.lg,
    styles.area,
    {
      height: fontScale > 1 ? 180 : 150,
      backgroundColor: palette.bgSunken,
      color: palette.textInk,
    },
  ];

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <Text style={[typography.display.md, styles.title, { color: palette.textInk }]}>
          {t('recipes.new_recipe')}
        </Text>
      }
      footer={
        <Button label={t('recipes.new_save')} onPress={save} disabled={!canSave} haptic="pop" />
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label={t('recipes.new_name_label')}
          value={name}
          onChangeText={setName}
          placeholder={t('recipes.new_name_placeholder')}
        />
        <Input
          label={t('recipes.new_yield_label')}
          value={yieldLabel}
          onChangeText={setYieldLabel}
          placeholder={t('recipes.new_yield_placeholder')}
        />

        <View style={styles.field}>
          <Text style={[typography.label, { color: palette.textSoft }]}>
            {t('recipes.new_ingredients_label')}
          </Text>
          <TextInput
            value={ingredients}
            onChangeText={setIngredients}
            placeholder={t('recipes.new_ingredients_placeholder')}
            placeholderTextColor={palette.textFaint}
            multiline
            textAlignVertical="top"
            style={areaStyle}
          />
        </View>

        <View style={styles.field}>
          <Text style={[typography.label, { color: palette.textSoft }]}>
            {t('recipes.new_method_label')}
          </Text>
          <TextInput
            value={method}
            onChangeText={setMethod}
            placeholder={t('recipes.new_method_placeholder')}
            placeholderTextColor={palette.textFaint}
            multiline
            textAlignVertical="top"
            style={areaStyle}
          />
        </View>

        <View style={styles.field}>
          <Text style={[typography.label, { color: palette.textSoft }]}>
            {t('recipes.new_tags_label')}
          </Text>
          <View style={styles.tags}>
            {TAG_KEYS.map((key) => {
              const label = t(`recipes.${key}` as 'recipes.tag_bread');
              return (
                <Chip
                  key={key}
                  label={label}
                  selected={tags.includes(label)}
                  onPress={() => toggleTag(label)}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing['3xl'] },
  field: { gap: spacing.xs },
  area: {
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
