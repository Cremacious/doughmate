// New recipe. A name and a few ingredient lines, saved to the Recipe Box.
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ModalHeader } from '@/components/ModalHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRecipes } from '@/state/recipes';
import { radius, spacing, typography } from '@/theme';

export default function NewRecipeScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();
  const { addRecipe } = useRecipes();

  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');

  const lines = ingredients
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
  const trimmedName = name.trim();
  const canSave = trimmedName !== '' || lines.length > 0;

  const save = () => {
    addRecipe({ name: trimmedName || lines[0] || t('recipes.title'), lines });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ModalHeader title={t('recipes.new_title')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.stack}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('recipes.new_name_placeholder')}
            placeholderTextColor={palette.chocSoft}
            style={[
              typography.body.lg,
              styles.nameInput,
              { backgroundColor: bg.subtle, color: palette.choc },
            ]}
          />

          <View>
            <Text style={[typography.caption, styles.label, { color: palette.chocSoft }]}>
              {t('recipes.new_ingredients_label')}
            </Text>
            <TextInput
              value={ingredients}
              onChangeText={setIngredients}
              placeholder={t('recipes.new_ingredients_placeholder')}
              placeholderTextColor={palette.chocSoft}
              multiline
              textAlignVertical="top"
              style={[
                typography.body.md,
                styles.ingredientsInput,
                { backgroundColor: bg.subtle, color: palette.choc },
              ]}
            />
          </View>
        </Card>

        <Button label={t('recipes.button_save')} onPress={save} disabled={!canSave} haptic="pop" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },
  stack: { gap: spacing.lg },
  nameInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  label: { marginBottom: spacing.xs },
  ingredientsInput: {
    minHeight: 160,
    padding: spacing.md,
    borderRadius: radius.md,
  },
});
