# Levain Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Pro-gated sourdough levain build calculator to the Recipe Detail screen's existing "Baker's percentages" card — given a target levain weight, a feed ratio, and a hydration percentage, compute the exact grams of seed, flour, and water needed.

**Architecture:** One new pure function (`levainBuild`) in `src/lib/recipe.ts`, unit tested in isolation. One new UI sub-section inside the existing Pro-gated card in `app/recipe/[id].tsx`, reusing the exact hydration/ratio chip values already established in `app/starter-new.tsx` so the mental model matches. No new screens, no new state provider, no new dependency.

**Tech Stack:** React Native, Expo Router, TypeScript, Jest.

## Global Constraints

- Ratio values are exactly `'1:1:1'`, `'1:2:2'`, `'1:5:5'` (seed:flour:water parts), matching `RATIOS` in `app/starter-new.tsx:26`.
- Hydration values are exactly `80`, `100`, `125` (percent), matching `HYDRATIONS` in `app/starter-new.tsx:25`.
- This feature lives entirely inside the existing `isPro` branch of the Baker's percentages card in `app/recipe/[id].tsx` — it must never render for free users, and needs no separate paywall check of its own.
- All new user-facing strings go in `src/i18n/en.json` under the `recipes` namespace, matching the existing key style (snake_case, e.g. `bakers_pct`, `bakers_empty`).
- Follow existing code style: no comments except where a non-obvious "why" needs explaining (see repo conventions already visible in `src/lib/recipe.ts`).

---

### Task 1: `levainBuild` pure function

**Files:**
- Modify: `app-src/src/lib/recipe.ts` (add after the existing `bakersPercentages` function, around line 116)
- Test: `app-src/src/lib/recipe.test.ts` (add a new `describe('levainBuild', ...)` block, after the existing `describe('bakersPercentages', ...)` block)

**Interfaces:**
- Produces: `export interface LevainBuild { seed: number; flour: number; water: number }` and `export function levainBuild(targetWeight: number, ratio: string, hydrationPct: number): LevainBuild` — both exported from `src/lib/recipe.ts`, consumed by Task 2.

**The math:** A ratio string `"S:F:W"` (e.g. `"1:5:5"`) gives the seed's share of the total build directly (`S` parts out of `S + F + W`), and gives the *combined* flour+water share as `F + W` parts. Hydration then splits that combined flour+water amount into actual flour and water — this is what makes hydration a real, independent input rather than redundant with the ratio string (all three preset ratios have equal flour:water parts, so taking the ratio's numbers literally would always yield exactly 100% hydration regardless of what the user picks).

- [ ] **Step 1: Write the failing tests**

Add to `app-src/src/lib/recipe.test.ts`, after the closing `});` of the existing `describe('bakersPercentages', ...)` block:

```ts
describe('levainBuild', () => {
  it('splits a build by ratio parts at 100% hydration', () => {
    const build = levainBuild(550, '1:5:5', 100);
    expect(build.seed).toBeCloseTo(50);
    expect(build.flour).toBeCloseTo(250);
    expect(build.water).toBeCloseTo(250);
  });

  it('keeps the seed and total new-material size fixed as hydration changes', () => {
    const at100 = levainBuild(550, '1:5:5', 100);
    const at125 = levainBuild(550, '1:5:5', 125);
    expect(at125.seed).toBeCloseTo(at100.seed);
    expect(at125.flour + at125.water).toBeCloseTo(at100.flour + at100.water);
    expect(at125.water).toBeGreaterThan(at100.water);
    expect(at125.flour).toBeLessThan(at100.flour);
  });

  it('handles the 1:1:1 ratio', () => {
    const build = levainBuild(300, '1:1:1', 100);
    expect(build.seed).toBeCloseTo(100);
    expect(build.flour).toBeCloseTo(100);
    expect(build.water).toBeCloseTo(100);
  });

  it('always sums back to the target weight', () => {
    for (const ratio of ['1:1:1', '1:2:2', '1:5:5']) {
      for (const hydration of [80, 100, 125]) {
        const build = levainBuild(1000, ratio, hydration);
        expect(build.seed + build.flour + build.water).toBeCloseTo(1000);
      }
    }
  });

  it('throws on a malformed ratio', () => {
    expect(() => levainBuild(500, 'not-a-ratio', 100)).toThrow();
    expect(() => levainBuild(500, '1:2', 100)).toThrow();
    expect(() => levainBuild(500, '1:0:2', 100)).toThrow();
  });
});
```

