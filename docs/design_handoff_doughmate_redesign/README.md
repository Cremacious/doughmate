# Handoff: Doughmate redesign ("Proof" design system)

## Overview

A full visual and interaction redesign of Doughmate, built as a design system first. Four bottom tabs (Convert, Recipes, Starters, Swaps), Settings behind a gear in the header, one shape shifting Convert calculator holding all six converters, and every other destination as a bottom sheet that dismisses by swiping down. Sam stays a sourdough loaf, redrawn as a flat sticker illustration, and appears only in moments (results, confirmations, empty states, errors, onboarding, paywall).

Only the presentation layer changes. The engines in `app-src/src/lib`, the context stores in `app-src/src/state`, storage, RevenueCat, AdMob and notifications stay exactly as built.

## About the design files

The files in this bundle are **design references authored in HTML**, not production code. They show the intended look, layout, spacing, states and behaviour. Recreate them in the existing React Native + Expo app using its established patterns (Expo Router, Reanimated 4, react native gesture handler, the existing context stores). Do not port the HTML or its CSS.

Three files:

| File | What it is |
| --- | --- |
| `Doughmate Prototype.dc.html` | The interactive prototype. Tappable: tabs, six converter modes, sheets, cook mode, feed, delete and undo, Pro, onboarding. Toggles in the left rail switch light, dark, floured fingers and reduced motion. |
| `Doughmate Design System.dc.html` | Tokens, type ramp, spacing, radius, elevation, motion, Sam illustration rules, icon set, component library with variants and states. |
| `Doughmate Today.dc.html` | The app as it stands today, recreated from the repo for before and after comparison. Do not implement this one. |
| `theme.ts` | Ready to drop in replacement for `app-src/src/theme.ts`. Every token below is already in it. |

## Fidelity

**High fidelity.** Colours, type, spacing, radii, shadows and motion values are final. Recreate them exactly, reading values from `theme.ts` rather than from the HTML.

---

## Hard rules

1. **No hyphens or dashes in any user facing text.** Not em dashes, not en dashes, not hyphenated words. Rewrite around them. This includes new strings you add.
2. **Tokens only.** Every colour, size, radius, spacing, duration comes from `theme.ts`.
3. **Strings via i18n.** Everything user facing lives in `app-src/src/i18n/en.json` and is read with `t('key.path')`. New copy in this document needs new keys.
4. **No back buttons anywhere.** Tabs switch tabs, sheets dismiss by dragging down or tapping the scrim. Convert never pushes a screen.
5. **Dark mode, reduced motion and floured fingers hold on every screen.** Reduced motion means every spring becomes a 120ms opacity fade: nothing scales, travels or bounces.
6. **Sam is never permanent chrome.** He is removed from the tab layout entirely.

---

## Design tokens

All values are in `theme.ts` in this bundle. Summary:

### Colour, light

| Token | Hex |
| --- | --- |
| bgCanvas | `#FFF7EF` |
| bgSurface | `#FFFFFF` |
| bgSunken | `#F6E9DC` |
| border | `#EADBCB` |
| textInk | `#2C1E17` |
| textSoft | `#6F5A4C` |
| textFaint | `#A08D7C` |
| primary | `#F2603C` |
| primaryPressed | `#D84D2C` |
| primaryText | `#C24A26` |
| primaryWash | `#FFF3E8` |
| onPrimary | `#FFF9F4` |
| accentButter | `#FFC24B` |
| proofTeal | `#3E9C8F` |
| proofTealWash | `#E3F1EE` |
| proofTealText | `#2C7A70` |
| success | `#3F8F5F` |
| warning | `#E0A020` |
| danger | `#D64545` |
| dangerWash | `#FBE9E7` |
| pro | `#8E4B7A` |
| proWash | `#F6E8F2` |
| grabber | `#D9C6B2` |
| scrim | `rgba(44,30,23,0.42)` |
| toastBg / toastText | `#2C1E17` / `#FFF7EF` |

### Colour, dark

