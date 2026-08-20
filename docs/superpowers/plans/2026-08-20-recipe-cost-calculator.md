# Recipe Cost Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Pro-gated cost breakdown to the Recipe Detail screen — each ingredient's line cost, a recipe total, and a cost-per-serving — computed from a reusable, user-entered ingredient price list that is managed from Settings.

**Architecture:** One new pure module (`src/lib/cost.ts`) holds every calculation and is unit tested in isolation. One new state provider (`src/state/ingredientPrices.tsx`) persists the price list to MMKV under `doughmate.ingredientPrices.v1`, following the exact shape of `src/state/starters.tsx`. Two new sheet routes (`app/price-new.tsx` to add/edit one price, `app/prices.tsx` to review them all) follow the existing `starter-new.tsx` / settings-sheet patterns. The Cost card itself is a new sub-section inside the *existing* `isPro` branch on `app/recipe/[id].tsx`, exactly where the levain calculator was added.

**Tech Stack:** React Native 0.86, Expo SDK 57, Expo Router, TypeScript, Jest (`jest-expo`), i18next.

## Global Constraints

- **All work happens in `/home/chris/Code/doughmate/app-src`.** Every path in this plan is relative to that directory, and every command must be run from it.
- **USD only.** No currency selection, no locale currency formatting. Money renders as `$X.XX` via the single `formatUsd` helper defined in Task 1.
- **No new dependencies.** Everything here is arithmetic over the existing `src/lib/convert.ts` engine plus existing UI components.
- **No new Expo API surface.** This feature uses only `expo-router`'s `router` and `useLocalSearchParams`, both already used across the app. Per `app-src/AGENTS.md`, if you find yourself reaching for any Expo API not already imported somewhere in this repo, stop and read https://docs.expo.dev/versions/v57.0.0/ for that exact version first.
- **All new user-facing strings go in `src/i18n/en.json`.** `src/i18n/i18next.d.ts` types `t()` against that file, so a key that is not in `en.json` is a typecheck error, not a runtime surprise. Existing key style is snake_case.
- **Pro gating reuses the existing gate.** The Cost card lives inside the `isPro ? (...) : (...)` branch already present in `app/recipe/[id].tsx` — no new paywall check, no second locked card. The prices *management* screen (`app/prices.tsx`) is deliberately **not** gated: it only lists data the user typed, and gating it would strand a free user's previously-entered prices.
- **Follow existing code style:** a short `//` file-header comment explaining the "why" of the file, and otherwise comments only where non-obvious reasoning needs recording. Match the surrounding files.
- **Verification commands** (run from `app-src`): `npm test`, `npm run typecheck`, `npm run lint`. The full suite is currently 240 passing tests — it must still be green (plus the new ones) at every commit.

## Design decisions this plan locks in

Two points the spec left open, resolved here so implementers do not have to guess:

1. **Package sizes are entered in weight units only (`g` / `oz` / `lb`).** The spec's own example is "$4.99 for a 5 lb bag". Allowing volume package sizes would require a density lookup at *entry* time as well as at costing time, and dry goods are sold by weight. This is a deliberate narrowing, not an oversight.
2. **Weight-resolvability is checked before price lookup.** An ingredient whose amount cannot be turned into grams shows "can't estimate this one" *even if* it has no price yet. The alternative — showing "Add price" on a row that still could not be costed after the price was added — is a dead end for the user.

The spec's stored shape `{ ingredientName, pricePerGram, updatedAt }` is kept and **extended** with three optional fields (`price`, `packageAmount`, `packageUnit`) recording what the baker actually typed, so reopening the editor shows "4.99 / 5 lb" rather than a raw price-per-gram they never entered. Optional fields mean older records stay valid.

---

### Task 1: `src/lib/cost.ts` — all cost arithmetic, pure and tested

**Files:**
- Create: `src/lib/cost.ts`
- Test: `src/lib/cost.test.ts`

**Interfaces:**
- Consumes: `convertWeight`, `getIngredient`, `isVolumeUnit`, `isWeightUnit`, `toGrams`, `type ConvertOptions`, `type WeightUnit` — all already exported from `src/lib/convert.ts`.
- Produces, all exported from `src/lib/cost.ts` and consumed by Tasks 2–5:
  - `interface IngredientPrice { ingredientName: string; pricePerGram: number; updatedAt: number; price?: number; packageAmount?: number; packageUnit?: WeightUnit }`
  - `interface CostIngredient { amount: number | ''; unit: string; item: string }`
  - `type CostStatus = 'priced' | 'no_price' | 'no_weight'`
  - `interface CostRow { item: string; status: CostStatus; cost: number | null }`
  - `interface RecipeCost { rows: CostRow[]; total: number; perServing: number | null; pricedCount: number; unpricedCount: number; unknownCount: number }`
  - `function priceKey(name: string): string`
  - `function pricePerGram(price: number, packageAmount: number, packageUnit: WeightUnit): number`
  - `function ingredientGrams(ingredient: CostIngredient, opts?: ConvertOptions): number | null`
  - `function recipeCost(ingredients: CostIngredient[], prices: IngredientPrice[], servings: number, opts?: ConvertOptions): RecipeCost`
  - `function upsertPrice(list: IngredientPrice[], entry: IngredientPrice): IngredientPrice[]`
  - `function formatUsd(value: number): string`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/cost.test.ts` with exactly this content:

```ts
import {
  formatUsd,
  type IngredientPrice,
  ingredientGrams,
  priceKey,
  pricePerGram,
  recipeCost,
  upsertPrice,
} from './cost';