Also add `levainBuild` to the existing import block at the top of the file (it currently starts `import { bakersPercentages, groupBySection, ... } from './recipe';`) — add it alphabetically:

```ts
import {
  bakersPercentages,
  groupBySection,
  levainBuild,
  matchFactor,
  parseIngredientLine,
  parseLeadingQuantity,
  scaleRecipeText,
  scaleText,
} from './recipe';
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd app-src && npx jest src/lib/recipe.test.ts -t levainBuild`
Expected: FAIL — `levainBuild is not defined` (or a TypeScript error if type-checking the test file), since the function doesn't exist yet.

- [ ] **Step 3: Write the implementation**

Add to `app-src/src/lib/recipe.ts`, directly after the `bakersPercentages` function (after its closing `}` around line 116):

```ts
export interface LevainBuild {
  seed: number;
  flour: number;
  water: number;
}

/**
 * Grams of seed, flour, and water to build a levain of `targetWeight` grams,
 * given a feed ratio ("seed:flour:water" parts, e.g. "1:5:5") and a target
 * hydration percentage (water as % of flour).
 *
 * The ratio's seed part sets the seed's share of the total; its flour and
 * water parts combine into one relative "new material" share. Hydration
 * then splits that share into actual flour and water — this is what keeps
 * hydration meaningful on its own, since every preset ratio has matching
 * flour and water parts and would otherwise always imply 100% hydration.
 */
export function levainBuild(targetWeight: number, ratio: string, hydrationPct: number): LevainBuild {
  const parts = ratio.split(':').map(Number);
  if (parts.length !== 3 || parts.some((p) => !Number.isFinite(p) || p <= 0)) {
    throw new Error(`Invalid levain ratio: "${ratio}"`);
  }
  const [seedParts, flourParts, waterParts] = parts as [number, number, number];
  const newMaterialParts = flourParts + waterParts;
  const totalParts = seedParts + newMaterialParts;
  const seed = (targetWeight * seedParts) / totalParts;
  const newMaterial = (targetWeight * newMaterialParts) / totalParts;
  const flour = newMaterial / (1 + hydrationPct / 100);
  const water = newMaterial - flour;
  return { seed, flour, water };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd app-src && npx jest src/lib/recipe.test.ts -t levainBuild`
Expected: PASS, all 5 new tests green.

- [ ] **Step 5: Run the full test file and typecheck**

Run: `cd app-src && npx jest src/lib/recipe.test.ts && npx tsc --noEmit`
Expected: All existing `recipe.test.ts` tests still pass (no regressions), typecheck clean.

- [ ] **Step 6: Commit**

```bash
cd app-src && git add src/lib/recipe.ts src/lib/recipe.test.ts
git commit -m "feat(recipes): add levainBuild calculation for the pre-ferment calculator"
```

---

### Task 2: Levain calculator UI in Recipe Detail