| Token | Hex |
| --- | --- |
| bgCanvas | `#17120F` |
| bgSurface | `#211A16` |
| bgSunken | `#1B1512` |
| border | `#342922` |
| textInk | `#F7ECE2` |
| textSoft | `#C0AA9B` |
| textFaint | `#8E7A6C` |
| primary | `#FF7A52` |
| primaryPressed | `#E2643D` |
| primaryText | `#FF9C7B` |
| primaryWash | `#3B231A` |
| onPrimary | `#2A1109` |
| accentButter | `#FFCD6B` |
| proofTeal | `#56B8A9` |
| proofTealWash | `#20302D` |
| proofTealText | `#7ED3C5` |
| success | `#6FBF89` |
| warning | `#F0B84A` |
| danger | `#F16B6B` |
| dangerWash | `#3A1F1E` |
| pro | `#C87BB0` |
| proWash | `#32202C` |
| grabber | `#4B3B31` |
| scrim | `rgba(0,0,0,0.55)` |
| toastBg / toastText | `#F7ECE2` / `#211A16` |

Usage rules: primary is the single primary action on a screen, never decoration. Butter is highlights, streaks and Sam props. Proof teal belongs to starters, fermentation and timers. Plum marks Pro and nothing else. In dark mode shadows soften and the hairline border does the lifting.

### Type

Fonts: **Gabarito** (display, headings), **Nunito Sans** (body, labels, titles), **Space Grotesk** (all numbers, tabular figures). All three are Google fonts under the OFL. Load with `expo-font`; the current Fredoka, Nunito and SF Mono references go away.

| Token | Family / weight | Size / line height |
| --- | --- | --- |
| display.xl | Gabarito 600 | 40 / 44 |
| display.lg | Gabarito 600 | 32 / 38 |
| display.md | Gabarito 600 | 26 / 32 |
| heading | Gabarito 600 | 20 / 26 |
| title | Nunito Sans 700 | 17 / 22 |
| body.lg | Nunito Sans 400 | 17 / 26 |
| body.md | Nunito Sans 400 | 15 / 22 |
| body.sm | Nunito Sans 400 | 13 / 19 |
| label | Nunito Sans 700, 0.96 letter spacing, uppercase | 12 / 16 |
| numeric.hero | Space Grotesk 600, tabular | 64 / 64 |
| numeric.lg | Space Grotesk 600, tabular | 30 / 34 |
| numeric.sm | Space Grotesk 500, tabular | 15 / 20 |

**Floured fingers** multiplies every size and line height by `1.25` (keep `scaleType` in `src/lib/typeScale.ts` for this) and raises the minimum touch target from 44 to 56. Nothing reflows into a different layout.

### Spacing, radius, elevation, motion

- Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 56. Screen gutter 24. Card padding 16 to 20. Stacked cards 12 to 16 apart.
- Radius: sm 8, md 12, lg 16, xl 22 (cards), 2xl 28 (sheets, result panel), pill 999 (buttons, chips).
- Shadows: sm `0 1px 2px 6%`, md `0 6px 18px 10%`, lg `0 14px 36px 16%`, sheet `0 -12px 40px 22%`, shadow colour `#4A2A18`.
- Springs: quick (320/22) for presses, chips and toggles; medium (210/18) for Sam moments, result pop and card enter; soft (130/20/1.1) for sheets and mode swaps.
- Durations: 120, 200, 320, 480. Sheet curve `cubic-bezier(0.32, 0.72, 0, 1)`.
- Haptics unchanged: tap, select, pop, success, warning.

---

## Sam

Flat vector, one 6 unit outline in `samOutline` with round joins, drawn on a 200 by 170 canvas. One crust fill: one crust fill `#E9B478` top and bottom, so the scored band reads only through the outline and the three slashes. Three score marks, always the same three. Cheeks are primary at 20 to 34 percent opacity. Eyes are 6r dots with one 2r highlight. **Expressions come from swapping eyes and mouth only, never from redrawing the loaf.** Props (butter sparkles, teal steam curls, whisk, jam jar) hang outside the silhouette, so any future mood is the same loaf plus a prop. No gradients, no drop shadow on Sam, no outline colour change in dark mode.

Four moods are drawn in the prototype and the system file: `idle`, `celebrate`, `wobble`, `proofing`. The planned set (idle, cookies, sourdough, macarons, focaccia, croissants, celebrate) follows the same construction. Keep `src/lib/sam.ts` and the Lottie swap in `src/assets/lottie/index.ts` as they are; the redesign changes the artwork, not the reaction mapping.

Three carriers, and Sam appears in exactly one at a time:

| Carrier | Size | Where |
| --- | --- | --- |
| Inline | 52pt beside one line of copy | Result reactions, confirmation toasts, weekly tip |
| Block | 76pt centred with a headline under him | Empty states, confirmations |
| Hero | 120 to 150pt | Onboarding, paywall, milestones |

---

## Component library

Every screen composes from these. Props listed are the minimum.

