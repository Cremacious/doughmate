# Recipe Feature Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the recipe feature to real recipe app parity: touch friendly stacked card ingredient entry, ingredient sections, per step time metadata, editing existing recipes, and a clean servings based Scale control.

**Architecture:** Extend the flat Recipe v2 model with one optional `section?` field on each ingredient (no new migration). A pure `groupBySection` helper turns the flat list into ordered groups for the detail read view. The editor (`recipe-new`) becomes a shared create/edit screen using nested section drafts that flatten to the stored shape on save; the detail sheet gains a servings stepper and an Edit entry point. Everything is presentation plus the additive field; engines, storage keys, and monetization are untouched.

**Tech Stack:** Expo SDK 57, React 19, React Native 0.86, TypeScript strict, Expo Router (typed routes), react-native-reanimated 4, react-native-gesture-handler, i18next, Jest (pure lib only), pnpm.

## Global Constraints

- No hyphens or dashes in any user facing copy. Rewrite around them.
- All user facing strings via i18n `t('key.path')` in `src/i18n/en.json`. Never hardcode.
- Colors, spacing, radii, durations from theme tokens only (`src/theme.ts` / `useAppTheme`). Never hardcode.
- No back buttons anywhere. Editor and detail are dismissible bottom sheets.
- Dark mode, reduced motion, and floured fingers must hold on every new surface.
- Only presentation and the additive optional `section?` field change. Engines (`src/lib`), storage keys, monetization, notifications stay untouched.
- Pure engine files under `src/lib` keep 100% Jest coverage; new pure logic must be tested and registered in `jest.config.js` `collectCoverageFrom`.
- Verify every task with `pnpm typecheck` and `pnpm lint` (both must pass clean). Run from `app-src/`.
- Work on branch `redesign/proof`. Commit per task. Do not push unless the user says "sync".

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/recipe.ts` | Add pure `groupBySection` helper (read side grouping). Existing scaling reused unchanged. |
| `src/lib/recipe.test.ts` | Tests for `groupBySection`. |
| `jest.config.js` | Already lists `src/lib/recipe.ts`; no change. |
| `src/state/recipes.tsx` | Add optional `section?: string` to `RecipeIngredient`. No signature changes. |
| `src/ui/UnitPickerField.tsx` | New. A labeled button that shows the current unit word and opens a unit OptionSheet. |
| `app/recipe-new.tsx` | Rework into the shared create/edit editor: nested section drafts, stacked ingredient cards, step cards with time, flatten on save, edit pre fill via `id` param. |
| `app/recipe/[id].tsx` | Servings based Scale control, sectioned ingredient render via `groupBySection`, step time pills, Edit button, spacing pass. |
| `src/i18n/en.json` | New keys for editor and detail (added within the tasks that use them). |

---

## Task 1: Data model field + `groupBySection` helper

**Files:**
- Modify: `src/state/recipes.tsx` (the `RecipeIngredient` interface)
- Modify: `src/lib/recipe.ts` (add helper + types)
- Test: `src/lib/recipe.test.ts`

**Interfaces:**
- Consumes: `RecipeIngredient` shape `{ amount: number | ''; unit: string; item: string; section?: string }`.
- Produces:
  - `RecipeIngredient.section?: string` (optional) on the store type.
  - `interface IngredientGroup { section?: string; items: RecipeIngredient[] }`
  - `function groupBySection(ingredients: RecipeIngredient[]): IngredientGroup[]` — groups by section name in first appearance order; items keep original order; `section` is `undefined` for the leading unlabeled group.

- [ ] **Step 1: Add the `section?` field to the store type**

In `src/state/recipes.tsx`, extend the interface:

```ts
export interface RecipeIngredient {
  amount: number | '';
  unit: string;
  item: string;
  /** Optional section name (e.g. "Dough"). Absent = the leading unlabeled group. */
  section?: string;
}
```

No other change in this file: `RecipeInput.ingredients` already carries `RecipeIngredient[]`, and `addRecipe`/`updateRecipe` pass it through unchanged.

- [ ] **Step 2: Write the failing test for `groupBySection`**

Add to `src/lib/recipe.test.ts`:

```ts
import {
  bakersPercentages,
  groupBySection,
  matchFactor,
  parseIngredientLine,
  parseLeadingQuantity,
  scaleRecipeText,
  scaleText,
} from './recipe';