**Files:**
- Modify: `app-src/app/recipe/[id].tsx` (add a new sub-section inside the existing Pro-gated Baker's percentages card, after the `bakers`-rows `<Card>` block that currently ends the `isPro ? (...) : (...)` branch — see the `{/* Baker's percentages */}` comment around line 288 for the section to extend)
- Modify: `app-src/src/i18n/en.json` (add new keys under the `recipes` namespace, near the existing `bakers_pct` / `bakers_empty` / `bakers_locked` keys)

**Interfaces:**
- Consumes: `levainBuild(targetWeight: number, ratio: string, hydrationPct: number): LevainBuild` and `LevainBuild { seed: number; flour: number; water: number }` from `@/lib/recipe` (Task 1). `formatQuantity(value: number, opts?: { format?: NumberFormat; unit?: string }): string` from `@/lib/convert` (already imported in this file). `Chip` from `@/ui/Chip` (not yet imported in this file — needs adding).
- Produces: nothing consumed by other tasks — this is a leaf UI addition.

- [ ] **Step 1: Add the new i18n keys**

In `app-src/src/i18n/en.json`, find the `"bakers_locked"` key (inside the `recipes` object) and add these four keys directly after it:

```json
    "bakers_locked": "See baker's percentages with Pro",
    "levain_heading": "Levain build",
    "levain_target_label": "Target levain weight",
    "levain_target_placeholder": "e.g. 550",
    "levain_seed": "Seed",
    "levain_flour": "Flour",
    "levain_water": "Water",