### Button
`variant: 'primary' | 'secondary' | 'quiet' | 'destructive'`, `size: 'md' | 'lg'`, `label`, `icon?`, `onPress`, `disabled`, `loading`, `haptic`.
- Pill radius. Height 48 (md) / 56 (lg), 56 / 64 in floured fingers. Label 16/700 (19 floured), gap 9 to icon.
- primary: `primary` bg, `onPrimary` label, shadow `0 6px 18px rgba(242,96,60,0.28)`. Pressed: `primaryPressed`, scale 0.97 with `spring.quick`. Disabled: opacity 0.35, no shadow.
- secondary: `bgSunken` bg, `textInk` label. quiet: transparent with 1.5 `border`, `textSoft` label. destructive: `dangerWash` bg, `danger` label.

### ModeChip / Chip / Tag
- ModeChip: height 44 (52 floured), pill, icon 17 plus label 14/700. Selected `textInk` bg with `bgCanvas` content; unselected `bgSunken` with `textSoft`. Row scrolls horizontally, last chip "All six" is transparent with a 1.5 `border`.
- Chip (options): height 36 (44 floured), selected `primary` on `onPrimary`, unselected `bgSunken` on `textSoft`.
- Tag: height 26, pill, 11/700. sourdough `primaryWash`/`primaryText`; slow rise and focaccia `proofTealWash`/`proofTealText`; cookies `proWash`/`pro`; weeknight butter at 22 percent.

### Segmented control
`bgSunken` track, radius pill, 4 padding. Selected segment `bgSurface` with shadow sm; labels 14/700. 40 tall (48 floured). For two or three exclusive short words only.

### Input, picker field, stepper, toggle
- Input: full width, 56 tall (64 floured), radius 16, `bgSunken`, numbers in `numeric` at 20, label above in `label`. Focus adds a 2pt `primary` ring.
- Picker field: same box, 17/700 value on the left, chevron 18 in `textSoft` on the right, opens a sheet.
- Stepper: two 48 circles (56 floured) in `bgSunken` with `textSoft` glyphs, value between them in `numeric.lg`.
- Toggle: 51 by 31 track, `primary` when on and `border` when off, 27 white knob, 160ms position transition (none when reduced motion).

### ResultDisplay
One per screen, bottom anchored. Sits on the card surface, 14 padding above the divider. Contents top to bottom: label in `label` colour `primaryText`; value in `numeric.hero` colour `textInk` with the unit word beside it in `heading` colour `textSoft`; a note line in `body.sm` colour `textSoft`. Empty state replaces the number with "Pick an ingredient and an amount". Result changes pop with `spring.medium`; a swap of value only fades under reduced motion.

### Cards and rows
- Card: `bgSurface`, 1px `border`, radius 22, padding 16, gap 10.
- RecipeCard: title `display.md`, total time right in `numeric.sm` `textFaint`, meta line `body.sm` `textSoft` ("9 ingredients · 6 steps · 1 loaf"), tag row. Optional teal progress bar plus a ferment line for the upcoming timer.
- StarterCard: name `display.md`, hydration badge in `proofTealWash`, 44 progress ring (`proofTeal`, or `primary` when due) plus countdown in `numeric.lg`, sub line in `body.sm`, Feed now button, 46 delete circle, fed count line. Border turns `primary` when a feed is due.
- SwapCard: missing name `title` plus amount in `numeric.sm`, a "swap for" label row with the swap icon in `primary`, the substitute in `body.md`, notes in `body.sm` `textFaint`.
- SettingsRow: 58 tall (68 floured), label `body.lg`, value or toggle right, 1px `border` between rows inside a grouped card.
- All list rows support swipe left to delete, which always produces an undo toast.

### BottomSheet
The only navigation besides the tabs. `bgCanvas`, radius 28 on the top corners, shadow sheet. Grabber 40 by 5 in `grabber`, 10 above and 6 below. Sizes: half 60 percent, tall 90 percent, full. Drag down past 120px or flick to dismiss; scrim `scrim` fades with the drag; tapping the scrim dismisses. Sticky footer for the primary action: 12/20/22 padding, 1px top `border`, `bgSurface`. Content scrolls under the fixed header. Enter and exit use `spring.soft` (opacity only under reduced motion).