describe('groupBySection', () => {
  it('puts ingredients with no section into one leading unlabeled group', () => {
    const groups = groupBySection([
      { amount: 2, unit: '', item: 'eggs' },
      { amount: 1, unit: 'cup', item: 'flour' },
    ]);
    expect(groups).toEqual([
      {
        section: undefined,
        items: [
          { amount: 2, unit: '', item: 'eggs' },
          { amount: 1, unit: 'cup', item: 'flour' },
        ],
      },
    ]);
  });

  it('groups by section name in first appearance order, keeping item order', () => {
    const groups = groupBySection([
      { amount: 500, unit: 'g', item: 'bread flour', section: 'Dough' },
      { amount: 350, unit: 'g', item: 'water', section: 'Dough' },
      { amount: 2, unit: 'tbsp', item: 'semolina', section: 'Finish' },
    ]);
    expect(groups.map((g) => g.section)).toEqual(['Dough', 'Finish']);
    expect(groups[0]!.items.map((i) => i.item)).toEqual(['bread flour', 'water']);
    expect(groups[1]!.items.map((i) => i.item)).toEqual(['semolina']);
  });

  it('collects non contiguous items of the same section together', () => {
    const groups = groupBySection([
      { amount: 1, unit: '', item: 'a', section: 'X' },
      { amount: 1, unit: '', item: 'b', section: 'Y' },
      { amount: 1, unit: '', item: 'c', section: 'X' },
    ]);
    expect(groups.map((g) => g.section)).toEqual(['X', 'Y']);
    expect(groups[0]!.items.map((i) => i.item)).toEqual(['a', 'c']);
  });

  it('treats an empty string section as the unlabeled group', () => {
    const groups = groupBySection([{ amount: 1, unit: '', item: 'a', section: '' }]);
    expect(groups).toEqual([{ section: undefined, items: [{ amount: 1, unit: '', item: 'a', section: '' }] }]);
  });

  it('returns an empty array for no ingredients', () => {
    expect(groupBySection([])).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd app-src && pnpm test -- recipe.test.ts -t groupBySection`
Expected: FAIL with `groupBySection is not a function` (or an import error).

- [ ] **Step 4: Implement `groupBySection`**

Add to `src/lib/recipe.ts` (after `bakersPercentages`). Note the store owns `RecipeIngredient`; to avoid a state->lib import cycle, define a local structural type in the lib:

```ts
/** Structural ingredient shape for grouping. Matches state RecipeIngredient. */
export interface SectionedIngredient {
  amount: number | '';
  unit: string;
  item: string;
  section?: string;
}

export interface IngredientGroup {
  section?: string;
  items: SectionedIngredient[];
}

/** Group ingredients by section name, first appearance order, items in original order. */
export function groupBySection(ingredients: SectionedIngredient[]): IngredientGroup[] {
  const groups: IngredientGroup[] = [];
  const byKey = new Map<string, IngredientGroup>();
  for (const ing of ingredients) {
    const key = ing.section ?? '';
    let group = byKey.get(key);
    if (!group) {
      group = { section: key === '' ? undefined : key, items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.items.push(ing);
  }
  return groups;
}
```

- [ ] **Step 5: Run the tests to verify they pass and coverage holds**

Run: `cd app-src && pnpm test:coverage`
Expected: PASS, all suites green, `recipe.ts` at 100%.

- [ ] **Step 6: Typecheck and commit**

Run: `cd app-src && pnpm typecheck && pnpm lint`
Expected: both clean.

```bash
git add app-src/src/lib/recipe.ts app-src/src/lib/recipe.test.ts app-src/src/state/recipes.tsx
git commit -m "feat(recipes): add section field and groupBySection helper"
```

---

## Task 2: Shared create/edit recipe editor

**Files:**
- Create: `src/ui/UnitPickerField.tsx`
- Modify: `app/recipe-new.tsx` (full rework)
- Modify: `app/_layout.tsx` (only if a dedicated edit route is chosen — see Step 7)
- Modify: `src/i18n/en.json` (editor keys)

**Interfaces:**
- Consumes: `useRecipes()` (`addRecipe`, `updateRecipe`, `getRecipe`), `RecipeIngredient`/`RecipeStep`/`RecipeInput` from `@/state/recipes`; `useToast`, `BottomSheet`, `Button`, `Card`, `Chip`, `Input`, `OptionSheet`, `Stepper` from `@/ui`; `useLocalSearchParams`, `router` from `expo-router`.
- Produces: the editor screen reachable at `/recipe-new` (create) and `/recipe-new?id=<id>` (edit). `UnitPickerField` component: `{ value: string; onPress: () => void }`.

- [ ] **Step 1: Add editor i18n keys**

Add under `recipes` in `src/i18n/en.json` (keep existing keys). All copy free of hyphens and dashes:

```json
"edit_title": "Edit recipe",
"add_ingredient": "Add ingredient",
"add_section": "Section",
"add_step": "Add step",
"section_name_placeholder": "Section name",
"ingredient_item_placeholder": "Ingredient",
"ingredient_amount_placeholder": "Amt",
"unit_none": "no unit",
"unit_label": "Unit",
"step_text_placeholder": "Describe this step",
"step_time_placeholder": "Time (optional)",
"step_time_label": "Time",
"save_changes": "Save changes"
```

- [ ] **Step 2: Create `UnitPickerField`**

Create `src/ui/UnitPickerField.tsx`. Mirrors `PickerField` but shows the unit word (or the "no unit" placeholder) and a chevron:

```tsx
// A labeled button showing the current unit, opens a unit picker on press.
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, spacing, typography } from '@/theme';

export interface UnitPickerFieldProps {
  value: string;
  placeholder: string;
  onPress: () => void;
}

export function UnitPickerField({ value, placeholder, onPress }: UnitPickerFieldProps) {
  const { palette, fontScale } = useAppTheme();
  const floured = fontScale > 1;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.field,
        { height: floured ? 64 : 56, backgroundColor: palette.bgSurface, borderColor: palette.border },
      ]}
    >
      <Text
        style={[typography.body.lg, { color: value ? palette.textInk : palette.textFaint }]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <Text style={[typography.body.md, { color: palette.textFaint }]}>▾</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
});

export default UnitPickerField;
```

- [ ] **Step 3: Rework `app/recipe-new.tsx` — editor state model and helpers**

Replace the file. Use nested section drafts that flatten to the stored flat shape on save. Draft types and mapping:

```tsx
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
```

Note imports needed: `groupBySection` from `@/lib/recipe`; `Recipe`, `RecipeInput`, `RecipeIngredient`, `RecipeStep`, `useRecipes` from `@/state/recipes`.

- [ ] **Step 4: Rework `app/recipe-new.tsx` — component body**

The component reads an optional `id` param (`useLocalSearchParams<{ id?: string }>()`), pre fills from `getRecipe(id)` when present, and renders the editor inside a tall `BottomSheet`. Sheets for the unit picker render at the sheet root (outside the ScrollView) to avoid the clipping issue fixed in Convert. Structure:

```tsx
export default function RecipeEditorSheet() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
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
          ? { ...sec, ingredients: sec.ingredients.map((ing, ii) => (ii === i ? { ...ing, ...patch } : ing)) }
          : sec
      )
    );
  const addIngredient = (s: number) =>
    setSections((prev) =>
      prev.map((sec, si) => (si === s ? { ...sec, ingredients: [...sec.ingredients, emptyIngredient()] } : sec))
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
  ...
}
```

Render, inside `<BottomSheet size="tall" onClose={() => router.back()} header={<title>} footer={<Button save/>}>`:
1. A `<ScrollView>` with:
   - `Input` for name; a row with `Input` yield and a `Stepper` for servings (label "Serves").
   - Ingredients label. For each section (index `s`): if `s > 0` OR the user named it, render a section name `Input` (placeholder `section_name_placeholder`); for each ingredient render an **ingredient card** (option A layout): item `Input` on top, then a row of amount `Input` (numeric, ~96px wide) + `UnitPickerField` (flex 1, opens `setUnitPicker({s,i})`), plus a delete `Pressable` (the `✕`, 48px) that calls `removeIngredient`. Then a `+ Add ingredient` dashed button per section.
   - A `+ Section` dashed button after the sections.
   - Method label. For each step render a **step card**: a numbered badge, a multiline `Input`/`TextInput` for text, an `Input` for time (placeholder `step_time_placeholder`), and a delete. Then `+ Add step`.
   - Tags label + `Chip` row (reuse the existing `TAG_KEYS` pattern from the current file).
2. After `</ScrollView>` but still inside the sheet, render the unit `OptionSheet` overlay when `unitPicker !== null`:

```tsx
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
```

Style with tokens only. Ingredient card: `Card`-like, `gap: spacing.sm`. Amount `Input` uses `numeric`. Reuse spacing scale for a roomy feel (`gap: spacing.lg` between sections, `spacing.sm` within a card).

- [ ] **Step 5: Typecheck and lint**

Run: `cd app-src && pnpm typecheck && pnpm lint`
Expected: both clean. Fix unused imports (remove the old textarea approach entirely).

- [ ] **Step 6: Manual verification — create flow**

Ensure the dev server runs (`pnpm expo start --web --port 8081` via the launch config). In the browser at `http://localhost:8081/recipe-new`:
- Add two sections ("Dough", "Finish"), ingredients in each, a couple of steps with a time on one.
- Save. Reload `http://localhost:8081`, open Recipes, confirm the new recipe shows the right ingredient and step counts.
- Confirm via `localStorage['doughmate.recipes.v2']` that ingredients carry the `section` names and one step carries `time`.

- [ ] **Step 7: Wire the edit route param**

The Edit button (built in Task 3) navigates to `/recipe-new?id=<id>`. Confirm `useLocalSearchParams<{ id?: string }>()` reads it and pre fills. `recipe-new` is already registered as a transparent modal in `app/_layout.tsx`; a query param needs no new route. Only if Expo Router typed routes reject the query form, add a `recipe/[id]/edit.tsx` route that renders the same editor component and register it in `_layout.tsx` mirroring `recipe/[id]`. Prefer the query param; note which was used in the commit message.

- [ ] **Step 8: Commit**

```bash
git add app-src/app/recipe-new.tsx app-src/src/ui/UnitPickerField.tsx app-src/src/i18n/en.json
# add app-src/app/_layout.tsx only if the edit route fallback was used
git commit -m "feat(recipes): stacked card create/edit editor with sections and step times"
```

---

## Task 3: Detail rework — Scale control, sections, step times, Edit

**Files:**
- Modify: `app/recipe/[id].tsx`
- Modify: `src/i18n/en.json` (detail keys)

**Interfaces:**
- Consumes: `groupBySection` from `@/lib/recipe`; `formatQuantity` from `@/lib/convert`; `useRecipes`, `RecipeIngredient` from `@/state/recipes`; existing `Stepper`, `Card`, `Button`, `BottomSheet`, `useToast`; `router`, `useLocalSearchParams`.
- Produces: the reworked detail sheet at `/recipe/[id]`.

- [ ] **Step 1: Add detail i18n keys**

Add under `recipes` in `src/i18n/en.json`:

```json
"serves": "Serves",
"reset": "Reset",
"edit": "Edit"
```

(`now_at`, `scale_heading`, `ingredients_heading`, `method_heading`, `notes_heading`, `bakers_pct`, `bakers_locked`, `bakers_empty`, `start_baking`, `delete_recipe`, `button_undo`, `toast_deleted` already exist and are reused.)

- [ ] **Step 2: Replace the Scale control**

In `app/recipe/[id].tsx`, the scale factor already derives from a servings stepper (`factor = servings / baseServings`). Rework the Scale `Card` to the approved layout:

```tsx
const scaled = factor !== 1;
// ...
<Text style={[typography.label, { color: palette.textSoft }]}>{t('recipes.scale_heading')}</Text>
<Card style={styles.scaleCard}>
  <View style={styles.scaleTop}>
    <Text style={[typography.body.lg, { color: palette.textInk }]}>{t('recipes.serves')}</Text>
    <Stepper
      value={Math.max(1, Math.round(baseServings * factor))}
      onChange={(v) => setFactor(v / baseServings)}
    />
  </View>
  {scaled ? (
    <View style={[styles.scaleNote, { borderTopColor: palette.border }]}>
      <Text style={[typography.numeric.sm, { color: palette.primaryText }]}>
        {t('recipes.now_at', { factor: formatQuantity(factor) })}
      </Text>
      <Pressable accessibilityRole="button" onPress={() => setFactor(1)}>
        <Text style={[typography.label, { color: palette.textSoft }]}>↺ {t('recipes.reset')}</Text>
      </Pressable>
    </View>
  ) : null}
</Card>
```

Remove the old `FACTOR_CHIPS` array, the `chips` row, and the `0.5x / 1x / 2x` `Chip` block entirely.

Styles:
```ts
scaleCard: { gap: spacing.md },
scaleTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
scaleNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: spacing.sm },
```

- [ ] **Step 3: Render ingredients grouped by section**

Replace the flat ingredient map with grouped rendering via `groupBySection(recipe.ingredients)`. Keep the existing `ingredientText(ing, factor)` helper (amount recompute). Emit a teal section pill (using `proofTealWash`/`proofTealText`) before each named group; the unlabeled group emits no pill:

```tsx
<Card style={styles.list}>
  {groupBySection(recipe.ingredients).map((group, gi) => (
    <View key={gi} style={styles.group}>
      {group.section ? (
        <View style={[styles.sectionPill, { backgroundColor: palette.proofTealWash }]}>
          <Text style={[typography.label, { color: palette.proofTealText }]}>{group.section}</Text>
        </View>
      ) : null}
      {group.items.map((ing, ii) => (
        <View key={ii} style={styles.ingRow}>
          <Text style={[typography.numeric.sm, styles.ingAmt, { color: palette.primary }]}>
            {ingAmountText(ing, factor)}
          </Text>
          <Text style={[typography.body.lg, styles.ingItem, { color: palette.textInk }]}>{ing.item}</Text>
        </View>
      ))}
    </View>
  ))}
</Card>
```

Add a small `ingAmountText(ing, factor)` that returns just the scaled amount plus unit (e.g. `750 g`), since item is now rendered separately:

```tsx
function ingAmountText(ing: RecipeIngredient, factor: number): string {
  if (typeof ing.amount !== 'number') return ing.unit;
  const scaled = formatQuantity(ing.amount * factor);
  return ing.unit ? `${scaled} ${ing.unit}` : scaled;
}
```

Styles:
```ts
group: { gap: spacing.xs },
sectionPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 5, marginBottom: spacing['2xs'] },
ingRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md, paddingVertical: spacing['2xs'] },
ingAmt: { minWidth: 66 },
ingItem: { flexShrink: 1 },
```

- [ ] **Step 4: Add step time pills and the Edit button**

Steps already render numbered; ensure each step with `step.time` shows a teal pill (the existing code renders `step.time` in `proofTeal` body text — upgrade it to a pill style matching the mockup):

```tsx
{step.time ? (
  <View style={[styles.timePill, { backgroundColor: palette.proofTealWash }]}>
    <Text style={[typography.body.sm, { color: palette.proofTealText }]}>⏱ {step.time}</Text>
  </View>
) : null}
```
Style: `timePill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4, marginTop: spacing['2xs'] }`.

Add an Edit button in the sheet header row (title left, Edit + nothing-else right; the sheet already dismisses via drag/scrim so no close glyph is required, matching other sheets). Put it in the `header` prop as a row:

```tsx
header={
  <View style={styles.headerRow}>
    <Text style={[typography.display.lg, styles.title, { color: palette.textInk }]}>{recipe.name}</Text>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('recipes.edit')}
      onPress={() => router.push(`/recipe-new?id=${recipe.id}`)}
      style={[styles.editBtn, { backgroundColor: palette.bgSunken }]}
    >
      <Text style={[typography.title, { color: palette.textInk }]}>✎ {t('recipes.edit')}</Text>
    </Pressable>
  </View>
}
```
Styles: `headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.xs }`, `editBtn: { height: 40, paddingHorizontal: spacing.md, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }`. Adjust the existing `title` style (drop the centering now that it shares a row).

Note: the `BottomSheet` header sits in a centered drag area. If the header row does not stretch full width there, wrap it so it uses `alignSelf: 'stretch'`; verify visually in Step 6 and adjust.

- [ ] **Step 5: Spacing pass**

Increase vertical rhythm: ensure each section `label` has `marginTop`/consistent gap, the body `gap` is at least `spacing.sm`, and cards use `spacing.md` internal gaps. Keep the footer (`Delete` + `Start baking`) unchanged.

- [ ] **Step 6: Typecheck, lint, manual verification**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean).

