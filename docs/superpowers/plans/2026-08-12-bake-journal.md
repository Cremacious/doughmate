# Bake Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A bake journal: log a bake with a star rating, quick crumb tags, notes, the date, and optional links to a recipe and the starter used; browse it from a `Recipes | Bakes` segment inside the Recipes tab.

**Architecture:** A new self contained `bakes` store (own storage key). One tiny pure helper (`daysAgo`) drives the date label and is unit tested. New UI: a reusable `SegmentedControl`, a `StarRating`, a `BakeCard`, and a shared create/edit `bake-new` bottom sheet. The Recipes tab gains a segment; recipe detail and cook mode gain a log entry point. Recipe and starter links are stored as id plus a name snapshot. Additive only; existing stores, engines, and other storage keys are untouched.

**Tech Stack:** Expo SDK 57, React 19, React Native 0.86, TypeScript strict, Expo Router (typed routes), react-native-reanimated 4, i18next, Jest (pure lib only), pnpm.

## Global Constraints

- No hyphens or dashes in any user facing copy. Rewrite around them.
- All user facing strings via i18n `t('key.path')` in `src/i18n/en.json`. Never hardcode display text.
- Colors, spacing, radii, durations from theme tokens (`useAppTheme` / `src/theme.ts`). Never hardcode.
- No back buttons; the log sheet is a dismissible bottom sheet.
- Dark mode, reduced motion, floured fingers must hold on every new surface.
- Additive and self contained: a new store and new screens only. Do not modify the recipe or starter stores, engines, other storage keys, monetization, or notifications, except the small documented entry point additions to recipe detail and cook mode.
- Pure engine files under `src/lib` keep 100% Jest coverage; new pure logic is tested and registered in `jest.config.js` `collectCoverageFrom`.
- Verify every task with `pnpm typecheck` and `pnpm lint` (both clean), run from `app-src/`.
- Work on branch `redesign/proof`. Commit per task. Do not push.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/bake.ts` | Pure `daysAgo(bakedAt, now)` helper. |
| `src/lib/bake.test.ts` | Its tests. |
| `jest.config.js` | Register `src/lib/bake.ts`. |
| `src/state/bakes.tsx` | The bakes store: type, provider, methods, persistence. |
| `src/ui/SegmentedControl.tsx` | A pill segmented control. |
| `src/ui/StarRating.tsx` | A 1 to 5 star rating, read only or tappable. |
| `src/ui/BakeCard.tsx` | A bake summary card. |
| `app/bake-new.tsx` | The shared create/edit log a bake sheet. |
| `app/(tabs)/recipes.tsx` | Add the segment and the Bakes list. |
| `app/recipe/[id].tsx` | Add a Log a bake entry point. |
| `app/recipe/[id]/cook.tsx` | Add a Log this bake action on the final step. |
| `app/_layout.tsx` | Register `bake-new` and add `BakesProvider`. |
| `src/i18n/en.json` | All new copy. |

---

## Task 1: `daysAgo` pure helper

**Files:**
- Create: `src/lib/bake.ts`
- Create: `src/lib/bake.test.ts`
- Modify: `jest.config.js`

**Interfaces:**
- Produces: `daysAgo(bakedAt: number, now: number): number` — whole days between the two, by UTC day buckets. Same day is 0, previous day 1, and so on. A future `bakedAt` clamps to 0.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/bake.test.ts`:

```ts
import { daysAgo } from './bake';

const DAY = 86_400_000;
const HOUR = 3_600_000;

describe('daysAgo', () => {
  it('is 0 for the same UTC day', () => {
    const now = 100 * DAY + 5 * HOUR;
    expect(daysAgo(100 * DAY + 1 * HOUR, now)).toBe(0);
  });

  it('is 1 for the previous day', () => {
    const now = 100 * DAY + 5 * HOUR;
    expect(daysAgo(99 * DAY + 20 * HOUR, now)).toBe(1);
  });

  it('counts several days back', () => {
    const now = 100 * DAY;
    expect(daysAgo(93 * DAY, now)).toBe(7);
  });

  it('clamps a future time to 0', () => {
    const now = 100 * DAY;
    expect(daysAgo(101 * DAY, now)).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd app-src && pnpm test -- bake.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

Create `src/lib/bake.ts`:

```ts
// Whole days between two times, by UTC day buckets. Same day is 0. Used for the
// friendly bake date label ("Today", "Yesterday", "3 days ago").
const DAY_MS = 86_400_000;