### Toast, banner, empty state, error, loading
- Toast: absolute, left and right 20, bottom 112 (above the tab bar), radius 20, padding 13/15. Neutral variant uses `toastBg` with `toastText` and an action label in `accentButter`. Confirmation variant uses `primaryWash` with inline Sam at 34 and an action in `primaryText`. Auto dismiss 4.2s. Delete always offers Undo.
- Empty state: block Sam, headline `display.md`, one line of `body.md` `textSoft`, one primary button. Copy: recipes "No recipes yet." / "Save a conversion or write one from scratch."; starters "No starters yet." / "Let's meet the first one."
- Error: `dangerWash` card, `title` headline plus `body.md` line, Sam wobble when it is a full screen failure. Copy from `errors.*` in en.json.
- Loading: a calm shimmer on the shape of the content. No spinners, no Sam.

### TabBar
Floating card: margin 16 left and right, 14 bottom, padding 10/8, radius 26, `bgSurface`, 1px `border`, shadow md. Four items: Convert, Recipes, Starters, Swaps. Active item shows a 44 by 30 `primaryWash` pill behind a 20 icon in `primary` with the label in 11/700; inactive icons and labels are `textFaint`.

### Screen header
One line: title `display.lg` left, 44 gear circle in `bgSunken` right, plus a Pro pill when entitled. No other top chrome.

### Icons
24pt grid, 2pt stroke, round caps and joins, no fills except state dots. Set drawn in the system file: convert, recipes, starters, swaps, settings, pan, oven, yeast, egg, butter, timer, save, delete, add, search. Replace the Ionicons imports with this set (an in house SVG icon component is fine).

---

## Screens

### 1. Convert (`app/(tabs)/convert.tsx`)

Purpose: one calculator holding all six converters.

Layout, top to bottom: status bar, header ("Convert" plus gear), horizontal mode chip row (Ingredient, Pan, Oven, Yeast, Egg, Butter, then "All six"), scrolling input area with 24 gutters, then a bottom anchored block holding the ResultDisplay and the Save button, then the tab bar.

- Switching modes swaps the input card **in place**, no navigation. Cross fade plus a 8px rise with `spring.soft`; opacity only under reduced motion. The result panel and Save never move.
- "All six" opens the mode tray sheet (half): a two column grid of 6 cards, each icon plus label plus a hint line, selected card outlined in `primary` on `primaryWash`.
- Ingredient mode: picker field (opens the ingredient sheet, tall, with search and a "120 g per cup" right column), amount input, From chip row (cup, tbsp, tsp, ml, g, oz, lb), To chip row (g, oz, lb, cup, tbsp, tsp, ml). Both unit rows scroll horizontally on one line rather than wrapping, so the card fits above the Save button.
- Pan mode: Recipe pan and Your pan chip rows over the pans table. Result reads "8" round to 9x13 rectangle, scale your recipe by" plus "1.8x" and the matching bake time hint from `pan.bake_*`.
- Oven mode: temperature input plus Fahrenheit / Celsius chips. Result reads "350 Fahrenheit reads as 175 Celsius", note "Gas mark 4."
- Yeast mode: teaspoons input, You have and You want chip rows over the three types. Note gives the gram weight.
- Egg mode: count stepper, Recipe wants and You have chip rows over the five sizes. Note gives the rounded count and the gram weight of beaten egg.
- Butter mode: amount input plus From and To chips including stick.
- Save: primary, bottom anchored, icon plus "Save this". Saves through `useRecipes().addRecipe`, fires `haptic.pop`, shows the Sam inline moment ("Look at us.") and a confirmation toast ("Saved to your Recipe Box."). Keep the existing interstitial cadence for free bakers.
- Invalid input: no result number, note becomes "Hmm, that number's tricky. Want to try again?", Save disabled.

### 2. Recipes (`app/(tabs)/recipes.tsx`)

Purpose: the Recipe Box, designed as the flagship feature.

- Header plus a horizontal tag filter row (All plus tags in use). RecipeCard list, 12 apart. Bottom anchored "New recipe" primary button.
- Empty state: block Sam, "No recipes yet.", "Save a conversion or write one from scratch."
- Tapping a card opens the **recipe detail sheet** (tall): title `display.lg`, meta line, tag row, then
  - a scale block: yield label, current factor ("Original" or "Now at 1.5x"), servings stepper, and 0.5x / 1x / 2x chips. Every ingredient amount recomputes per line.
  - Ingredients: grouped list, item left in `body.lg`, quantity right in `numeric` tabular, 1px dividers.
  - Baker's percentages: Pro badge. Entitled shows flour, water, salt and the rest as percentages of total flour weight in `proofTeal`. Not entitled shows a plum locked card that opens the paywall.
  - Method: numbered step cards, 28 circle in `primaryWash` with the number in `numeric`, step text `body.lg`, per step time in `numeric.sm` `proofTeal`.
  - Notes: quiet card, `body.md` `textSoft`.
  - Destructive "Delete recipe" at the end of the scroll; footer holds "Start baking".