const priced = (ingredientName: string, perGram: number): IngredientPrice => ({
  ingredientName,
  pricePerGram: perGram,
  updatedAt: 0,
});

describe('priceKey', () => {
  it('is case and whitespace insensitive', () => {
    expect(priceKey('  Bread Flour ')).toBe('bread flour');
    expect(priceKey('BREAD   FLOUR')).toBe('bread flour');
  });
});

describe('pricePerGram', () => {
  it('divides price by the package weight in grams', () => {
    expect(pricePerGram(10, 1000, 'g')).toBeCloseTo(0.01, 10);
  });

  it('round trips a pounds package back to its price', () => {
    const perGram = pricePerGram(4.99, 5, 'lb');
    expect(perGram * 5 * 453.592).toBeCloseTo(4.99, 6);
  });

  it('throws on a package size that is zero or negative', () => {
    expect(() => pricePerGram(4.99, 0, 'lb')).toThrow();
    expect(() => pricePerGram(4.99, -1, 'lb')).toThrow();
  });

  it('throws on a negative price', () => {
    expect(() => pricePerGram(-1, 5, 'lb')).toThrow();
  });
});

describe('ingredientGrams', () => {
  it('converts a weight unit without needing a density', () => {
    expect(ingredientGrams({ amount: 2, unit: 'lb', item: 'Anything at all' })).toBeCloseTo(
      907.184,
      3
    );
    expect(ingredientGrams({ amount: 250, unit: 'g', item: 'Water' })).toBe(250);
  });

  it('converts a volume unit using the reference density', () => {
    expect(ingredientGrams({ amount: 2, unit: 'cup', item: 'All purpose flour' })).toBeCloseTo(
      240,
      6
    );
  });

  it('honours the European flour standard', () => {
    expect(
      ingredientGrams({ amount: 2, unit: 'cup', item: 'All purpose flour' }, { flourStandard: 125 })
    ).toBeCloseTo(250, 6);
  });

  it('returns null for a volume amount with no known density', () => {
    expect(ingredientGrams({ amount: 1, unit: 'cup', item: 'Sourdough discard' })).toBeNull();
  });

  it('returns null when there is no unit or no number', () => {
    expect(ingredientGrams({ amount: 2, unit: '', item: 'Eggs' })).toBeNull();
    expect(ingredientGrams({ amount: '', unit: 'g', item: 'Salt to taste' })).toBeNull();
  });

  it('returns null for a unit the conversion engine does not handle', () => {
    expect(ingredientGrams({ amount: 1, unit: 'stick', item: 'Butter' })).toBeNull();
  });
});

describe('recipeCost', () => {
  it('costs a priced, gram measured ingredient', () => {
    const result = recipeCost(
      [{ amount: 500, unit: 'g', item: 'Bread flour' }],
      [priced('bread flour', 0.002)],
      2
    );
    expect(result.rows).toEqual([{ item: 'Bread flour', status: 'priced', cost: 1 }]);
    expect(result.total).toBeCloseTo(1, 10);
    expect(result.perServing).toBeCloseTo(0.5, 10);
    expect(result.pricedCount).toBe(1);
  });

  it('matches prices case insensitively', () => {
    const result = recipeCost(
      [{ amount: 500, unit: 'g', item: 'BREAD FLOUR' }],
      [priced('Bread Flour', 0.002)],
      1
    );
    expect(result.rows[0]!.status).toBe('priced');
  });

  it('marks a weighable ingredient with no price as no_price', () => {
    const result = recipeCost([{ amount: 100, unit: 'g', item: 'Rye flour' }], [], 1);
    expect(result.rows[0]).toEqual({ item: 'Rye flour', status: 'no_price', cost: null });
    expect(result.unpricedCount).toBe(1);
    expect(result.total).toBe(0);
  });

  // Weight is checked before price on purpose: offering "Add price" on a row that
  // still could not be costed afterwards would be a dead end.
  it('marks an unweighable ingredient as no_weight even when it has a price', () => {
    const result = recipeCost(
      [{ amount: 1, unit: 'cup', item: 'Sourdough discard' }],
      [priced('sourdough discard', 0.01)],
      1
    );
    expect(result.rows[0]).toEqual({ item: 'Sourdough discard', status: 'no_weight', cost: null });
    expect(result.unknownCount).toBe(1);
  });

  it('marks an unweighable, unpriced ingredient as no_weight too', () => {
    const result = recipeCost([{ amount: 2, unit: '', item: 'Eggs' }], [], 1);
    expect(result.rows[0]!.status).toBe('no_weight');
    expect(result.unpricedCount).toBe(0);
  });

  it('totals only the priced rows and keeps every row in order', () => {
    const result = recipeCost(
      [
        { amount: 500, unit: 'g', item: 'Bread flour' },
        { amount: 350, unit: 'g', item: 'Water' },
        { amount: 2, unit: '', item: 'Eggs' },
      ],
      [priced('bread flour', 0.002), priced('water', 0)],
      4
    );
    expect(result.rows.map((r) => r.status)).toEqual(['priced', 'priced', 'no_weight']);
    expect(result.total).toBeCloseTo(1, 10);
    expect(result.perServing).toBeCloseTo(0.25, 10);
  });

  it('returns a null per serving when servings is not positive', () => {
    const result = recipeCost(
      [{ amount: 500, unit: 'g', item: 'Bread flour' }],
      [priced('bread flour', 0.002)],
      0
    );
    expect(result.perServing).toBeNull();
    expect(result.total).toBeCloseTo(1, 10);
  });

  it('handles an empty recipe', () => {
    const result = recipeCost([], [], 4);
    expect(result.rows).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.perServing).toBe(0);
  });
});