In the browser, open a recipe with sections and a step time:
- Scale card shows only the Serves stepper at the original count; after tapping `+`, the `Now at ...×` + `Reset` row appears; amounts recompute; Reset returns to original.
- Ingredients render under their section pills; the unlabeled group shows no pill.
- Step time renders as a teal pill.
- Tap `✎ Edit` → the editor opens pre filled with the recipe's sections, ingredients, steps, and tags. Change something, Save, confirm the detail reflects it.
- Toggle dark mode and reduced motion (via Settings) and confirm the detail and editor still read correctly with no layout breakage.

- [ ] **Step 7: Commit**

```bash
git add app-src/app/recipe/[id].tsx app-src/src/i18n/en.json
git commit -m "feat(recipes): servings scale control, sectioned ingredients, step time pills, edit"
```

---

## Task 4: Backward compatibility + final verification sweep

**Files:** none expected (verification only; fix forward if issues surface).

- [ ] **Step 1: Backward compatibility check with a pre change recipe**

In the browser console, seed a v2 recipe with no `section` on ingredients and no `time` on steps (or use an existing migrated one), then open it:
- Detail renders it with no section pills and no time pills (unlabeled group only).
- Opening the editor pre fills a single unlabeled section and the steps with empty time fields.
- Saving it back does not introduce spurious sections.

