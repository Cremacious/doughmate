# Bake Journal — Design

Date: 2026-08-12
Branch: `redesign/proof`
Status: Approved for planning

## Problem

Doughmate helps you convert, scale, and track starters, but there is no way to record how a bake actually turned out. Competitive research showed a bake journal is a core feature of the category, and that Doughmate can win by tying a bake's crumb notes to the recipe and the starter state behind it, which no competitor does. This is also the groundwork for a future symptom based troubleshooting flow.

## Goals

- Log a bake with a star rating, quick crumb tags, notes, the date, and optional links to a saved recipe and the starter used.
- Browse a chronological bake history from a `Recipes | Bakes` segment inside the Recipes tab.
- Edit and delete a bake.
- Make logging easy right after baking: from the Bakes list, from a recipe detail, and from cook mode's final step.

## Non goals (this pass)

- No photos. Photo capture is a focused fast follow with its own native dependencies and storage.
- No structured 1 to 5 crumb scales; quick tags were chosen for feel and troubleshooting fit.
- No separate bake detail screen; the create/edit sheet doubles as the detail.
- No AI crumb analysis, no troubleshooting flow yet (the tags set it up).

## Design decisions (all user approved)

- A `Recipes | Bakes` segmented control at the top of the Recipes tab. Recipes shows the recipe box as today; Bakes shows the bake history plus a "Log a bake" button. Keeps the four tab design.
- Crumb is captured as **quick tappable tags** from a fixed vocabulary, not scales.
- A bake links to a recipe and a starter by **id plus a name snapshot**, so a bake card still reads correctly if the recipe or starter is later deleted.
- Three entry points to logging: the Bakes list, a "Log a bake" button on a recipe detail (prefills the recipe), and a "Log this bake" action on cook mode's final "All done" step (prefills the recipe).
- No photos this pass.

## Data model (new, self contained)

A new store `src/state/bakes.tsx` with a new storage key `doughmate.bakes.v1`. It does not touch the recipe or starter stores.

```ts
interface Bake {
  id: string;
  name: string;          // recipe name snapshot, or a freeform name the baker typed
  recipeId?: string;     // optional link to a saved recipe
  starterId?: string;    // optional link to the starter used
  starterName?: string;  // snapshot for display if the starter is later deleted
  rating: number;        // 1 to 5
  tags: string[];        // crumb tag ids
  notes?: string;
  bakedAt: number;       // the bake date (ms)
  createdAt: number;
}

interface BakeInput {
  name: string;
  recipeId?: string;
  starterId?: string;
  starterName?: string;
  rating: number;
  tags: string[];
  notes?: string;
  bakedAt: number;
}
```

Store methods: `bakes` (sorted by `bakedAt` descending for display), `addBake(input)`, `updateBake(id, input)`, `removeBake(id)`, `restoreBake(bake)` (for undo), `getBake(id)`. The `BakesProvider` is added to the provider tree in `app/_layout.tsx` alongside the others.

## Screens and flow

### Recipes tab: segmented

`app/(tabs)/recipes.tsx` gains a `SegmentedControl` at the top: `Recipes | Bakes`. Local state picks the segment.
- Recipes segment: the existing recipe box (tag filter, RecipeCard list, New recipe button) unchanged.
- Bakes segment: a chronological list of `BakeCard`s, an empty state (block Sam, "No bakes yet.", a line, a primary button), and a bottom anchored "Log a bake" button.

### BakeCard

Shows the bake name, the date (in `numeric.sm`), the star rating, up to a few crumb tags, and small link chips for the recipe (peach) and starter (teal) when present. Tapping the card opens the create/edit sheet for that bake.

### Log a bake sheet