describe('upsertPrice', () => {
  it('adds a new price to the front of the list', () => {
    const next = upsertPrice([priced('water', 0)], priced('Bread flour', 0.002));
    expect(next.map((p) => p.ingredientName)).toEqual(['Bread flour', 'water']);
  });

  it('replaces an existing price in place, matching case insensitively', () => {
    const next = upsertPrice(
      [priced('water', 0), priced('bread flour', 0.002)],
      priced('Bread Flour', 0.003)
    );
    expect(next).toHaveLength(2);
    expect(next[1]).toEqual({ ingredientName: 'Bread Flour', pricePerGram: 0.003, updatedAt: 0 });
  });
});

describe('formatUsd', () => {
  it('always shows two decimal places with a leading dollar sign', () => {
    expect(formatUsd(1)).toBe('$1.00');
    expect(formatUsd(4.994)).toBe('$4.99');
    expect(formatUsd(0)).toBe('$0.00');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/cost.test.ts`
Expected: FAIL — the module `./cost` does not exist yet ("Cannot find module './cost'").

- [ ] **Step 3: Write the implementation**

Create `src/lib/cost.ts` with exactly this content:

```ts
// Recipe costing. Turns a baker's own ingredient prices into a per line cost, a
// recipe total, and a cost per serving. Pure functions, no UI, no side effects.
//
// Every price is stored normalised to dollars per gram so any recipe unit can be
// costed against it, whatever unit the price was originally entered in.
import {
  type ConvertOptions,
  convertWeight,
  getIngredient,
  isVolumeUnit,
  isWeightUnit,
  toGrams,
  type WeightUnit,
} from './convert';

export interface IngredientPrice {
  /** As the baker typed it. Matching is done on `priceKey`, not on this. */
  ingredientName: string;
  pricePerGram: number;
  updatedAt: number;
  /** What was actually entered, kept so the editor can reopen as it was filled in. */
  price?: number;
  packageAmount?: number;
  packageUnit?: WeightUnit;
}

/** The structural shape of a recipe ingredient this module needs. */
export interface CostIngredient {
  amount: number | '';
  unit: string;
  item: string;
}

export type CostStatus = 'priced' | 'no_price' | 'no_weight';

export interface CostRow {
  item: string;
  status: CostStatus;
  cost: number | null;
}

export interface RecipeCost {
  rows: CostRow[];
  total: number;
  /** Null when the recipe has no positive serving count to divide by. */
  perServing: number | null;
  pricedCount: number;
  unpricedCount: number;
  unknownCount: number;
}

/** Normalised lookup key for an ingredient name. Case and spacing insensitive. */
export function priceKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Dollars per gram, from a price and the package size it covers. */
export function pricePerGram(
  price: number,
  packageAmount: number,
  packageUnit: WeightUnit
): number {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Invalid price: ${price}`);
  }
  if (!Number.isFinite(packageAmount) || packageAmount <= 0) {
    throw new Error(`Invalid package amount: ${packageAmount}`);
  }
  return price / convertWeight(packageAmount, packageUnit, 'g');
}

/**
 * Grams one recipe ingredient weighs, or null when that cannot be known.
 *
 * Weights convert outright. Volumes need a density from the reference list, so an
 * ingredient the list has never heard of returns null rather than a wrong number.
 * Countable amounts ("2 eggs") and kitchen units the engine does not model
 * ("1 stick") return null for the same reason.
 */
export function ingredientGrams(
  ingredient: CostIngredient,
  opts?: ConvertOptions
): number | null {
  const { amount, unit, item } = ingredient;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return null;
  }
  if (isWeightUnit(unit)) {
    return convertWeight(amount, unit, 'g');
  }
  if (!isVolumeUnit(unit)) {
    return null;
  }
  const reference = getIngredient(item);
  if (!reference) {
    return null;
  }
  return toGrams(reference, amount, unit, opts);
}

/**
 * Cost every ingredient in a recipe against a price list.
 *
 * Weight resolvability is checked before the price lookup on purpose: a row that
 * could not be costed even once priced should say so, rather than inviting the
 * baker to add a price that would change nothing.
 */
export function recipeCost(
  ingredients: CostIngredient[],
  prices: IngredientPrice[],
  servings: number,
  opts?: ConvertOptions
): RecipeCost {
  const byKey = new Map(prices.map((p) => [priceKey(p.ingredientName), p]));

  const rows: CostRow[] = ingredients.map((ingredient) => {
    const grams = ingredientGrams(ingredient, opts);
    if (grams === null) {
      return { item: ingredient.item, status: 'no_weight', cost: null };
    }
    const price = byKey.get(priceKey(ingredient.item));
    if (!price) {
      return { item: ingredient.item, status: 'no_price', cost: null };
    }
    return { item: ingredient.item, status: 'priced', cost: grams * price.pricePerGram };
  });

  const total = rows.reduce((sum, row) => sum + (row.cost ?? 0), 0);

  return {
    rows,
    total,
    perServing: servings > 0 ? total / servings : null,
    pricedCount: rows.filter((r) => r.status === 'priced').length,
    unpricedCount: rows.filter((r) => r.status === 'no_price').length,
    unknownCount: rows.filter((r) => r.status === 'no_weight').length,
  };
}

/** Add a price, or replace the existing one for the same ingredient in place. */
export function upsertPrice(list: IngredientPrice[], entry: IngredientPrice): IngredientPrice[] {
  const key = priceKey(entry.ingredientName);
  const index = list.findIndex((p) => priceKey(p.ingredientName) === key);
  if (index === -1) {
    return [entry, ...list];
  }
  return list.map((p, i) => (i === index ? entry : p));
}

/** USD only, matching every other unit in the app. */
export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/lib/cost.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 5: Run the full suite, typecheck and lint**

Run: `npm test && npm run typecheck && npm run lint`
Expected: the whole suite green (240 existing + the new ones), typecheck clean, lint clean.

- [ ] **Step 6: Commit**

```bash
git add src/lib/cost.ts src/lib/cost.test.ts && git commit -m "feat(cost): add recipe costing calculations"
```

---

### Task 2: Ingredient price store

**Files:**
- Create: `src/state/ingredientPrices.tsx`
- Modify: `app/_layout.tsx` (import the provider, wrap it around the tree)

**Interfaces:**
- Consumes: `type IngredientPrice`, `priceKey`, `upsertPrice` from `@/lib/cost` (Task 1). `storage` from `@/lib/storage` (already used by every other provider).
- Produces, exported from `src/state/ingredientPrices.tsx` and consumed by Tasks 3–5:
  - `function IngredientPricesProvider({ children }: { children: ReactNode }): JSX.Element`
  - `function useIngredientPrices(): { prices: IngredientPrice[]; setPrice: (entry: IngredientPrice) => void; removePrice: (name: string) => void; getPrice: (name: string) => IngredientPrice | undefined }`

- [ ] **Step 1: Create the provider**

Create `src/state/ingredientPrices.tsx` with exactly this content. It mirrors `src/state/starters.tsx` — same load-from-JSON-with-a-try, same `commit` helper writing through to storage before setting state.

```tsx
// Ingredient prices the baker has entered, used to cost a recipe. One record per
// ingredient name, normalised to dollars per gram so any recipe unit can use it.
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { type IngredientPrice, priceKey, upsertPrice } from '@/lib/cost';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'doughmate.ingredientPrices.v1';

function loadPrices(): IngredientPrice[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as IngredientPrice[];
  } catch {
    return [];
  }
}

interface IngredientPricesContextValue {
  prices: IngredientPrice[];
  setPrice: (entry: IngredientPrice) => void;
  removePrice: (name: string) => void;
  getPrice: (name: string) => IngredientPrice | undefined;
}

const IngredientPricesContext = createContext<IngredientPricesContextValue | null>(null);

export function IngredientPricesProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<IngredientPrice[]>(loadPrices);

  const value = useMemo<IngredientPricesContextValue>(() => {
    const commit = (next: IngredientPrice[]) => {
      storage.setItem(STORAGE_KEY, JSON.stringify(next));
      setPrices(next);
    };
    return {
      prices,
      setPrice: (entry) => commit(upsertPrice(prices, entry)),
      removePrice: (name) =>
        commit(prices.filter((p) => priceKey(p.ingredientName) !== priceKey(name))),
      getPrice: (name) => prices.find((p) => priceKey(p.ingredientName) === priceKey(name)),
    };
  }, [prices]);

  return (
    <IngredientPricesContext.Provider value={value}>{children}</IngredientPricesContext.Provider>
  );
}

export function useIngredientPrices(): IngredientPricesContextValue {
  const ctx = useContext(IngredientPricesContext);
  if (!ctx) {
    throw new Error('useIngredientPrices must be used inside an IngredientPricesProvider');
  }
  return ctx;
}
```

- [ ] **Step 2: Wire the provider into the root layout**

In `app/_layout.tsx`, add the import alphabetically among the other `@/state/*` imports — it goes after the `BakesProvider` import and before the `ProProvider` import:

```ts
import { IngredientPricesProvider } from '@/state/ingredientPrices';
```

Then wrap it around the tree. In the `RootLayout` return, the provider nest currently reads `RecipesProvider` → `BakesProvider` → `TimersProvider`. Put `IngredientPricesProvider` immediately inside `RecipesProvider`, so the nest becomes `RecipesProvider` → `IngredientPricesProvider` → `BakesProvider`. The full replacement for that block:

```tsx
            <RecipesProvider>
              <IngredientPricesProvider>
                <BakesProvider>
                  <TimersProvider>
                    <BakePlanProvider>
                      <StartersProvider>
                        <SamMoodProvider>
                          <ToastProvider>
                            <ThemedApp />
                          </ToastProvider>
                        </SamMoodProvider>
                      </StartersProvider>
                    </BakePlanProvider>
                  </TimersProvider>
                </BakesProvider>
              </IngredientPricesProvider>
            </RecipesProvider>
```

(Every line inside gains one level of indentation. `npm run format` will fix indentation if it drifts.)

- [ ] **Step 3: Typecheck, lint and run the suite**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all three clean. There are no tests for state providers anywhere in this repo (the pattern is unit tests for `src/lib/*` only), so this task's proof is that the app still compiles with the provider mounted and every existing test still passes.

- [ ] **Step 4: Commit**

```bash
git add src/state/ingredientPrices.tsx app/_layout.tsx && git commit -m "feat(cost): add ingredient price store"
```

---

### Task 3: Price editor sheet (`/price-new`)

**Files:**
- Create: `app/price-new.tsx`
- Modify: `src/i18n/en.json` (add a new top-level `prices` namespace)
- Modify: `app/_layout.tsx` (register the route as a transparent modal)

**Interfaces:**
- Consumes: `useIngredientPrices()` from `@/state/ingredientPrices` (Task 2). `formatUsd`, `type IngredientPrice`, `pricePerGram` from `@/lib/cost` (Task 1). `type WeightUnit` from `@/lib/convert`. Existing UI: `BottomSheet`, `Button`, `Card`, `Chip`, `Input`, `useToast`.
- Produces: the route `/price-new`, opened as `/price-new?name=<encodeURIComponent(item)>`. Task 4 and Task 5 both push to it. Passing a `name` that already has a price opens the editor on that price; passing an unknown name pre-fills the name field for a new entry; passing no `name` is a blank new entry.

- [ ] **Step 1: Add the `prices` i18n namespace**

In `src/i18n/en.json`, add a new top-level `"prices"` object. Put it immediately after the closing brace of the existing top-level `"settings"` object and before `"paywall"`:

```json
  "prices": {
    "title": "Ingredient prices",
    "add_title": "Add a price",
    "edit_title": "Edit price",
    "empty": "No prices yet. Add one from a recipe's Cost card.",
    "name_label": "Ingredient",
    "name_placeholder": "e.g. Bread flour",
    "price_label": "Price",
    "price_placeholder": "4.99",
    "package_label": "For this much",
    "package_placeholder": "5",
    "unit_label": "Unit",
    "per_100g": "{{price}} per 100 g",
    "save": "Save price",
    "delete": "Delete price",
    "toast_saved": "Saved {{name}}",
    "toast_deleted": "Removed {{name}}",
    "needs_name": "Give the ingredient a name first.",
    "needs_amount": "Add a price and a package size."
  },
```

- [ ] **Step 2: Create the editor sheet**

Create `app/price-new.tsx` with exactly this content:

```tsx
// Add or edit one ingredient price, a bottom sheet. The baker enters a price the way
// it is printed on the bag ("$4.99 for 5 lb") and the app normalises it to dollars
// per gram, which is what every recipe unit can actually be costed against.
//
// Package sizes are weight only. Dry goods are sold by weight, and accepting a volume
// here would need a density at entry time as well as at costing time.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { WeightUnit } from '@/lib/convert';
import { formatUsd, type IngredientPrice, pricePerGram } from '@/lib/cost';
import { scaleType } from '@/lib/typeScale';
import { useIngredientPrices } from '@/state/ingredientPrices';
import { spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { useToast } from '@/ui/Toast';

const PACKAGE_UNITS: WeightUnit[] = ['g', 'oz', 'lb'];

/** Accept a comma decimal ("4,99") so a locale typical entry still parses. */
function parseAmount(text: string): number {
  return Number(text.replace(',', '.'));
}

export default function PriceEditorSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { show } = useToast();
  const { name: nameParam } = useLocalSearchParams<{ name?: string }>();
  const { getPrice, setPrice, removePrice } = useIngredientPrices();

  const existing = nameParam ? getPrice(nameParam) : undefined;

  const [name, setName] = useState(existing?.ingredientName ?? nameParam ?? '');
  const [price, setPriceText] = useState(
    existing?.price !== undefined ? String(existing.price) : ''
  );
  const [packageAmount, setPackageAmount] = useState(
    existing?.packageAmount !== undefined ? String(existing.packageAmount) : ''
  );
  const [packageUnit, setPackageUnit] = useState<WeightUnit>(existing?.packageUnit ?? 'lb');

  const priceValue = parseAmount(price);
  const packageValue = parseAmount(packageAmount);
  const valid =
    name.trim().length > 0 &&
    Number.isFinite(priceValue) &&
    priceValue >= 0 &&
    Number.isFinite(packageValue) &&
    packageValue > 0;

  const preview = valid ? formatUsd(pricePerGram(priceValue, packageValue, packageUnit) * 100) : null;

  const save = () => {
    if (!name.trim()) {
      show({ message: t('prices.needs_name') });
      return;
    }
    if (!valid) {
      show({ message: t('prices.needs_amount') });
      return;
    }
    const entry: IngredientPrice = {
      ingredientName: name.trim(),
      pricePerGram: pricePerGram(priceValue, packageValue, packageUnit),
      updatedAt: Date.now(),
      price: priceValue,
      packageAmount: packageValue,
      packageUnit,
    };
    setPrice(entry);
    router.back();
    show({
      message: t('prices.toast_saved', { name: entry.ingredientName }),
      variant: 'confirmation',
    });
  };

  const remove = () => {
    if (!existing) {
      return;
    }
    removePrice(existing.ingredientName);
    router.back();
    show({ message: t('prices.toast_deleted', { name: existing.ingredientName }) });
  };

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <Text
          style={[
            typography.display.md,
            scaleType(typography.display.md, fontScale),
            styles.title,
            { color: palette.textInk },
          ]}
        >
          {existing ? t('prices.edit_title') : t('prices.add_title')}
        </Text>
      }
      footer={<Button label={t('prices.save')} onPress={save} haptic="pop" />}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Input
            label={t('prices.name_label')}
            value={name}
            onChangeText={setName}
            placeholder={t('prices.name_placeholder')}
            required
          />
        </Card>

        <Card>
          <Input
            label={t('prices.price_label')}
            value={price}
            onChangeText={setPriceText}
            placeholder={t('prices.price_placeholder')}
            numeric
          />
          <Input
            label={t('prices.package_label')}
            value={packageAmount}
            onChangeText={setPackageAmount}
            placeholder={t('prices.package_placeholder')}
            numeric
          />
          <Text
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              { color: palette.textFaint },
            ]}
          >
            {t('prices.unit_label')}
          </Text>
          <View style={styles.threeUp}>
            {PACKAGE_UNITS.map((u) => (
              <View key={u} style={styles.cell}>
                <Chip
                  label={t(`units.${u}` as 'units.g')}
                  size="md"
                  numeric
                  selected={packageUnit === u}
                  onPress={() => setPackageUnit(u)}
                />
              </View>
            ))}
          </View>
          {preview ? (
            <Text
              style={[
                typography.numeric.sm,
                scaleType(typography.numeric.sm, fontScale),
                { color: palette.proofTeal },
              ]}
            >
              {t('prices.per_100g', { price: preview })}
            </Text>
          ) : null}
        </Card>

        {existing ? (
          <Button
            label={t('prices.delete')}
            variant="destructive"
            onPress={remove}
            haptic="warning"
          />
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing['3xl'] },
  threeUp: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
});
```

- [ ] **Step 3: Register the route**

In `app/_layout.tsx`, inside the `<Stack>`, add a screen entry for the new route. Put it immediately after the existing `starter-new` entry, matching its options exactly:

```tsx
        <Stack.Screen
          name="price-new"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