```

(Keep whatever already follows `bakers_locked` after these new lines — only insert, don't remove anything.)

- [ ] **Step 2: Add the `Chip` import and levain state**

In `app-src/app/recipe/[id].tsx`, add `Chip` to the `@/ui/Chip` import (it isn't imported in this file yet) — add this line alphabetically among the other `@/ui/*` imports (after `@/ui/Card`, before `@/ui/HardShadow`):

```ts
import { Chip } from '@/ui/Chip';
```

Add `levainBuild` and `LevainBuild` to the existing `@/lib/recipe` import:

```ts
import { bakersPercentages, groupBySection, levainBuild, type LevainBuild } from '@/lib/recipe';
```

Also add an `Input` import — it is **not** currently imported in this file (only `Card`, `Button`, `Stepper`, etc. are). Add it alphabetically among the `@/ui/*` imports:

```ts
import { Input } from '@/ui/Input';
```

Find the component's existing state declarations (near the top of the component function, alongside other `useState` calls) and add:

```ts
const [levainTarget, setLevainTarget] = useState('');
const [levainHydration, setLevainHydration] = useState(100);
const [levainRatio, setLevainRatio] = useState('1:2:2');

const levain: LevainBuild | null = useMemo(() => {
  const target = Number(levainTarget);
  if (!Number.isFinite(target) || target <= 0) {
    return null;
  }
  return levainBuild(target, levainRatio, levainHydration);
}, [levainTarget, levainRatio, levainHydration]);
```

(`useMemo` is already imported in this file, alongside `useState`.)

- [ ] **Step 3: Add the UI section**

In `app-src/app/recipe/[id].tsx`, inside the `isPro ? (` branch of the Baker's percentages block, find the closing `</Card>` that ends the existing bakers-rows card (the one containing the `bakers.map(...)` / `bakers_empty` text). Immediately after that `</Card>` and still inside the same `isPro ? ( ... )` parenthesized block (before its closing `) : (`), add:

```tsx
        <Text style={[typography.label, styles.sectionLabel, { color: palette.textSoft }]}>
          {t('recipes.levain_heading')}
        </Text>
        <Card style={styles.list}>
          <Input
            label={t('recipes.levain_target_label')}
            value={levainTarget}
            onChangeText={setLevainTarget}
            placeholder={t('recipes.levain_target_placeholder')}
            numeric
          />
          <View style={styles.rowBetween}>
            {[80, 100, 125].map((h) => (
              <Chip
                key={h}
                label={`${h}%`}
                numeric
                selected={levainHydration === h}
                onPress={() => setLevainHydration(h)}
              />
            ))}
          </View>
          <View style={styles.rowBetween}>
            {['1:1:1', '1:2:2', '1:5:5'].map((r) => (
              <Chip
                key={r}
                label={r}
                numeric
                selected={levainRatio === r}
                onPress={() => setLevainRatio(r)}
              />
            ))}
          </View>
          {levain ? (
            <>
              <View style={styles.rowBetween}>
                <Text style={[typography.body.md, { color: palette.textInk }]}>
                  {t('recipes.levain_seed')}
                </Text>
                <Text style={[typography.numeric.sm, { color: palette.proofTeal }]}>
                  {formatQuantity(levain.seed, { format: 'decimal' })} g
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={[typography.body.md, { color: palette.textInk }]}>
                  {t('recipes.levain_flour')}
                </Text>
                <Text style={[typography.numeric.sm, { color: palette.proofTeal }]}>
                  {formatQuantity(levain.flour, { format: 'decimal' })} g
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={[typography.body.md, { color: palette.textInk }]}>
                  {t('recipes.levain_water')}
                </Text>
                <Text style={[typography.numeric.sm, { color: palette.proofTeal }]}>
                  {formatQuantity(levain.water, { format: 'decimal' })} g
                </Text>
              </View>
            </>
          ) : null}
        </Card>
```

This reuses `styles.list` and `styles.rowBetween`, both already defined in this file's `StyleSheet.create` block for the bakers-percentages rows above it — no new styles needed. `Input` is the one added in Step 2 above.

- [ ] **Step 4: Typecheck and lint**

Run: `cd app-src && npx tsc --noEmit && npx eslint app/recipe/\[id\].tsx src/i18n/en.json`
Expected: both clean, no errors.

- [ ] **Step 5: Manual verification in the browser**

This screen has no existing component tests (the codebase's pattern is unit tests for `src/lib/*`, manual/browser verification for screens — confirmed by there being zero `.test.tsx` files in `app/` or `src/` anywhere in this repo). Verify by hand:

1. Start the web preview: use the `web` dev server config (`npm run web` from `app-src`, or the project's existing `mcp__Claude_Browser__preview_start` with `name: "web"` if working inside Claude Code).
2. Since Pro state defaults to `false` on web (no real purchase flow there), temporarily confirm the locked state renders first: open any recipe with at least one gram-measured flour ingredient, scroll to "Baker's percentages" — it should show the existing Pro-locked card (unchanged behavior).
3. To see the unlocked levain section without a real purchase, this needs either a native dev-client build with a debug Pro override (tracked separately — not part of this plan), or a temporary local edit to `src/state/pro.tsx`'s initial `useState(false)` to `useState(true)` — make this edit, verify, then **revert it before committing** (do not ship a hardcoded `true`).
4. With Pro temporarily true: open a recipe, scroll to the new "Levain build" card below Baker's percentages. Type `550` into the target weight field. Confirm three chips show for hydration (80%/100%/125%) and three for ratio (1:1:1/1:2:2/1:5:5), each independently selectable with a visible selected state.
5. With ratio `1:5:5` and hydration `100%` selected, confirm the output reads Seed 50g, Flour 250g, Water 250g (matches the unit test in Task 1).
6. Switch hydration to `125%` with the same ratio and target — confirm Seed stays 50g, Water increases, Flour decreases, and they still sum to 550g.
7. Clear the target weight field entirely — confirm the output section disappears cleanly (no NaN, no crash) rather than showing broken numbers.

- [ ] **Step 6: Commit**

```bash
cd app-src && git add app/recipe/\[id\].tsx src/i18n/en.json
git commit -m "feat(recipes): add levain build calculator to Baker's percentages"
```

## Self-Review Notes

- **Spec coverage**: implements the full "Feature 2: Pre-ferment / Levain Calculator" section of `docs/superpowers/specs/2026-08-20-pro-feature-expansion-design.md` — same location (inside the existing Pro baker's-percentages card), same inputs (target weight, hydration chips, ratio chips matching Starter creation), same output (seed/flour/water grams), same gate (existing `isPro` check, no new paywall logic).
- **Placeholder scan**: no TBD/TODO; every step has real, complete code.
- **Type consistency**: `LevainBuild` and `levainBuild` signatures match exactly between Task 1 (definition) and Task 2 (consumption).