export function daysAgo(bakedAt: number, now: number): number {
  const diff = Math.floor(now / DAY_MS) - Math.floor(bakedAt / DAY_MS);
  return diff > 0 ? diff : 0;
}
```

- [ ] **Step 4: Register coverage and run**

In `jest.config.js`, add `'src/lib/bake.ts',` to `collectCoverageFrom`.
Run: `cd app-src && pnpm test:coverage`
Expected: PASS, `bake.ts` at 100%.

- [ ] **Step 5: Typecheck, lint, commit**

Run: `cd app-src && pnpm typecheck && pnpm lint`.

```bash
git add app-src/src/lib/bake.ts app-src/src/lib/bake.test.ts app-src/jest.config.js
git commit -m "feat(bakes): daysAgo helper"
```

---

## Task 2: bakes store

**Files:**
- Create: `src/state/bakes.tsx`
- Modify: `app/_layout.tsx`

**Interfaces:**
- Produces: `Bake`, `BakeInput` types; `useBakes()` returning `{ bakes, addBake, updateBake, removeBake, restoreBake, getBake }`. `bakes` is sorted by `bakedAt` descending. `BakesProvider`.

- [ ] **Step 1: Create the store**

Create `src/state/bakes.tsx`. Mirror the shape of `src/state/starters.tsx` (read it first for the exact provider/commit pattern):

```tsx
// The bake journal. Each bake records how a loaf turned out, optionally linked to
// a recipe and the starter used (by id plus a name snapshot). Self contained.
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { storage } from '@/lib/storage';

export interface Bake {
  id: string;
  name: string;
  recipeId?: string;
  starterId?: string;
  starterName?: string;
  rating: number;
  tags: string[];
  notes?: string;
  bakedAt: number;
  createdAt: number;
}

export interface BakeInput {
  name: string;
  recipeId?: string;
  starterId?: string;
  starterName?: string;
  rating: number;
  tags: string[];
  notes?: string;
  bakedAt: number;
}

const STORAGE_KEY = 'doughmate.bakes.v1';

function loadBakes(): Bake[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as Bake[];
  } catch {
    return [];
  }
}

interface BakesContextValue {
  bakes: Bake[];
  addBake: (input: BakeInput) => Bake;
  updateBake: (id: string, input: BakeInput) => void;
  removeBake: (id: string) => void;
  restoreBake: (bake: Bake) => void;
  getBake: (id: string) => Bake | undefined;
}

const BakesContext = createContext<BakesContextValue | null>(null);

function sortByBakedAt(list: Bake[]): Bake[] {
  return [...list].sort((a, b) => b.bakedAt - a.bakedAt);
}

export function BakesProvider({ children }: { children: ReactNode }) {
  const [bakes, setBakes] = useState<Bake[]>(() => sortByBakedAt(loadBakes()));

  const value = useMemo<BakesContextValue>(() => {
    const commit = (next: Bake[]) => {
      const sorted = sortByBakedAt(next);
      storage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      setBakes(sorted);
    };
    const fromInput = (input: BakeInput, id: string, createdAt: number): Bake => ({
      id,
      name: input.name,
      recipeId: input.recipeId,
      starterId: input.starterId,
      starterName: input.starterName,
      rating: input.rating,
      tags: input.tags,
      notes: input.notes,
      bakedAt: input.bakedAt,
      createdAt,
    });
    return {
      bakes,
      addBake: (input) => {
        const bake = fromInput(input, `${Date.now()}-${Math.round(Math.random() * 1e6)}`, Date.now());
        commit([bake, ...bakes]);
        return bake;
      },
      updateBake: (id, input) =>
        commit(bakes.map((b) => (b.id === id ? fromInput(input, b.id, b.createdAt) : b))),
      removeBake: (id) => commit(bakes.filter((b) => b.id !== id)),
      restoreBake: (bake) => commit([bake, ...bakes]),
      getBake: (id) => bakes.find((b) => b.id === id),
    };
  }, [bakes]);

  return <BakesContext.Provider value={value}>{children}</BakesContext.Provider>;
}

