# Recipe Feature Expansion — Design

Date: 2026-08-11
Branch: `redesign/proof`
Status: Approved for planning

## Problem

The recipe feature feels half baked next to real recipe apps. Three concrete pain points drove this work:

1. **Ingredient entry is a freeform textarea.** You type one ingredient per line and it gets parsed. There is no structured, line by line entry.
2. **Poor spacing and a cramped detail layout.** The detail sheet packs a lot in with little breathing room.
3. **The Scale card is disorganized.** It carries two overlapping controls at once, a servings stepper and a `0.5x / 1x / 2x` multiplier row, which read as clutter.

There is also a structural gap: **saved recipes cannot be edited.** Today you can only create and delete.

## Goals

Bring the recipe feature to parity with mainstream recipe apps, scoped tightly:

- Structured, thumb friendly ingredient entry (stacked cards, large tap targets).
- Group ingredients under optional **sections** (e.g. Dough, Filling).
- Optional **time** on each method step, shown as a pill.
- **Edit** existing recipes, not just create and delete.
- A single, clean **servings based** Scale control.
- A spacing and layout pass on the detail view.

## Non goals (explicitly out this pass)

Kept out to hold scope. Each is a clean future follow up.

- Drag to reorder ingredients or steps.
- **Live countdown timers.** The step time is display and entry metadata only, never a running clock. No notifications, no cook mode ticking.
- Cook mode ingredient/step check off.
- Cover photos.
- Import by pasting recipe text or from a URL.

## Design decisions (all user approved)

### Touch first ingredient entry — "stacked card" (option A)

Each ingredient is its own card with generous padding and large targets. No more than two controls sit side by side, and the unit reads as a word ("grams"), not a tiny glyph.

```
┌─────────────────────────────┐
│  bread flour                │   item, full width, ~52px
│  [ 500 ]   [ grams      ▾ ] │   amount box + unit picker, ~52px
│                          ✕  │   delete, 52px
└─────────────────────────────┘
```

- `+ Add ingredient` appends a card to the current section.
- `+ Section` adds a named section header; ingredients added after it belong to it.
- Delete is the per card `✕`. (Reorder is a future follow up.)

### Detail: one servings based Scale control

Replaces the stepper + multiplier chips with a single stepper.

- **At the original serving count:** only the `Serves  [ − ] 4 [ + ]` row. No factor line, no Reset.
- **After scaling:** a quiet second row fades in: `Now at 1.5×    ↺ Reset`.
- Every ingredient amount recomputes from the original servings. Reset returns to the original count.

### Detail: sectioned, roomier read view

- Ingredients render grouped under their section pills (Dough, Finish). Amounts are in the brand orange (`primary`); items in ink.
- Method steps are numbered with teal `⏱ time` pills where a time exists.
- `✎ Edit` sits top right of the sheet header, beside close. It opens the shared editor pre filled.
- Baker's percentages (Pro) stays as is.
- Increased vertical rhythm between the Scale / Ingredients / Baker's / Method / Notes blocks.

## Data model

Extends the existing Recipe v2 shape. Backward compatible: every new field is optional, so records saved before this change read cleanly.

```ts
interface RecipeIngredient {
  amount: number | '';
  unit: string;
  item: string;
  section?: string; // NEW. undefined => belongs to the leading unlabeled group
}

interface RecipeStep {
  text: string;
  time?: string;   // ALREADY EXISTS. now surfaced in the editor and detail
}
```

- **Sections are a flat field, not a nested structure.** Each ingredient carries an optional `section` name. The UI groups by walking the ordered list and emitting a header whenever the section changes. This keeps the array shape stable, keeps `lib/recipe.ts` scaling and `bakersPercentages` working unchanged (they iterate a flat list), and needs no new migration.
- Ingredients belonging to the leading, unlabeled group have `section === undefined` and render with no header.
- `state/recipes.tsx`: `RecipeInput`/`addRecipe`/`updateRecipe` already accept `ingredients` and `steps`; they carry the new optional field through with no signature change. The v1 to v2 migration is untouched.