```

- [ ] **Step 4: Typecheck, lint and run the suite**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all clean. A missing or misspelled i18n key surfaces here as a typecheck error, because `src/i18n/i18next.d.ts` types `t()` against `en.json`.

- [ ] **Step 5: Commit**

```bash
git add app/price-new.tsx app/_layout.tsx src/i18n/en.json && git commit -m "feat(cost): add the ingredient price editor sheet"
```

---

### Task 4: Price list sheet (`/prices`) and the Settings entry point

**Files:**
- Create: `app/prices.tsx`
- Modify: `app/settings.tsx` (a link row under Preferences)
- Modify: `src/i18n/en.json` (one key under `settings`)
- Modify: `app/_layout.tsx` (register the route)

**Interfaces:**
- Consumes: `useIngredientPrices()` from `@/state/ingredientPrices` (Task 2). `formatUsd` from `@/lib/cost` (Task 1). The `/price-new` route from Task 3.
- Produces: the route `/prices`. Nothing else consumes it — this is a leaf screen reached only from Settings.

- [ ] **Step 1: Add the Settings i18n key**

In `src/i18n/en.json`, inside the top-level `"settings"` object, add this key immediately after `"ingredient_sources"`:

```json
    "ingredient_prices": "Ingredient prices",
```

- [ ] **Step 2: Create the list sheet**

Create `app/prices.tsx` with exactly this content. Each row is a `Card` that opens the editor for that ingredient; the price shows normalised per 100 g, because per-gram numbers are too small to read at a glance.

```tsx
// Every ingredient price the baker has entered, in one place. Reached from Settings;
// each row opens the same editor the Cost card on a recipe opens.
//
// Not Pro gated on purpose: this only ever lists data the baker typed themselves, and
// hiding it behind the gate would strand those entries if an entitlement lapsed.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatUsd } from '@/lib/cost';
import { scaleType } from '@/lib/typeScale';
import { useIngredientPrices } from '@/state/ingredientPrices';
import { spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';

export default function PricesSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { prices } = useIngredientPrices();

  const sorted = [...prices].sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <Text
          style={[
            typography.display.md,
            scaleType(typography.display.md, fontScale),
            styles.title,
            { color: palette.textInk },
          ]}
        >
          {t('prices.title')}
        </Text>
      }
      footer={
        <Button
          label={t('prices.add_title')}
          onPress={() => router.push('/price-new')}
          haptic="pop"
        />
      }
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <Card>
            <Text
              style={[
                typography.body.md,
                scaleType(typography.body.md, fontScale),
                { color: palette.textFaint },
              ]}
            >
              {t('prices.empty')}
            </Text>
          </Card>
        ) : (
          sorted.map((price) => (
            <Card
              key={price.ingredientName}
              onPress={() =>
                router.push(`/price-new?name=${encodeURIComponent(price.ingredientName)}`)
              }
              style={styles.row}
            >
              <Text
                style={[
                  typography.body.lg,
                  scaleType(typography.body.lg, fontScale),
                  styles.rowName,
                  { color: palette.textInk },
                ]}
                numberOfLines={1}
              >
                {price.ingredientName}
              </Text>
              <Text
                style={[
                  typography.numeric.sm,
                  scaleType(typography.numeric.sm, fontScale),
                  { color: palette.proofTeal },
                ]}
              >
                {t('prices.per_100g', { price: formatUsd(price.pricePerGram * 100) })}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.sm, paddingBottom: spacing['3xl'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowName: { flexShrink: 1 },
});
```

- [ ] **Step 3: Add the Settings link row**

In `app/settings.tsx`, find the `<Card>` block holding the `floured_fingers` `ToggleRow` (it closes with `</Card>` just before `<SectionLabel>{t('settings.section_notifications')}</SectionLabel>`). Add this immediately after that closing `</Card>` and before that `<SectionLabel>`:

```tsx
        <Card onPress={() => router.push('/prices')} style={styles.linkRow}>
          <Text style={[...bodyText, { color: palette.textInk }]}>
            {t('settings.ingredient_prices')}
          </Text>
          <Text style={[...bodyText, { color: palette.textFaint }]}>›</Text>
        </Card>
```

`router`, `Card`, `bodyText`, `palette` and `styles.linkRow` are all already in scope in that file — no new imports.

- [ ] **Step 4: Register the route**

In `app/_layout.tsx`, inside the `<Stack>`, add a screen entry immediately after the `price-new` entry added in Task 3:

```tsx
        <Stack.Screen
          name="prices"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
```

- [ ] **Step 5: Typecheck, lint and run the suite**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all clean.

- [ ] **Step 6: Verify the flow in the browser**

This repo has no component tests — the established pattern is unit tests for `src/lib/*` and manual verification for screens (there is not a single `.test.tsx` file anywhere in `app/` or `src/`). Verify by hand:

1. Start the web preview: `npm run web` from `app-src` (or `preview_start` with the project's `web` launch config if working inside Claude Code).
2. Open Settings from the gear. Under Preferences, confirm the new "Ingredient prices" row appears below "Floured fingers".
3. Tap it. The list sheet opens showing the empty message.
4. Tap "Add a price". Enter `Bread flour`, price `4.99`, package `5`, unit `lb`. Confirm the teal preview line reads `$0.22 per 100 g`.
5. Save. Confirm the toast reads "Saved Bread flour" and the list now shows one row: `Bread flour` on the left, `$0.22 per 100 g` on the right.
6. Tap that row. Confirm the editor reopens with `4.99`, `5` and `lb` filled in exactly as entered — not a raw per-gram number.
7. Tap "Delete price". Confirm the toast reads "Removed Bread flour" and the list is empty again.

- [ ] **Step 7: Commit**

```bash
git add app/prices.tsx app/settings.tsx app/_layout.tsx src/i18n/en.json && git commit -m "feat(cost): add the ingredient price list to Settings"
```

---

### Task 5: The Cost card on Recipe Detail

**Files:**
- Modify: `app/recipe/[id].tsx` (new imports, a `useMemo`, and a new sub-section inside the existing `isPro` branch)
- Modify: `src/i18n/en.json` (six keys under `recipes`)

**Interfaces:**
- Consumes: `recipeCost(ingredients: CostIngredient[], prices: IngredientPrice[], servings: number, opts?: ConvertOptions): RecipeCost` and `formatUsd(value: number): string` from `@/lib/cost` (Task 1). `useIngredientPrices()` from `@/state/ingredientPrices` (Task 2). The `/price-new` route from Task 3.
- Produces: nothing consumed elsewhere — this is a leaf UI addition and the last task.

- [ ] **Step 1: Add the recipe i18n keys**

In `src/i18n/en.json`, inside the top-level `"recipes"` object, find `"levain_grams_suffix"` and add these six keys immediately after it:

```json
    "cost_heading": "Cost",
    "cost_add_price": "Add price",
    "cost_unknown": "Can't estimate this one",
    "cost_total": "Total",
    "cost_per_serving": "Per serving",
    "cost_empty": "This recipe has nothing that can be costed yet.",
```

- [ ] **Step 2: Add the imports and the cost calculation**

In `app/recipe/[id].tsx`, add two imports. The `@/lib/cost` import goes immediately after the existing `@/lib/convert` import:

```ts
import { formatUsd, recipeCost } from '@/lib/cost';
```

The state hook import goes immediately after the existing `@/state/pro` import:

```ts
import { useIngredientPrices } from '@/state/ingredientPrices';
```

Then, inside the component, add the hook call immediately after the existing `const { settings } = useSettings();` line:

```ts
  const { prices } = useIngredientPrices();
```

And add the cost calculation immediately after the existing `bakers` `useMemo` (the line `const bakers = useMemo(...)`). Note that this must stay **above** the `if (!recipe)` early return, alongside the other hooks:

```ts
  // Servings the baker is actually looking at, so the cost follows the scale block.
  const servingsShown = Math.max(1, Math.round(baseServings * factor));

  const cost = useMemo(
    () =>
      recipe
        ? recipeCost(
            recipe.ingredients.map((ing) => ({
              amount: typeof ing.amount === 'number' ? ing.amount * factor : '',
              unit: ing.unit,
              item: ing.item,
            })),
            prices,
            servingsShown,
            { flourStandard: settings.flourStandard }
          )
        : null,
    [recipe, prices, factor, servingsShown, settings.flourStandard]
  );
```

- [ ] **Step 3: Add the Cost card**

In `app/recipe/[id].tsx`, find the levain `</Card>` that closes the levain build card — it is the `</Card>` immediately followed by `</>` and then `) : (` (the start of the Pro-locked branch). Insert the following between that `</Card>` and the `</>`, so the Cost section becomes a third sub-section inside the same `isPro` branch:

```tsx
            <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
              {t('recipes.cost_heading')}
            </Text>
            <Card style={styles.list}>
              {cost && cost.rows.length > 0 ? (
                <>
                  {cost.rows.map((row, i) => (
                    <View key={i} style={styles.rowBetween}>
                      <Text style={[typography.body.md, styles.costItem, { color: palette.textInk }]}>
                        {row.item}
                      </Text>
                      {row.status === 'priced' ? (
                        <Text style={[typography.numeric.sm, { color: palette.proofTeal }]}>
                          {formatUsd(row.cost ?? 0)}
                        </Text>
                      ) : row.status === 'no_price' ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() =>
                            router.push(`/price-new?name=${encodeURIComponent(row.item)}`)
                          }
                        >
                          <Text style={[typography.labelSm, { color: palette.primary }]}>
                            {t('recipes.cost_add_price')}
                          </Text>
                        </Pressable>
                      ) : (
                        <Text style={[typography.labelSm, { color: palette.textFaint }]}>
                          {t('recipes.cost_unknown')}
                        </Text>
                      )}
                    </View>
                  ))}
                  {cost.pricedCount > 0 ? (
                    <View style={[styles.costTotals, { borderTopColor: palette.outline }]}>
                      <View style={styles.rowBetween}>
                        <Text style={[typography.body.md, { color: palette.textInk }]}>
                          {t('recipes.cost_total')}
                        </Text>
                        <Text style={[typography.numeric.sm, { color: palette.textInk }]}>
                          {formatUsd(cost.total)}
                        </Text>
                      </View>
                      {cost.perServing !== null ? (
                        <View style={styles.rowBetween}>
                          <Text style={[typography.body.md, { color: palette.textSoft }]}>
                            {t('recipes.cost_per_serving')}
                          </Text>
                          <Text style={[typography.numeric.sm, { color: palette.textSoft }]}>
                            {formatUsd(cost.perServing)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </>
              ) : (
                <Text style={[typography.body.md, { color: palette.textFaint }]}>
                  {t('recipes.cost_empty')}
                </Text>
              )}
            </Card>
```

`Pressable` and `router` are already imported in this file. `styles.rowBetween` and `styles.list` already exist.

- [ ] **Step 4: Add the two new styles**

In the `StyleSheet.create` block at the bottom of `app/recipe/[id].tsx`, find the `rowBetween` entry and add these two entries immediately after it:

```ts
  costItem: { flexShrink: 1 },
  costTotals: {
    gap: spacing.sm,
    borderTopWidth: stroke.soft,
    paddingTop: spacing.sm,
    marginTop: spacing['2xs'],
  },
```

`spacing` and `stroke` are already imported in this file.

- [ ] **Step 5: Typecheck, lint and run the suite**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all clean, full suite green.

- [ ] **Step 6: Verify in the browser**

1. Start the web preview (`npm run web` from `app-src`).
2. Pro state is `false` on web with no real purchase flow. To see the gated section, temporarily flip `useState(false)` to `useState(true)` on the `isPro` state in `src/state/pro.tsx`, verify, then **revert that edit before committing** — do not ship a hardcoded `true`.
3. Open (or create) a recipe with at least: one gram-measured flour ingredient, one cup-measured ingredient whose name matches the reference list (e.g. `All purpose flour`), and one countable ingredient with no unit (e.g. `2 eggs`).
4. Scroll past Baker's percentages and Levain build to the new "Cost" section. Confirm every ingredient appears as a row.
5. Confirm the countable row (`eggs`) reads "Can't estimate this one" and offers no "Add price" affordance.
6. Confirm the weighable rows read "Add price". Tap one — the price editor opens with that ingredient's name pre-filled.
7. Enter a price (e.g. `4.99` for `5` `lb`) and save. Back on the recipe, confirm that row now shows a dollar figure, and a Total row has appeared below the rules.
8. Price a second ingredient. Confirm Total is the sum of both and "Per serving" is Total divided by the serving count showing in the Scale block.
9. Tap the Scale stepper up one serving. Confirm the line costs, Total, and Per serving all recalculate — the line costs and Total go up, Per serving stays roughly flat.
10. Open Settings → Ingredient prices. Confirm both prices entered from the recipe appear in that list.
11. Revert the temporary `src/state/pro.tsx` edit from step 2. Confirm the recipe shows the single Pro-locked card again, with no Cost section leaking through.

- [ ] **Step 7: Commit**

```bash
git add app/recipe/\[id\].tsx src/i18n/en.json && git commit -m "feat(recipes): add the Pro cost breakdown to Recipe detail"
```

---

## Self-Review Notes

**Spec coverage** — every clause of "Feature 3: Recipe Cost Calculator" in `docs/superpowers/specs/2026-08-20-pro-feature-expansion-design.md`:

| Spec requirement | Where |
|---|---|
| New collection `doughmate.ingredientPrices.v1`, same provider pattern as `recipes.tsx`/`starters.tsx` | Task 2 |
| `{ ingredientName, pricePerGram, updatedAt }` | Task 1 (`IngredientPrice`), extended with three optional entry-form fields |
| Natural entry form ("$4.99 for a 5 lb bag") normalised to `pricePerGram` | Task 3 editor + `pricePerGram` in Task 1 |
| Case-insensitive match against free-text ingredient names, no requirement to exist in `ingredients.json` | Task 1 (`priceKey`, `recipeCost`) |
| Inline Pro-gated Cost card on Recipe Detail with an "Add price" affordance per unpriced row | Task 5 |
| Settings management list of all prices | Task 4 |
| Calculation reuses `convert.ts` `toGrams` unchanged; × price, summed, ÷ servings | Task 1 (`ingredientGrams`, `recipeCost`) |
| Volume ingredient with no density shows "can't estimate this one", never a wrong number | Task 1 (`no_weight`), Task 5 (`recipes.cost_unknown`) |
| USD only | Global Constraints, `formatUsd` |
| Unit tests for gram conversion + price multiplication, including the no-density fallback | Task 1 test block |

**Deliberate additions beyond the spec text**, both flagged in "Design decisions this plan locks in": package sizes restricted to weight units, and weight-resolvability checked before price lookup so no row offers a price that would not help. Costs also follow the Scale block's factor, which the spec did not mention but which is the only sensible reading of "what does this bake cost".

**Placeholder scan:** no TBD/TODO. Every code step carries complete, runnable content.

**Type consistency:** `IngredientPrice`, `CostIngredient`, `CostRow`, `CostStatus` (`'priced' | 'no_price' | 'no_weight'`), `RecipeCost`, `priceKey`, `pricePerGram`, `ingredientGrams`, `recipeCost`, `upsertPrice`, `formatUsd` are defined once in Task 1 and used with identical names and signatures in Tasks 2–5. `useIngredientPrices()`'s four members (`prices`, `setPrice`, `removePrice`, `getPrice`) are defined in Task 2 and each is used as declared: `getPrice`/`setPrice`/`removePrice` in Task 3, `prices` in Tasks 4 and 5.