- **Cook mode** (full sheet): recipe name and "Step 3 of 6" on one line, progress dots (active dot widens to 22), giant step number, step text in `display.md`, step time in teal, then "Back a step" quiet plus "Next step" primary. Last step reads "All done" and closes with a Sam toast. Screen stays awake; targets are large because hands are messy.
- **New recipe sheet** (tall): name, yield, ingredients textarea (one per line, parsed into amount, unit and item so each line scales later), method textarea (one step per line), tag chips. Footer "Save recipe".
- Delete from a card swipe or from the detail sheet removes immediately and shows the undo toast for 4.2s.

### 3. Starters (`app/(tabs)/starters.tsx`)

- StarterCard list, bottom anchored "Add a starter".
- Countdown recomputes from `lastFedAt + intervalHours`; ring fills as the interval elapses. Due state: border and ring turn `primary`, countdown reads "Feed now", sub line reads "she has been waiting 3h".
- Feed now: `haptic.success`, stamps the feed, increments the count, toast "Well fed. Betty is happy." with inline Sam. Keep `ReminderSync` untouched.
- Add starter sheet (tall): name, hydration chips (80, 100, 125 percent), feed ratio chips (1:1:1, 1:2:2, 1:5:5), feed every stepper in 6 hour steps, notes. Footer "Add starter". Toast "Meet Betty."
- Delete gives the undo toast. Empty state uses Sam proofing, "No starters yet." / "Let's meet the first one."

### 4. Swaps (`app/substitutions.tsx` becomes a tab)

- Header, sticky search field (52, `bgSunken`, search icon plus input), SwapCard list from `src/lib/substitutions.ts`.
- No results: "Nothing matches. Try another ingredient."
- Free tier ends with a plum teaser card, "80 more swaps with Pro", opening the paywall.

### 5. Settings (gear, sheet, tall)

Sections in order, each a grouped card under a `label` heading: Appearance (theme segmented Light / Dark / Auto), Sound and feel (reduced motion with the description "A calm version of every animation.", sound effects, haptics), Preferences (default units segmented, flour standard segmented 120g / 125g per cup, floured fingers mode with its description), Notifications (starter reminders, weekly baking tip from Sam), Pro (plum row, "Get Doughmate Pro $4.99" or "Doughmate Pro Unlocked"), About (ingredient sources, version). Every control writes straight to the settings store. No tab bar entry.

### 6. Paywall (sheet, tall)

Hero Sam celebrating, "Doughmate Pro" `display.lg`, "Single purchase, no subscription.", six perk rows each a bordered card with a plum check: unlimited recipes, unlimited starters, baker's percentages, fermentation timer, every theme, no ads ever. Footer: plum "Get Pro for $4.99" plus quiet "Restore purchases". Success toast "Pro unlocked. Thank you." Restore with nothing to restore: "Nothing to restore right now. Purchases follow your account."

### 7. Onboarding (`app/onboarding/*`, three steps)

Full screen, `bgCanvas`, no chrome. Step 1 hero Sam idle, "Hi. I'm Sam.", "Let's make the math easy." Step 2 shows three sample result cards (120 g, 6h 20m, 1.8x) with "I do the fiddly math." Step 3 hero Sam proofing, "Want a nudge at feeding time?", explaining reminders and the weekly tip. Progress dots, primary CTA (Get started / Next / Sure) and a quiet Skip or Maybe later. Step 3 accept writes the reminders setting and shows a Sam toast.

---

## Interactions and behaviour

| Interaction | Behaviour |
| --- | --- |
| Mode switch | Input card cross fades and rises 8px, `spring.soft`. Result and Save stay put. `haptic.select`. |
| Result change | Number pops with `spring.medium` from 0.96 scale. Reduced motion: no pop. |
| Button press | Scale 0.97, `spring.quick`, `haptic.tap`. |
| Sheet open | Translate from 100 percent with `spring.soft`, scrim fades to full over 200ms. |
| Sheet dismiss | Drag follows the finger, dismisses past 120px or on a fast flick, otherwise springs back. Tapping the scrim dismisses. |
| Toggle | Knob travels 160ms ease; reduced motion snaps. |
| Save | `haptic.pop`, Sam inline moment for 4.2s, confirmation toast. |
| Feed | `haptic.success`, ring resets, toast. |
| Delete | `haptic.warning`, row removed, undo toast 4.2s, undo restores in place. |
| Cook mode step | Step text cross fades, dot widens. |
| Floured fingers | All type by 1.25, targets to 56, sheet paddings up one step. |