## Editor: one screen for create and edit

`app/recipe-new.tsx` becomes a general recipe editor (create and edit share it).

- **Create:** `+ New recipe` opens it empty; Save calls `addRecipe`.
- **Edit:** `✎ Edit` on the detail sheet opens it pre filled from the recipe; Save calls `updateRecipe(id, ...)`.
- The editor is a tall bottom sheet, consistent with the rest of the app. It keeps: name, yield, serves, tags.
- Ingredients: stacked cards grouped by section, with `+ Add ingredient` and `+ Section`.
- Method: stacked step cards, each a text field plus an optional time field, with `+ Add step`.
- Local editor state holds arrays of ingredient and step drafts; Save maps them to the Recipe shape (drops empty rows).

### Routing

The editor needs to open in two modes from two places. Approach: keep the single `recipe-new` route and pass the recipe id as an optional param (`/recipe-new?id=<id>`). Empty id = create; present id = edit (load via `getRecipe`). This avoids a second near duplicate route. If param plumbing proves awkward in Expo Router typed routes, fall back to a dedicated `recipe/[id]/edit` route that renders the same editor component. Decide during planning; both are acceptable.

## Components and files

| File | Change |
| --- | --- |
| `src/state/recipes.tsx` | Add optional `section?` to `RecipeIngredient`. No signature changes. |
| `app/recipe-new.tsx` | Rework into the shared create/edit editor with stacked ingredient cards, sections, and step cards with time. |
| `app/recipe/[id].tsx` | Servings based Scale control; sectioned ingredient render; step time pills; `✎ Edit` entry point; spacing pass. |
| `src/ui/` | Small new pieces as needed: an ingredient editor card, a section header, a step editor card, and a servings Scale row (composes the existing `Stepper`). Reuse `Card`, `Input`, `Chip`, `Button`, `BottomSheet`. |
| `src/lib/recipe.ts` | Reused unchanged for per line scaling. Optionally add a small pure `groupBySection(ingredients)` helper (tested to 100%) if grouping logic is non trivial. |
| `src/i18n/en.json` | New keys: section add/label, add ingredient, add step, step time, edit, serves, reset, plus any editor field labels. All copy free of hyphens and dashes. |

## Scaling behavior

- Unchanged engine. `scaleText` / `formatQuantity` already scale a numeric amount by a factor.
- Factor derives from servings: `factor = currentServings / originalServings`.
- Non numeric amounts (`amount === ''`) pass through unscaled, as today.
- Section grouping is presentation only and does not affect scaling or baker's math.

## Error handling and edge cases

- Empty ingredient or step rows are dropped on Save.
- A recipe with no sections renders exactly as before (no headers), proving backward compatibility.
- A section with no ingredients under it is not emitted in the read view.
- Editing a recipe that was migrated from v1 works: it simply has no `section` on any ingredient and no `time` on any step.
- Delete plus undo on the detail sheet is unchanged.

## Testing

- Pure logic stays at 100% coverage. If a `groupBySection` (or similar) helper is added to `lib/recipe.ts`, it gets full unit tests and is registered in `jest.config.js` `collectCoverageFrom`.
- Screens are verified the established way: `pnpm typecheck`, `pnpm lint`, `pnpm test`, plus a manual walk on web (create with sections and step times, edit an existing recipe, scale by servings and Reset, delete and undo), including a dark mode and reduced motion check.

## Constraints (unchanged house rules)

- No hyphens or dashes in any user facing copy.
- All strings via i18n `t('...')`; colors, spacing, radii from theme tokens only.
- No back buttons; the editor and detail are dismissible sheets.
- Dark mode, reduced motion, and floured fingers hold on every new surface.
- Only presentation and the additive `section?` field change. Engines, storage keys, monetization, and notifications are untouched.