- [ ] **Step 2: Full gate**

Run from `app-src/`:
```bash
pnpm typecheck && pnpm lint && pnpm test:coverage
```
Expected: typecheck clean, lint clean, all Jest suites pass, `src/lib` at 100% coverage.

- [ ] **Step 3: Hyphen and dash audit of new copy**

Scan every string value in `src/i18n/en.json` for hyphen, en dash, em dash, minus sign, and figure dash. Expected: none. Fix any by rewording.

- [ ] **Step 4: Accessibility modes on the two screens**

With the recipe editor and detail open, verify in light and dark, at normal and floured fingers scale, and with reduced motion on: no clipped content, tap targets stay large, colors come from tokens. Fix any hardcoded color or clipped sheet inline.

- [ ] **Step 5: Final commit if any fixes were made**

```bash
git add -A
git commit -m "chore(recipes): backward compatibility and accessibility verification fixes"
```
(Skip if Steps 1 to 4 produced no changes.)

---

## Self-Review

**Spec coverage:**
- Structured stacked card ingredient entry → Task 2 (Steps 3 to 6).
- Ingredient sections (flat `section?`) → Task 1 (field + helper), Task 2 (editor nested drafts flatten to it), Task 3 (grouped render).
- Per step time metadata → model already had `time?`; editor entry Task 2, detail pill Task 3.
- Edit existing recipes → Task 2 (shared editor, `id` param, `updateRecipe`), Task 3 (Edit button).
- Servings based Scale control → Task 3 (Step 2).
- Spacing/layout pass on detail → Task 3 (Steps 3 to 5).
- Backward compatibility, no new migration → Task 1 (optional field), Task 4 (Step 1).
- Non goals (reorder, live timers, check off, photos, import) → excluded from all tasks.
- Testing and coverage → Task 1 (TDD helper), Task 4 (Step 2).

**Placeholder scan:** No TBD/TODO. UI steps carry real component code, state shapes, and mapping functions; the one deferred choice (query param vs edit route) has both paths spelled out with a default. Manual verification steps list concrete checks rather than "test it".

**Type consistency:** `RecipeIngredient` gains `section?` in Task 1 and is consumed with that shape in Tasks 2 and 3. `groupBySection` returns `IngredientGroup[]` (`{ section?, items }`) in Task 1 and is destructured as `group.section` / `group.items` in Tasks 2 and 3. Editor draft types (`IngredientDraft`, `SectionDraft`, `StepDraft`) are defined and used only within Task 2. `toRecipeInput` returns `RecipeInput` matching `addRecipe`/`updateRecipe`. `ingAmountText`/`ingredientText` names are distinct and each defined where used.