export function useBakes(): BakesContextValue {
  const ctx = useContext(BakesContext);
  if (!ctx) {
    throw new Error('useBakes must be used inside a BakesProvider');
  }
  return ctx;
}
```

- [ ] **Step 2: Add the provider to the tree**

In `app/_layout.tsx`, import `BakesProvider` and nest it inside `RecipesProvider` (order is not critical; place it alongside `StartersProvider`). Example: wrap so the tree reads `... RecipesProvider > BakesProvider > StartersProvider > ...` (keep every existing provider).

- [ ] **Step 3: Typecheck, lint, commit**

Run: `cd app-src && pnpm typecheck && pnpm lint`.

```bash
git add app-src/src/state/bakes.tsx app-src/app/_layout.tsx
git commit -m "feat(bakes): bakes store and provider"
```

---

## Task 3: `SegmentedControl` and `StarRating`

**Files:**
- Create: `src/ui/SegmentedControl.tsx`
- Create: `src/ui/StarRating.tsx`

**Interfaces:**
- `SegmentedControl<T extends string>({ options: { id: T; label: string }[]; value: T; onChange: (id: T) => void })`.
- `StarRating({ value: number; onChange?: (v: number) => void; size?: number })` — read only when `onChange` is absent.

- [ ] **Step 1: Implement `SegmentedControl`**

Create `src/ui/SegmentedControl.tsx`. A sunken pill track with a raised selected segment:

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { radius, spacing, typography } from '@/theme';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (id: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { palette } = useAppTheme();
  return (
    <View style={[styles.track, { backgroundColor: palette.bgSunken }]}>
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => {
              triggerHaptic('select');
              onChange(o.id);
            }}
            style={[styles.seg, selected ? { backgroundColor: palette.bgSurface } : null]}
          >
            <Text
              style={[
                typography.title,
                { color: selected ? palette.textInk : palette.textSoft },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: radius.pill, padding: 4, gap: 4 },
  seg: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, borderRadius: radius.pill },
});

export default SegmentedControl;
```

- [ ] **Step 2: Implement `StarRating`**

Create `src/ui/StarRating.tsx`. Uses the butter accent for filled stars. The star glyph is a symbol, not translatable copy:

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { spacing } from '@/theme';

export interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 22 }: StarRatingProps) {
  const { palette } = useAppTheme();
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.row}>
      {stars.map((n) => {
        const filled = n <= value;
        const glyph = (
          <Text style={{ fontSize: size, color: filled ? palette.accentButter : palette.border }}>
            {'★'}
          </Text>
        );
        if (!onChange) {
          return <View key={n}>{glyph}</View>;
        }
        return (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={String(n)}
            onPress={() => {
              triggerHaptic('select');
              onChange(n);
            }}
            hitSlop={6}
          >
            {glyph}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
});

export default StarRating;
```

- [ ] **Step 3: Typecheck, lint, commit**

Run: `cd app-src && pnpm typecheck && pnpm lint`.

```bash
git add app-src/src/ui/SegmentedControl.tsx app-src/src/ui/StarRating.tsx
git commit -m "feat(bakes): SegmentedControl and StarRating primitives"
```

---

## Task 4: `BakeCard` and the Bakes list

**Files:**
- Create: `src/ui/BakeCard.tsx`
- Modify: `app/(tabs)/recipes.tsx`
- Modify: `src/i18n/en.json`

**Interfaces:**
- `BakeCard({ bake: Bake; now: number; onPress: () => void })`.
- Recipes tab shows a segment; the Bakes segment lists `BakeCard`s.

- [ ] **Step 1: Add the copy**

Add a `bakes` block to `en.json` (all hyphen and dash free):

```json
"bakes": {
  "seg_recipes": "Recipes",
  "seg_bakes": "Bakes",
  "empty_title": "No bakes yet.",
  "empty_body": "Log a bake to start your baking book.",
  "log_a_bake": "Log a bake",
  "today": "Today",
  "yesterday": "Yesterday",
  "days_ago": "{{count}} days ago",
  "tags": {
    "open_crumb": "open crumb", "tight_crumb": "tight crumb", "good_ear": "good ear",
    "big_spring": "big spring", "dark_crust": "dark crust", "pale_crust": "pale crust",
    "gummy": "gummy", "dense": "dense", "flat": "flat", "sour": "sour",
    "airy": "airy", "golden": "golden"
  }
}
```

- [ ] **Step 2: Implement `BakeCard`**

Create `src/ui/BakeCard.tsx`. Name + date, star rating (read only), up to three tag chips, and link chips for recipe (peach) and starter (teal) when present:

```tsx
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { daysAgo } from '@/lib/bake';
import type { Bake } from '@/state/bakes';
import { spacing, typography } from '@/theme';
import { Card } from './Card';
import { StarRating } from './StarRating';

export interface BakeCardProps {
  bake: Bake;
  now: number;
  onPress: () => void;
}

export function BakeCard({ bake, now, onPress }: BakeCardProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const d = daysAgo(bake.bakedAt, now);
  const dateLabel = d === 0 ? t('bakes.today') : d === 1 ? t('bakes.yesterday') : t('bakes.days_ago', { count: d });

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.head}>
        <Text style={[typography.display.md, styles.name, { color: palette.textInk }]}>{bake.name}</Text>
        <Text style={[typography.numeric.sm, { color: palette.textFaint }]}>{dateLabel}</Text>
      </View>
      <StarRating value={bake.rating} size={16} />
      {bake.tags.length > 0 ? (
        <View style={styles.tags}>
          {bake.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: palette.bgSunken }]}>
              <Text style={[typography.label, { color: palette.textSoft }]}>
                {t(`bakes.tags.${tag}` as 'bakes.tags.gummy')}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {bake.recipeId || bake.starterName ? (
        <View style={styles.links}>
          {bake.recipeId ? (
            <View style={[styles.linkChip, { backgroundColor: palette.primaryWash }]}>
              <Text style={[typography.label, { color: palette.primaryText }]}>{bake.name}</Text>
            </View>
          ) : null}
          {bake.starterName ? (
            <View style={[styles.linkChip, { backgroundColor: palette.proofTealWash }]}>
              <Text style={[typography.label, { color: palette.proofTealText }]}>{bake.starterName}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  name: { flexShrink: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2xs'], marginTop: spacing['2xs'] },
  tag: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2xs'], marginTop: spacing['2xs'] },
  linkChip: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4 },
});

export default BakeCard;
```

- [ ] **Step 3: Add the segment and Bakes list to the Recipes tab**

Read `app/(tabs)/recipes.tsx` first. Add local segment state and a `now` (a single `useState(() => Date.now())` is fine; no ticking needed for date labels). Render the `SegmentedControl` at the top of the `Screen` content. When the segment is `recipes`, render the existing recipe box exactly as today. When `bakes`, render the bakes list.

```tsx
const [segment, setSegment] = useState<'recipes' | 'bakes'>('recipes');
const { bakes } = useBakes();
const [now] = useState(() => Date.now());
// ...
// at the top of the Screen content:
<SegmentedControl
  options={[
    { id: 'recipes', label: t('bakes.seg_recipes') },
    { id: 'bakes', label: t('bakes.seg_bakes') },
  ]}
  value={segment}
  onChange={setSegment}
/>
```

The Screen `footer` becomes conditional: on `recipes` keep the New recipe button; on `bakes` show a `Button` label `t('bakes.log_a_bake')` that does `router.push('/bake-new')`. For the bakes body: if `bakes.length === 0`, a Sam empty state (mirror the recipes empty state, using `bakes.empty_title` / `bakes.empty_body`); else map `bakes` to `BakeCard` with `onPress={() => router.push(\`/bake-new?id=${b.id}\`)}`.

Keep the existing recipe empty state and tag filter behavior only inside the `recipes` segment.

- [ ] **Step 4: Typecheck, lint, manual check**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean).

Manual (dev server): the Recipes tab shows the segment; switching to Bakes shows the empty state and the Log a bake button; switching back shows recipes unchanged.

- [ ] **Step 5: Commit**

```bash
git add app-src/src/ui/BakeCard.tsx "app-src/app/(tabs)/recipes.tsx" app-src/src/i18n/en.json
git commit -m "feat(bakes): bake card and the Bakes segment"
```

---

## Task 5: `bake-new` log/edit sheet

**Files:**
- Create: `app/bake-new.tsx`
- Modify: `app/_layout.tsx`
- Modify: `src/i18n/en.json`

**Interfaces:**
- Route `/bake-new` (create), `/bake-new?id=<id>` (edit), `/bake-new?recipeId=<id>` (create prefilled from a recipe).

- [ ] **Step 1: Add the form copy**

Add under `bakes` in `en.json`:

```json
"new_title": "Log a bake",
"edit_title": "This bake",
"save": "Save bake",
"save_changes": "Save changes",
"delete": "Delete bake",
"field_name": "What did you bake?",
"name_placeholder": "Name this bake",
"link_recipe": "Link a recipe",
"field_when": "When",
"field_rating": "How did it turn out?",
"field_crumb": "Crumb",
"field_starter": "Starter used",
"pick_none": "None",
"field_notes": "Notes",
"notes_placeholder": "How did it go?",
"toast_saved": "Logged to your bakes.",
"toast_updated": "Bake updated.",
"toast_deleted": "Bake removed."
```

- [ ] **Step 2: Register the route**

In `app/_layout.tsx`, add a `Stack.Screen` for `bake-new` mirroring the `recipe-new` transparent modal registration.

- [ ] **Step 3: Build the sheet**

Create `app/bake-new.tsx`, a tall `BottomSheet`, mirroring `app/recipe-new.tsx` and `app/starter-new.tsx` conventions. Consume `useBakes` (`addBake`, `updateBake`, `getBake`, `removeBake`, `restoreBake`), `useRecipes` (`recipes`, `getRecipe`), `useStarters` (`starters`), `useToast`, `useLocalSearchParams`. Use `OptionSheet` overlays for the recipe and starter pickers, rendered as siblings of the ScrollView (the pattern from `app/(tabs)/convert.tsx`).

State and prefill:

```tsx
const TAG_IDS = ['open_crumb','tight_crumb','good_ear','big_spring','dark_crust','pale_crust','gummy','dense','flat','sour','airy','golden'] as const;

const { id, recipeId: paramRecipeId } = useLocalSearchParams<{ id?: string; recipeId?: string }>();
const existing = id ? getBake(id) : undefined;
const prefillRecipe = !existing && paramRecipeId ? getRecipe(paramRecipeId) : undefined;

const [name, setName] = useState(existing?.name ?? prefillRecipe?.name ?? '');
const [recipeId, setRecipeId] = useState<string | undefined>(existing?.recipeId ?? prefillRecipe?.id);
const [starterId, setStarterId] = useState<string | undefined>(existing?.starterId);
const [starterName, setStarterName] = useState<string | undefined>(existing?.starterName);
const [rating, setRating] = useState(existing?.rating ?? 4);
const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
const [notes, setNotes] = useState(existing?.notes ?? '');
const [bakedAt, setBakedAt] = useState(existing?.bakedAt ?? Date.now());
const [picker, setPicker] = useState<'recipe' | 'starter' | null>(null);
```

Save:

```tsx
const save = () => {
  const input: BakeInput = {
    name: name.trim() || t('bakes.new_title'),
    recipeId,
    starterId,
    starterName,
    rating,
    tags,
    notes: notes.trim() || undefined,
    bakedAt,
  };
  if (existing) {
    updateBake(existing.id, input);
    show({ message: t('bakes.toast_updated'), variant: 'confirmation' });
  } else {
    addBake(input);
    show({ message: t('bakes.toast_saved'), variant: 'confirmation' });
  }
  router.back();
};
```

Render inside the sheet (header title `existing ? t('bakes.edit_title') : t('bakes.new_title')`, footer save button labelled `existing ? t('bakes.save_changes') : t('bakes.save')`), a `ScrollView` with:
1. `field_name`: an `Input` bound to `name`, plus a `PickerField` (label `link_recipe`, value = the linked recipe name or empty) that opens the recipe picker.
2. `field_when`: a small day stepper. Show `daysAgo(bakedAt, now)` as the friendly label (today/yesterday/N days ago) with `Stepper`-style minus/plus, or two `Button`s; minus moves `bakedAt` back one day (`bakedAt - DAY_MS`), plus moves forward but never past `now`. Keep it simple and dependency free.
3. `field_rating`: `StarRating` with `onChange={setRating}`.
4. `field_crumb`: the tag chips. Map `TAG_IDS` to `Chip` with `label={t(\`bakes.tags.${id}\`)}`, `selected={tags.includes(id)}`, toggling membership on press.
5. `field_starter`: a `PickerField` (value = `starterName` or empty) opening the starter picker.
6. `field_notes`: a multiline `TextInput` styled like the notes field in `recipe-new.tsx`.
7. When editing, a destructive Delete `Button` that calls `removeBake(existing.id)`, `router.back()`, and shows the deleted toast with an undo action calling `restoreBake(existing)`.

After the `ScrollView`, render the picker `OptionSheet`s at the sheet root:

```tsx
{picker === 'recipe' ? (
  <OptionSheet
    title={t('bakes.link_recipe')}
    searchable
    searchPlaceholder={t('converter.picker_search_placeholder')}
    selectedId={recipeId ?? ''}
    onClose={() => setPicker(null)}
    onSelect={(rid) => {
      const r = getRecipe(rid);
      setRecipeId(rid);
      if (r && name.trim() === '') setName(r.name);
    }}
    options={recipes.map((r) => ({ id: r.id, label: r.name }))}
  />
) : null}
{picker === 'starter' ? (
  <OptionSheet
    title={t('bakes.field_starter')}
    selectedId={starterId ?? ''}
    onClose={() => setPicker(null)}
    onSelect={(sid) => {
      const s = starters.find((x) => x.id === sid);
      setStarterId(sid);
      setStarterName(s?.name);
    }}
    options={starters.map((s) => ({ id: s.id, label: s.name }))}
  />
) : null}
```

Import `DAY_MS`? Define `const DAY_MS = 86_400_000;` locally in the file for the day stepper. Import `daysAgo` from `@/lib/bake` for the label.

- [ ] **Step 4: Typecheck, lint, manual verification**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean). In the browser: open `/bake-new`, set a name, rating, some tags, save; the bake appears in the Bakes segment. Open `/bake-new?recipeId=<a real recipe id>` and confirm the name and recipe link prefill. Tap a bake card and confirm it opens prefilled for edit; edit and save; delete and undo.

- [ ] **Step 5: Commit**

```bash
git add app-src/app/bake-new.tsx app-src/app/_layout.tsx app-src/src/i18n/en.json
git commit -m "feat(bakes): log a bake create and edit sheet"
```

---

## Task 6: Entry points from recipe detail and cook mode

**Files:**
- Modify: `app/recipe/[id].tsx`
- Modify: `app/recipe/[id]/cook.tsx`
- Modify: `src/i18n/en.json`

- [ ] **Step 1: Add copy**

Add under `bakes` in `en.json`: `"log_this_bake": "Log this bake"`.

- [ ] **Step 2: Recipe detail entry point**

In `app/recipe/[id].tsx`, add a secondary control that opens `/bake-new?recipeId=<recipe.id>`. Place it near the footer: keep the primary "Start baking" and add a quiet "Log a bake" button (a `Button variant="quiet"` above the footer, or a second footer action). Use `t('bakes.log_a_bake')`. Do not disturb the existing scale, ingredients, method, delete, or start baking behavior.

- [ ] **Step 3: Cook mode entry point**

In `app/recipe/[id]/cook.tsx`, on the final step only (`last === true`), add a quiet secondary action "Log this bake" that navigates to `/bake-new?recipeId=<recipe.id>` (in addition to the existing "All done" primary which finishes and closes). Use `t('bakes.log_this_bake')`. Leave the step navigation otherwise unchanged.

- [ ] **Step 4: Typecheck, lint, manual verification**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean). In the browser: from a recipe detail, "Log a bake" opens the sheet prefilled with that recipe; from cook mode's last step, "Log this bake" does the same.

- [ ] **Step 5: Commit**

```bash
git add "app-src/app/recipe/[id].tsx" "app-src/app/recipe/[id]/cook.tsx" app-src/src/i18n/en.json
git commit -m "feat(bakes): log a bake from recipe detail and cook mode"
```

---

## Task 7: Verification sweep

**Files:** none expected (verify; fix forward if needed).

- [ ] **Step 1: Full gate**

Run from `app-src/`: `pnpm typecheck && pnpm lint && pnpm test:coverage`. Expected: clean; all suites pass; `src/lib` at 100% including `bake.ts`.

- [ ] **Step 2: Functional walk (browser)**

Log a freeform bake (no recipe, no starter) and a recipe linked bake with a starter; both appear in the Bakes segment with correct date labels, stars, tags, and link chips. Edit one, delete one with undo. Confirm the recipe segment still behaves exactly as before (tag filter, new recipe). Confirm a bake whose recipe you then delete still shows its name snapshot.

- [ ] **Step 3: Hyphen and dash audit**

Scan every string value in `src/i18n/en.json` for hyphen, en dash, em dash, minus sign, figure dash. Expected: none.

- [ ] **Step 4: Accessibility modes**

With the Bakes segment and the log sheet open, verify light and dark, normal and floured fingers, reduced motion: no clipped content, tap targets large, tokens honored.

- [ ] **Step 5: Final commit if fixes were made**

```bash
git add -A
git commit -m "chore(bakes): verification fixes"
```
(Skip if no changes.)

---

## Self-Review

**Spec coverage:**
- Segmented Recipes / Bakes in the Recipes tab → Task 3 (`SegmentedControl`), Task 4 (integration).
- Bake list + cards with rating, tags, links → Task 4 (`BakeCard`).
- Log a bake with rating, crumb tags, notes, date, recipe and starter links → Task 5.
- id plus name snapshot for links → Task 2 (`Bake` shape), Task 5 (save snapshots name/starterName), Task 4 (card reads snapshots).
- Three entry points → Task 4 (list), Task 6 (recipe detail, cook mode).
- New self contained store, additive → Task 2.
- Day label without a date picker dependency → Task 1 (`daysAgo`), Task 5 (day stepper).
- Edit and delete with undo → Task 5.
- Empty state, freeform bakes, snapshot survival → Tasks 4, 5, 7.
- 100% coverage for new pure logic → Task 1, Task 7.

**Placeholder scan:** No TBD/TODO. UI-heavy Tasks 4 to 6 carry state shapes, key snippets, and named references to existing components (`OptionSheet`, `PickerField`, `Chip`, `Stepper`, `BottomSheet`, `Button`, `Card`) with the convert/recipe/starter files named as the patterns to mirror. Verification steps list concrete checks.

**Type consistency:** `Bake`/`BakeInput` defined in Task 2 and consumed by `BakeCard` (Task 4), `bake-new` (Task 5). `daysAgo(bakedAt, now)` defined in Task 1, used in `BakeCard` and `bake-new`. `SegmentedControl`/`StarRating` defined in Task 3, used in Task 4 and Task 5. Store methods (`addBake`/`updateBake`/`getBake`/`removeBake`/`restoreBake`) defined in Task 2, consumed in Tasks 4 and 5. i18n keys (`bakes.*`, `bakes.tags.*`) added in the tasks that use them.
