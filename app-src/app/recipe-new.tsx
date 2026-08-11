// Shared create/edit recipe editor, a tall sheet. Ingredients are stacked cards
// grouped under optional sections; method steps carry an optional time. Nested
// section drafts flatten to the stored flat ingredient shape on save.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { groupBySection } from '@/lib/recipe';
import {
  type Recipe,
  type RecipeIngredient,
  type RecipeInput,
  type RecipeStep,
  useRecipes,
} from '@/state/recipes';
import { radius, spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { OptionSheet } from '@/ui/OptionSheet';
import { Stepper } from '@/ui/Stepper';
import { useToast } from '@/ui/Toast';
import { UnitPickerField } from '@/ui/UnitPickerField';

const TAG_KEYS = ['tag_sourdough', 'tag_bread', 'tag_sweet', 'tag_quick', 'tag_everyday'] as const;

interface IngredientDraft {
  amount: string;
  unit: string;
  item: string;
}
interface SectionDraft {
  name: string;
  ingredients: IngredientDraft[];
}
interface StepDraft {
  text: string;
  time: string;
}

const UNIT_OPTIONS = ['', 'cup', 'tbsp', 'tsp', 'ml', 'g', 'oz', 'lb', 'stick'] as const;

function emptyIngredient(): IngredientDraft {
  return { amount: '', unit: '', item: '' };
}

function toRecipeInput(
  name: string,
  yieldLabel: string,
  servings: number,
  sections: SectionDraft[],
  steps: StepDraft[],
  tags: string[]
): RecipeInput {
  const ingredients: RecipeIngredient[] = [];
  for (const section of sections) {
    for (const ing of section.ingredients) {
      const item = ing.item.trim();
      const amountText = ing.amount.trim();
      if (item === '' && amountText === '') {
        continue;
      }
      const amountNum = Number(amountText);
      ingredients.push({
        amount: amountText !== '' && Number.isFinite(amountNum) ? amountNum : '',
        unit: ing.unit,
        item,
        section: section.name.trim() || undefined,
      });
    }
  }
  const cleanSteps: RecipeStep[] = steps
    .map((s) => ({ text: s.text.trim(), time: s.time.trim() || undefined }))
    .filter((s) => s.text !== '');
  return { name, yieldLabel, servings, ingredients, steps: cleanSteps, tags };
}

function fromRecipe(recipe: Recipe): {
  sections: SectionDraft[];
  steps: StepDraft[];
} {
  const groups = groupBySection(recipe.ingredients);
  const sections: SectionDraft[] = groups.map((g) => ({
    name: g.section ?? '',
    ingredients: g.items.map((i) => ({
      amount: i.amount === '' ? '' : String(i.amount),
      unit: i.unit,
      item: i.item,
    })),
  }));
  const steps: StepDraft[] = recipe.steps.map((s) => ({ text: s.text, time: s.time ?? '' }));
  return {
    sections: sections.length ? sections : [{ name: '', ingredients: [emptyIngredient()] }],
    steps: steps.length ? steps : [{ text: '', time: '' }],
  };
}

export default function RecipeEditorSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { addRecipe, updateRecipe, getRecipe } = useRecipes();
  const { show } = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = id ? getRecipe(id) : undefined;

  const initial = existing ? fromRecipe(existing) : null;
  const [name, setName] = useState(existing?.name ?? '');
  const [yieldLabel, setYieldLabel] = useState(existing?.yieldLabel ?? '');
  const [servings, setServings] = useState(existing?.servings ?? 1);
  const [sections, setSections] = useState<SectionDraft[]>(
    initial?.sections ?? [{ name: '', ingredients: [emptyIngredient()] }]
  );
  const [steps, setSteps] = useState<StepDraft[]>(initial?.steps ?? [{ text: '', time: '' }]);
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  // which ingredient's unit picker is open, or null
  const [unitPicker, setUnitPicker] = useState<{ s: number; i: number } | null>(null);

  // --- mutation helpers (pure array updates) ---
  const updateIngredient = (s: number, i: number, patch: Partial<IngredientDraft>) =>
    setSections((prev) =>
      prev.map((sec, si) =>
        si === s
          ? {
              ...sec,
              ingredients: sec.ingredients.map((ing, ii) =>
                ii === i ? { ...ing, ...patch } : ing
              ),
            }
          : sec
      )
    );
  const addIngredient = (s: number) =>
    setSections((prev) =>
      prev.map((sec, si) =>
        si === s ? { ...sec, ingredients: [...sec.ingredients, emptyIngredient()] } : sec
      )
    );
  const removeIngredient = (s: number, i: number) =>
    setSections((prev) =>
      prev.map((sec, si) =>
        si === s ? { ...sec, ingredients: sec.ingredients.filter((_, ii) => ii !== i) } : sec
      )
    );
  const setSectionName = (s: number, nameValue: string) =>
    setSections((prev) => prev.map((sec, si) => (si === s ? { ...sec, name: nameValue } : sec)));
  const addSection = () =>
    setSections((prev) => [...prev, { name: '', ingredients: [emptyIngredient()] }]);

  const updateStep = (i: number, patch: Partial<StepDraft>) =>
    setSteps((prev) => prev.map((st, ii) => (ii === i ? { ...st, ...patch } : st)));
  const addStep = () => setSteps((prev) => [...prev, { text: '', time: '' }]);
  const removeStep = (i: number) => setSteps((prev) => prev.filter((_, ii) => ii !== i));

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));

  const save = () => {
    const input = toRecipeInput(
      name.trim() || t('recipes.new_recipe'),
      yieldLabel.trim(),
      servings,
      sections,
      steps,
      tags
    );
    if (existing) {
      updateRecipe(existing.id, input);
    } else {
      addRecipe(input);
    }
    router.back();
    show({ message: t('recipes.toast_saved'), variant: 'confirmation' });
  };

  const floured = fontScale > 1;
  const deleteButtonSize = floured ? 56 : 48;
  const stepAreaStyle = [
    typography.body.lg,
    styles.stepArea,
    {
      height: floured ? 110 : 92,
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
          {existing ? t('recipes.edit_title') : t('recipes.new_title')}
        </Text>
      }
      footer={
        <Button
          label={existing ? t('recipes.save_changes') : t('recipes.new_save')}
          onPress={save}
          haptic="pop"
        />
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

        <View style={styles.row}>
          <View style={styles.fieldFlex}>
            <Input
              label={t('recipes.new_yield_label')}
              value={yieldLabel}
              onChangeText={setYieldLabel}
              placeholder={t('recipes.new_yield_placeholder')}
            />
          </View>
          <View style={styles.servingsField}>
            <Text style={[typography.label, { color: palette.textSoft }]}>
              {t('recipes.servings')}
            </Text>
            <Stepper value={servings} onChange={setServings} min={1} />
          </View>
        </View>

        <View>
          <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
            {t('recipes.new_ingredients_label')}
          </Text>
          <View style={styles.sectionsWrap}>
            {sections.map((section, s) => {
              const showSectionName = s > 0 || section.name.trim() !== '';
              return (
                <View key={s} style={styles.section}>
                  {showSectionName ? (
                    <Input
                      value={section.name}
                      onChangeText={(text) => setSectionName(s, text)}
                      placeholder={t('recipes.section_name_placeholder')}
                    />
                  ) : null}
                  {section.ingredients.map((ing, i) => (
                    <Card key={i} style={styles.ingredientCard}>
                      <Input
                        value={ing.item}
                        onChangeText={(text) => updateIngredient(s, i, { item: text })}
                        placeholder={t('recipes.ingredient_item_placeholder')}
                      />
                      <View style={styles.ingredientRow}>
                        <View style={styles.amountField}>
                          <Input
                            value={ing.amount}
                            onChangeText={(text) => updateIngredient(s, i, { amount: text })}
                            placeholder={t('recipes.ingredient_amount_placeholder')}
                            numeric
                          />
                        </View>
                        <View style={styles.unitField}>
                          <UnitPickerField
                            value={ing.unit ? t(`units.${ing.unit}` as 'units.g') : ''}
                            placeholder={t('recipes.unit_none')}
                            onPress={() => setUnitPicker({ s, i })}
                          />
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t('recipes.button_delete')}
                          onPress={() => removeIngredient(s, i)}
                          style={[
                            styles.deleteButton,
                            {
                              width: deleteButtonSize,
                              height: deleteButtonSize,
                              backgroundColor: palette.bgSunken,
                            },
                          ]}
                        >
                          <Text style={[typography.heading, { color: palette.textFaint }]}>✕</Text>
                        </Pressable>
                      </View>
                    </Card>
                  ))}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => addIngredient(s)}
                    style={[styles.dashedButton, { borderColor: palette.border }]}
                  >
                    <Text style={[typography.title, { color: palette.primaryText }]}>
                      {`+ ${t('recipes.add_ingredient')}`}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
            <Pressable
              accessibilityRole="button"
              onPress={addSection}
              style={[styles.dashedButton, { borderColor: palette.border }]}
            >
              <Text style={[typography.title, { color: palette.primaryText }]}>
                {`+ ${t('recipes.add_section')}`}
              </Text>
            </Pressable>
          </View>
        </View>

        <View>
          <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
            {t('recipes.new_method_label')}
          </Text>
          <View style={styles.stepsWrap}>
            {steps.map((step, i) => (
              <Card key={i} style={styles.stepCard}>
                <View style={styles.stepHeaderRow}>
                  <View style={[styles.stepBadge, { backgroundColor: palette.bgSunken }]}>
                    <Text style={[typography.numeric.sm, { color: palette.textFaint }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <TextInput
                    value={step.text}
                    onChangeText={(text) => updateStep(i, { text })}
                    placeholder={t('recipes.step_text_placeholder')}
                    placeholderTextColor={palette.textFaint}
                    multiline
                    textAlignVertical="top"
                    style={[stepAreaStyle, styles.stepTextWrap]}
                  />
                </View>
                <View style={styles.stepFooterRow}>
                  <View style={styles.stepTimeField}>
                    <Input
                      label={t('recipes.step_time_label')}
                      value={step.time}
                      onChangeText={(text) => updateStep(i, { time: text })}
                      placeholder={t('recipes.step_time_placeholder')}
                    />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('recipes.button_delete')}
                    onPress={() => removeStep(i)}
                    style={[
                      styles.deleteButton,
                      {
                        width: deleteButtonSize,
                        height: deleteButtonSize,
                        backgroundColor: palette.bgSunken,
                      },
                    ]}
                  >
                    <Text style={[typography.heading, { color: palette.textFaint }]}>✕</Text>
                  </Pressable>
                </View>
              </Card>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={addStep}
              style={[styles.dashedButton, { borderColor: palette.border }]}
            >
              <Text style={[typography.title, { color: palette.primaryText }]}>
                {`+ ${t('recipes.add_step')}`}
              </Text>
            </Pressable>
          </View>
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

      {unitPicker ? (
        <OptionSheet
          title={t('recipes.unit_label')}
          selectedId={sections[unitPicker.s]?.ingredients[unitPicker.i]?.unit ?? ''}
          onClose={() => setUnitPicker(null)}
          onSelect={(unit) => updateIngredient(unitPicker.s, unitPicker.i, { unit })}
          options={UNIT_OPTIONS.map((u) => ({
            id: u,
            label: u === '' ? t('recipes.unit_none') : t(`units.${u}` as 'units.g'),
          }))}
        />
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing['3xl'] },
  field: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  fieldFlex: { flex: 1 },
  servingsField: { gap: spacing.xs },
  sectionLabel: { marginBottom: spacing.sm },
  sectionsWrap: { gap: spacing.lg },
  section: { gap: spacing.sm },
  ingredientCard: { gap: spacing.sm },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  amountField: { width: 96 },
  unitField: { flex: 1 },
  deleteButton: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  dashedButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  stepsWrap: { gap: spacing.md },
  stepCard: { gap: spacing.sm },
  stepHeaderRow: { flexDirection: 'row', gap: spacing.sm },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['2xs'],
  },
  stepTextWrap: { flex: 1 },
  stepArea: { borderRadius: radius.lg, padding: spacing.md },
  stepFooterRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  stepTimeField: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