## State

No new stores. Existing ones cover it: `settings` (theme, reducedMotion, sound, haptics, units, flourStandard, flouredFingers, reminders, weeklyTip, onboarded), `recipes`, `starters`, `pro`, `samMood`. New local UI state per screen: convert `mode` plus per mode inputs, recipe detail `scaleFactor` and `cookStepIndex`, sheet stack (one at a time), toast queue (one at a time with an undo payload), search strings.

Recipes need a richer shape than today. Migrate `{ name, lines[] }` to:

```ts
type Recipe = {
  id: string; name: string; tags: string[]; totalTime?: string;
  yieldLabel: string; servings: number;
  ingredients: { amount: number | string; unit: string; item: string }[];
  steps: { text: string; time?: string }[];
  notes?: string;
  createdAt: number;
};
```

Migrate v1 records by parsing each line into amount, unit and item, keeping the raw string as `item` when parsing fails. Bump the storage key to `doughmate.recipes.v2` and keep a one time read of v1.

## Routing

Expo Router, reworked to the new IA:

- Tab group `(tabs)`: `convert`, `recipes`, `starters`, `swaps`. Remove `settings` from the tab group and remove Sam from `(tabs)/_layout.tsx`.
- Sheet routes presented with `presentation: 'formSheet'` (or a gesture handler sheet): `settings`, `paywall`, `recipe/[id]`, `recipe/[id]/cook`, `recipe-new`, `starter-new`, `convert-modes`, `ingredient-picker`.
- Delete `app/more-tools.tsx`, `pan.tsx`, `oven.tsx`, `yeast.tsx`, `egg.tsx`, `butter.tsx` and `scaler.tsx` as screens; their engines stay and are consumed by Convert modes and the recipe scale block.
- `app/index.tsx` onboarding gate unchanged.

## Mapping to the current app

| Design piece | Existing code to keep | What changes |
| --- | --- | --- |
| Tokens | `src/theme.ts` | Replace wholesale with the bundled `theme.ts`. Same import surface. |
| Copy | `src/i18n/en.json` | Keep every existing key. Add keys for the new strings in this document (cook mode, tags, scale block, swaps teaser, onboarding step 2). |
| Convert math | `src/lib/convert.ts`, `pan.ts`, `oven.ts`, `yeast.ts`, `egg.ts`, `butter.ts` | Untouched. Convert modes call them directly. |
| Substitutions | `src/lib/substitutions.ts` | Untouched, now a tab. |
| Recipe scaling | `src/lib/recipe.ts` | Untouched. Drives the per line scale in the detail sheet. |
| Sam reactions | `src/lib/sam.ts`, `src/assets/lottie/*` | Mapping untouched. Artwork replaced per the illustration rules. |
| Stores | `src/state/*` | Untouched except the Recipe shape migration. |
| A11y | `src/hooks/useAppTheme.ts`, `useReducedMotion.ts`, `src/lib/typeScale.ts` | Untouched. `fontScale` now 1.25 in floured fingers. |
| Monetization, ads, notifications | `src/lib/purchases*`, `ads*`, `notifications.ts`, `components/AdBanner*` | Untouched. Banner sits above the tab bar with 12 clearance and never over the bottom anchored action. |
| Components | `src/components/*` | Rebuilt against the component library above. `Screen.tsx` and `ModalHeader.tsx` are replaced by the screen header and the sheet header. |

## Assets

No bitmaps. Sam and every icon are SVG, drawn in the bundled HTML files and specified above. Fonts come from Google (Gabarito, Nunito Sans, Space Grotesk) through `expo-font` or `@expo-google-fonts/*`.

## Suggested order

1. Land `theme.ts` and the font loading, then the primitives (Button, Chip, Input, Toggle, Card, Sheet, Toast).
2. Rework routing to four tabs plus sheets, remove Sam from the tab layout.
3. Convert with all six modes on the shared result and Save.
4. Recipes: migration, list, detail, scale, cook mode, create.
5. Starters, Swaps, Settings, Paywall, Onboarding.
6. Sweep for dark mode, reduced motion, floured fingers and hyphens.