`app/bake-new.tsx`, a tall bottom sheet, shared create and edit:
- `?id=<id>` opens edit, prefilled via `getBake`.
- `?recipeId=<id>` (create) prefills the recipe link and the name from that recipe.
- Fields, in order:
  - What you baked: a free text name `Input`, plus a "Link a recipe" `OptionSheet` picker over saved recipes. Choosing a recipe sets `recipeId` and fills the name with the recipe's name (still editable). Leaving it unlinked is a freeform bake.
  - When: `bakedAt` defaults to today. Adjusted with a small dependency free day stepper (today, then whole days back), shown as a friendly label ("Today", "Yesterday", "N days ago"). No native date picker dependency this pass; picking an arbitrary calendar date is a fast follow.
  - How it turned out: a tappable `StarRating` (1 to 5).
  - Crumb: the crumb tag chips.
  - Starter used: a "Starter used" `OptionSheet` picker over the starters, optional. Choosing one sets `starterId` and snapshots `starterName`.
  - Notes: a multiline field.
- Footer: "Save bake" (create) or "Save changes" (edit). Edit also shows a destructive Delete with an undo toast.
- On save: builds a `BakeInput`. If a recipe is linked, `name` snapshots the recipe name (unless the baker typed a custom name); if a starter is linked, `starterName` snapshots its name. Calls `addBake` or `updateBake`, then dismisses with a confirmation toast.

### Entry points

- Bakes list: "Log a bake" opens `/bake-new`.
- Recipe detail (`app/recipe/[id].tsx`): a "Log a bake" control opens `/bake-new?recipeId=<id>`.
- Cook mode (`app/recipe/[id]/cook.tsx`): the final step's primary stays "All done" (closes), and a quiet secondary "Log this bake" opens `/bake-new?recipeId=<id>`.

## Crumb tags (fixed vocabulary, i18n, hyphen and dash free)

Tag ids and copy: `open_crumb` "open crumb", `tight_crumb` "tight crumb", `good_ear` "good ear", `big_spring` "big spring", `dark_crust` "dark crust", `pale_crust` "pale crust", `gummy` "gummy", `dense` "dense", `flat` "flat", `sour` "sour", `airy` "airy", `golden` "golden". Rendered as selectable chips; stored as ids on the bake. The same ids will drive the future troubleshooting flow.

## Components and files

| File | Responsibility |
| --- | --- |
| `src/state/bakes.tsx` | The bakes store: type, provider, methods, persistence. |
| `src/ui/SegmentedControl.tsx` | A two or more option segmented control (Recipes / Bakes). Reusable. |
| `src/ui/StarRating.tsx` | A 1 to 5 star rating, read only or tappable. |
| `src/ui/BakeCard.tsx` | A bake summary card. |
| `app/bake-new.tsx` | The shared create/edit log a bake sheet. |
| `app/(tabs)/recipes.tsx` | Add the segmented control and the Bakes list. |
| `app/recipe/[id].tsx` | Add the "Log a bake" entry point. |
| `app/recipe/[id]/cook.tsx` | Add the "Log this bake" action on the final step. |
| `app/_layout.tsx` | Register `bake-new` (transparent modal) and add `BakesProvider`. |
| `src/i18n/en.json` | Segment labels, tag copy, log form copy, empty state, toasts. All hyphen and dash free. |

## Edge cases

- Freeform bake: no `recipeId`; `name` is what the baker typed; no recipe link chip.
- Recipe or starter deleted after logging: the bake still shows its `name` and `starterName` snapshots; a link chip only navigates when the id still resolves (guard `getRecipe`/`getStarter`).
- Empty tags, empty notes, and no starter are all allowed; rating defaults to a sensible value and is required to be 1 to 5.
- Empty bakes list shows the Sam empty state.
- Date defaults to today; editing preserves the original `bakedAt` unless changed.
- Delete plus undo mirrors the recipe and starter pattern.

## Constraints (house rules)

- No hyphens or dashes in any user facing copy.
- All strings via i18n; colors, spacing, radii from theme tokens only.
- No back buttons; the log sheet is a dismissible bottom sheet.
- Dark mode, reduced motion, floured fingers hold on every new surface.
- Additive and self contained: a new store and new screens only. The recipe and starter stores, engines, storage keys of other features, monetization, and notifications are untouched.
- Pure engine files under `src/lib` keep 100% coverage; if any pure helper is added (for example a bake sort or date label), it is tested and registered in `jest.config.js`.
