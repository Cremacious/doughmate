# Doughmate redesign handoff — "Fresh Bake"

Implementation brief for Claude Code. Only the presentation layer changes.

**Ship with this doc:** `handoff/theme.ts` (drop-in replacement for `app-src/src/theme.ts`) and `Doughmate Redesign.dc.html` (every screen, light and dark, plus a component board).

---

## 1. Scope

**Rebuild:** `app-src/src/ui/*`, `app-src/src/components/Sam.tsx`, and the render bodies of every route under `app-src/app/`.

**Do not touch:** `src/lib/*` engines, `src/state/*` stores, `src/data/*`, storage, notifications, RevenueCat, AdMob wiring, or the route graph. No new features, no removed features.

**Rules that still hold:** tokens only, never hardcode. Every string through `t('key.path')` from `src/i18n/en.json`. No hyphens or dashes in user facing text. Dark mode, reduced motion and floured fingers on every screen.

**Strings:** the redesign introduces no new copy. Where a screen shows something new (eyebrow lines like "One is hungry", "18 free swaps", "12 saved"), compose it from existing keys and store values, or add a key to `en.json` in Sam's voice. Do not inline English.

---

## 2. What the redesign actually fixes

Three problems drove it. Every decision below traces to one.

1. **No card hierarchy.** Proof v2 gave every card the same white fill and 1px hairline, so the answer, the inputs and a dismissible tip weighed the same. Fresh Bake has three surface tiers and allows exactly one hero per screen.
2. **Tab bar collided with content.** A floating tab bar plus a floating full width button stacked two layers of chrome over the list. The tab bar is now a flush ink shelf, and the screen level create action is a corner FAB.
3. **Empty states were thin.** Centred Sam, two lines, no way forward. Empty states are now a hero block with Sam, a line in his voice, and two routes out.

---

## 3. Visual system

### Surface tiers

| Tier | Fill | Stroke | Shadow | Radius | Rule |
| --- | --- | --- | --- | --- | --- |
| Hero | `primary`, `accentButter`, `proofTeal` or `pro` | `stroke.ink` in `outline` | `hardShadow.hero` | `radius.hero` (26) | **One per screen.** It is the thing you look at first. |
| Standard | `bgSurface` | `stroke.ink` in `outline` | none | `radius['3xl']` (24) | Inputs, lists, groups. |
| Quiet | `bgSunken` | `stroke.soft` in `border` | none | `radius['2xl']` (20) | Fields, notes, read only detail. |
| List card | `bgSurface` | `stroke.ink` in `outline` | `hardShadow.card` | `radius['3xl']` | Recipe and bake cards only. 8px colour strip at the top edge, inside `overflow: hidden`. |

A screen with two heroes is a bug. Convert's answer is the hero; the input card is Standard. Starters promotes only the due starter to hero. Recipes has no hero, so the FAB carries the weight.

### Hard shadows

No blur anywhere in light mode. `hardShadow` gives offset and colour only.

React Native cannot draw an offset hard shadow portably: iOS honours `shadowRadius: 0`, Android's `elevation` always blurs and ignores offset. **Implement one `<HardShadow>` primitive** and route every shadowed surface through it:

```tsx
// src/ui/HardShadow.tsx
// Renders a solid, offset, same-radius View behind its child. Identical on both
// platforms, and it can animate to the pressed offset.
export function HardShadow({ offset, radius, color, pressed, children }) { /* ... */ }
```

It takes `offset` from `hardShadow.control | hero | card`, matches the child's `borderRadius`, and swaps to `hardShadow.pressed` while pressed. Do not use `shadow.*` in light mode except on the dark mode FAB and the toast.

### Dark mode drops the outline

Ink strokes and hard shadows do not read on a dark canvas. On dark: `outline` collapses to the same value as `border` (`#342922`), `HardShadow` renders nothing, and hierarchy comes from fill weight instead. Heroes go full saturation with dark type on top (`onPrimary`, `onButter`, `onTeal`, `onPro`). Raised surfaces get lighter, never outlined. Both modes are drawn in `4c` of the design file.

### Type

Bricolage Grotesque for display and headings with negative tracking. Space Grotesk for every number a baker reads. Nunito Sans for body, and heavier (`800`) for labels, buttons and chips. Full ramp in `handoff/theme.ts`.

Two habits to keep: **the eyebrow label** (`typography.label`, coloured by meaning, sits above the screen title and carries live state such as "One is hungry" or "1 running"), and **numbers never render in the body face** — a count, a duration, a temperature or a weight is always Space Grotesk.

### Colour meaning

`primary` is the answer and the urgent action. `accentButter` is selection and celebration. `proofTeal` is time and fermentation. `pro` is plum, always and only. `outline`/`textInk` is structure. Never use two hero colours on one screen.

---

## 4. Component specs

Every component keeps its current file path and public props unless noted. Sizes are at `fontScale.normal`; multiply type by `fontScale` and swap heights to the floured fingers column in §6.

### Button (`src/ui/Button.tsx`)

Props unchanged: `label, onPress, variant, size, icon, disabled, loading, haptic, fullWidth`.

- Shape: `radius.xl` (16), **not** a pill. Height `md` 54, `lg` 60. Face `typography.button`.
- `primary` — `primary` fill, `stroke.ink`, `hardShadow.control` at `md` / `hardShadow.hero` at `lg`, `onPrimary` text.
- `secondary` — `bgSurface` fill, `stroke.ink`, no shadow, `textInk`.
- `quiet` — transparent, `stroke.soft` **dashed** in `border`, `textSoft`.
- `destructive` — `dangerWash` fill, 2px `danger` stroke, `danger` text.
- Pressed (primary and secondary): translate `+press.travel` on x and y, shadow to `hardShadow.pressed`, over `press.duration`. Reduced motion: no translate, opacity `press.reducedOpacity`.
- Disabled: `bgSunken` fill, `border` stroke, `textDisabled`, no shadow.

### IconButton — new, extract from `ScreenHeader`

44 or 46 square, `radius.lg`, `bgSurface`, `stroke.ink`, `hardShadow.control`. This is the gear. A quiet variant (`bgSunken`, no stroke, no shadow, `radius.md`) is the inline delete on cards.

### FAB — new (`src/ui/Fab.tsx`)

60 circle, `accentButter`, `stroke.inkHeavy`, `hardShadow.control`, 26px ink icon. Anchored `spacing.xl` from the right edge, `spacing.xl` above the tab shelf — or above the ad slot when it is showing. Replaces the full width bottom anchored button on Recipes and Starters. Sheets keep their sticky footer button.

### Card (`src/ui/Card.tsx`)

Add a `tier: 'hero' | 'standard' | 'quiet'` prop (default `standard`) and a `heroColor` prop. Padding `spacing.lg` (18), internal gap `spacing.sm` (10). Drop the old single hairline style.

### Chip (`src/ui/Chip.tsx`)

Pill, height 36 (`sm`) or 44 (`md`). Selected: `outline` fill with `onPrimary` text, **or** `accentButter` fill with `stroke.soft` ink for a lighter emphasis — the two are not interchangeable. Ink for unit and type selection, butter for filters and the active mode. Rest: transparent with `stroke.soft` in `borderField`, `textSoft`.

### ModeChip (`src/ui/ModeChip.tsx`)

**Behaviour change.** Only the selected mode shows its label; the rest are 44 circular icon only chips, and the row ends with a `+N` pill that opens the tray. This is what keeps the row inside 390px, and it is why the row no longer scroll clips. Selected: `accentButter`, `stroke.ink`, `hardShadow.control`, label `typography.chip`. The row needs `paddingBottom: spacing.xs` so the hard shadow is not clipped.

### SegmentedControl (`src/ui/SegmentedControl.tsx`)

Not a track any more. Two or three pills side by side, `gap: spacing.sm`, height 42. Active `outline` fill with `onPrimary`; rest `stroke.soft` in `border` with `textSoft`.

### Input / PickerField / AmountField

Height 52, `radius.lg` (14), `bgCanvas` fill, `stroke.soft` in `borderField`. Focused swaps to `stroke.ink`. Label above in `typography.label`, `textFaint`. Numeric values in `typography.numeric.md`.

**UnitPair — new.** Replaces the two stacked from/to chip rows on Convert. One 52 tall `outline` filled row: from unit in `onPrimary`, an arrow in `accentButter`, to unit in `accentButter`. Tapping either half reveals that side's chip row beneath. Only one chip row is ever on screen at a time.

### Stepper (`src/ui/Stepper.tsx`)

Circles 44 (52 on Egg's count), `bgCanvas`, `stroke.ink`, glyph `NunitoSans_800ExtraBold` 22. Value in `typography.numeric.lg`. Egg's count and floured fingers amount space the buttons to the row edges with the value centred.

### Toggle (`src/ui/Toggle.tsx`)

Track 52×32, `radius.pill`, `stroke.ink`, `box-sizing: border-box`, knob 24 with a 2px ink stroke, vertically centred. Off `bgSunken`; on `primary`. Travel 20, 160ms. Dark: no strokes, knob is `onPrimary` on the primary track.

### ResultDisplay (`src/ui/ResultDisplay.tsx`)

Now the hero itself, left aligned, not a centred block. Structure: eyebrow (`typography.label`, `onPrimarySoft`) → value row (`typography.numeric.hero` in `onPrimary`, unit in `subheading` `onPrimarySoft`, baseline aligned, `gap: spacing.sm`) → **one** context element:

- a butter pill with `stroke.ink` for a qualifier (`1 cup All Purpose Flour`, `Gas mark 4`, `Instant yeast`, `1 stick, 113 g`)
- or an `outline` filled inset with a teal timer icon for a sentence (the pan bake time hint)

Empty state: replace the value row with `typography.body.lg` in `onPrimarySoft`, keep the eyebrow. `PopIn` on value change stays; reduced motion fades.

### ProgressRing → ProgressBar

The ring is gone. Starter progress is a 8 or 10 tall `radius.pill` bar: `bgSunken` track (`rgba(36,22,17,0.28)` on a hero), fill `proofTeal` while proofing and `accentButter` on a hero card. Keep `ProgressRing.tsx` only if something else uses it.

### Tip (`src/ui/Tip.tsx`)

`butterWash` fill, `stroke.soft`, `radius['2xl']`, Sam at 34, `body.md`, close target 44.

### Toast (`src/ui/Toast.tsx`)

`toastBg` fill, `radius.xl`, no stroke, `shadow.md`. Message `NunitoSans_700Bold` 15 in `toastText`; action in `toastAction` as `typography.labelSm`.

### BottomSheet (`src/ui/BottomSheet.tsx`)

Panel `bgCanvas`, `radius.sheet` (30) top corners, `stroke.ink` top border, `shadow.sheet`. Grabber 46×6 in `grabber`. Sticky footer: `bgSurface`, `stroke.ink` top border, `paddingTop: spacing.md`, bottom inset + `spacing.md`. Swipe down to dismiss, unchanged. No back buttons anywhere.

### TabBar (`src/ui/TabBar.tsx`)

**Not floating.** Flush to the bottom edge, full width, `tabShelf` fill, `radius.hero` top corners only. Padding `10px 14px`, plus the bottom safe inset. Active: icon in a 46×32 `tabShelfActive` pill with `onButter` icon, label `NunitoSans_800ExtraBold` 11 in `tabShelfActive`. Rest: `tabShelfIdle`. Screen content clears the shelf with `paddingBottom: 100` (`118` when the ad slot shows).

### Sam (`src/ui/Sam.tsx` / `Sam.native.tsx`)

Geometry, faces and accents unchanged — the loaf is already right. Two changes:

1. Stroke weight goes from 2.6 to 3.0, and ear scoring from 3.0 to 3.4, so he holds up beside 2px outlined cards.
2. Add an optional `tightCrop` prop that switches the viewBox to `6 12 108 84`. Use it whenever Sam sits inside a circular avatar (starter cards, starter detail) so he fills the circle instead of floating in it. Untouched for standalone use.

On a butter or plum hero, pass the pale crust (`samCrustPale`) so he does not disappear into the fill.

### EmptyState — new (`src/ui/EmptyState.tsx`)

Hero tier, `accentButter` fill, `stroke.ink`, `hardShadow.hero`, `radius.hero`. Sam at 150 with the pale crust, a two line `display.md` headline, a `body.md` line in `onButterBody`, then **two** actions: primary (`outline` fill) and secondary (`bgSurface` with `stroke.ink`). Optional dashed suggestion tiles below, outside the card. Recipes, Bakes and Starters all use it.

### AdSlot — new (`src/ui/AdSlot.tsx`)

Wraps `components/AdBanner`. `adSlot.height` 66, `radius.xl`, `bgSunken`, `stroke.soft` **dashed** in `border`, `adSlot.gutter` 14 from the screen edges, `adSlot.gapToShelf` 12 above the tab shelf. It sits **on the canvas, never over a card, never under the FAB** — the FAB lifts above it. Returns `null` for Pro, and the screen's bottom padding drops back to 100.

---

## 5. Screen specs

Each entry names the route, its hero, and anything the current code does not already do. Reference the matching option id in `Doughmate Redesign.dc.html`.

### Convert — `app/(tabs)/convert.tsx` — `2a`, `5a`, `5b`

Header eyebrow names the active mode. Mode row per ModeChip above, `paddingBottom: spacing.xs`. Hero is `ResultDisplay`. Standard card holds the inputs: amount and `UnitPair` on one row, then the single revealed chip row. A footnote line with a 30px Sam sits below the card, outside it — this replaces the dismissible Tip on this screen. Per mode:

| Mode | Inputs | Hero value | Context element |
| --- | --- | --- | --- |
| Ingredient | picker, amount, UnitPair | converted amount + unit | butter pill: `{amount} {from} {ingredient}` |
| Pan | two pan pickers stacked with a centred ink down arrow between; each shows `{name}` and `{area} sq in` | scale factor + `×` | ink inset + teal timer icon: the bake time hint |
| Oven | 76 tall temperature field (`numeric` 44), Fahrenheit/Celsius as two half width pills, common temp chips | converted temp + `°C`/`°F` | butter pill: `Gas mark {n}` |
| Yeast | whole / fraction / fixed `tsp` unit, then two three-up type rows | teaspoons | butter pill: target yeast name |
| Egg | edge spaced stepper, then two four-up size rows | count + `eggs` | butter pill: `{size}, {grams} g each` |
| Butter | amount + UnitPair, then from and to chip rows | converted amount + unit | butter pill: `{n} stick, {grams} g` |

Mode tray (`5b`): sheet, one row per converter — 42 icon tile, name in `subheading`, hint in `body.sm`. Selected row is a butter hero row with a check.

### Recipes — `app/(tabs)/recipes.tsx` — `2a`, `5d`

Eyebrow shows the saved count. SegmentedControl for Recipes / Bakes. Filter chips are butter when active and show the count on "All". List cards per §3 with the 8px tag colour strip: teal for sourdough or bread, butter for sweet, tomato otherwise. Meta row renders counts as Space Grotesk numerals with body labels, separated by 1px rules — not a joined `·` string. FAB creates. `EmptyState` when empty. `AdSlot` above the shelf for free bakers.

### Starters — `app/(tabs)/starters.tsx` — `2a`, `5d`

Eyebrow reports the due count. The **first due** starter is the hero (tomato fill, Sam in a butter circle with `tightCrop`, countdown in `numeric` 34, full progress bar, `bgSurface` filled Feed now button). Not due starters are Standard: teal circle, teal eyebrow with mood and hydration, countdown with a body suffix, partial teal bar, quiet Feed early button. Delete is the quiet IconButton. FAB adds. `EmptyState`, `AdSlot`.

### Swaps — `app/(tabs)/swaps.tsx` — `3a`, `4c`

Eyebrow counts free swaps. Search field is Standard tier, 54 tall, with a search icon and the placeholder "Out of what?". Each swap is a Standard card: missing ingredient as the `heading`, amount in a sunken numeric pill, then the substitute inside a **quiet inset** with a tomato swap icon and an `Use instead` label, then notes in `body.sm` `textFaint`. The inset is what stops the answer reading as a caption. Pro teaser is a plum hero with a circular chevron.

### Recipe detail — `app/recipe/[id].tsx` — `3a`, `4c`

Sheet. Header: tag eyebrow, two line title, Edit as a Standard tier pill with `hardShadow.control`. Meta as three sunken numeric tiles. Scale is a **butter hero** with the stepper. Ingredients are a Standard card with teal section pills and amounts in tomato `numeric.sm` at `minWidth: 58`. Baker's percentages locked is a plum quiet card with a `Pro` badge. Footer: primary Start baking plus a 54 square secondary that opens the bake plan.

### Cook mode — `app/recipe/[id]/cook.tsx` — `5c`

**The only screen that inverts on both themes.** `cookCanvas` fill. Centred recipe name eyebrow and `Step n of m`. Progress dots. A 96px `cookGhost` step number, the step text at `display.xl` in `onPrimary`, a teal duration block beside a butter Start timer button. Footer on `cookFooter`: 60 tall Back a step (outlined) and Next step (tomato), plus a `body.sm` line reminding the baker to swipe down. Last step swaps Next for All done and reveals Log this bake.

### Starter detail — `app/starter/[id].tsx` — `5c`

Sheet. Tomato hero: Sam at 66 in an 84 butter circle (`tightCrop`), mood name in `heading`, mood sub in `body.md`, countdown as an ink pill. Then the 28 day heatmap in a Standard card (cells `width: 14.28%`, `aspectRatio: 1`, `padding: 3`, `radius.sm`, teal at 0.35 / 0.65 / 1, today ringed 2px tomato) with the legend right aligned. Then three stat tiles: total feeds, interval, hydration — the third is teal filled. Then a quiet card of ratio and notes. Footer: Feed now.

### Sheets: new recipe, add starter, log a bake, plan a bake — `4a`, `4b`

All Standard tier groups on canvas, sticky primary footer.

- **New recipe** — name field gets `stroke.ink` (it is the one required field). Ingredient rows are amount (64) / unit (62, sunken with `▾`) / item (flex). Add ingredient is a dashed quiet row. Method steps use a 30 numbered circle, butter with `stroke.ink` for filled steps and sunken for the empty one.
- **Add starter** — Sam at 52 with the curious face beside the title. Hydration and ratio are three-up pill rows; the selected hydration is butter with `hardShadow.control`, the selected ratio is ink filled — same control, two emphases, because hydration is the one people change. Interval is an edge spaced stepper reading `24 hours`.
- **Log a bake** — rating is a **butter hero**: five 30px stars in ink plus a plain language summary. Crumb tags are ink filled when on. When and Starter used sit on one row.
- **Plan a bake** — teal hero holds the ready by time: two 78×64 `bgSurface` numerals with `stroke.ink`, AM/PM stacked, and a start time line beneath. Schedule below in a Standard card: 14 dot rail with a 2.5px connector, time in `numeric.sm` at `width: 62`, step text, duration in a teal pill. Checkpoints get a hollow dot and a `checkpoint` label. The next step's row gets a `proofTealWash` background bleeding 6px past the card padding. Finish node is a butter dot with `Ready to enjoy` in `subheading`.

### Settings — `app/settings.tsx` — `3b`, `4c`

Sheet. Section labels in `typography.labelSm`, `textFaint`. Theme is three equal pills, active butter with `hardShadow.control`. Toggle groups are one Standard card with rows divided by 1.5px `divider`. Flour standard renders as two 52 tall tiles showing the number in Space Grotesk over a `per cup, US` caption — the number is the decision, so it leads. Pro is a plum hero.

### Paywall — `app/paywall.tsx` — `3b`

Sheet. Plum hero panel with Sam excited on the pale crust, title, and a `One payment. Yours for good.` label. Perks are one Standard card, rows divided by 1.5px, each with a 26 circular plum outlined check. Footer: tomato Get Pro with the price in `numeric` beside the label, restore as a quiet text row.

### Onboarding — `app/onboarding/*` — `3c`

Full bleed `accentButter` canvas, no card. Sam at 196 with the pale crust, `display.xl` headline, `body.lg` in `onButterBody`. Dots: active 26×9 in `outline`, rest `rgba(36,22,17,0.28)`. Primary is a 58 `outline` filled button with butter text and a soft ink shadow; skip is a quiet text row in `onButterSoft`. Steps 2 to 5 keep the layout and swap hero, headline and body.

### Timers — `app/timers.tsx` — `3c`, `4c`

Eyebrow counts running timers. Running timer is a teal hero: source eyebrow, step name, `numeric.hero` remaining with a `left` suffix, butter progress bar, then Started and Done at as **labelled** `numeric.sm` pairs, not caption text. A ruled `Custom timer` divider, then a Standard card: label field, Hours and Minutes as two 60 tall tiles (the active one ink filled with butter numerals), preset chips, and a tomato Start timer.

---

## 6. Floured fingers — `5d`

`useAppTheme().fontScale` already exists. Multiply every font size and line height by 1.25 and apply this table. Nothing may reflow into a scroll trap or clip a shadow.

| Element | Normal | Floured |
| --- | --- | --- |
| Screen gutter | 22 | 20 |
| Header title | `display.lg` 36 | 42 |
| IconButton (gear) | 46, `radius.lg` | 58, `radius['2xl']` |
| ModeChip | 44 | 56 |
| Visible mode chips | selected + 3 icons + `+2` | **selected + 1 icon + `+4`** |
| Field height | 52 | 66 |
| Stepper circle | 44 | 60 |
| Button `md` / `lg` | 54 / 60 | 64 / 72 |
| Tab shelf icon pill | 46×32 | 56×38 |
| Tab label | 11 | 13 |
| Hero numeral | 76 | 88 |

The one behavioural change: **the amount field gains a stepper on both sides.** Typing with dough on your hands is the thing floured fingers exists to avoid, so the keyboard becomes optional, not required.

---

## 7. Motion

Keep the three springs and the five haptics. Nothing new.

- Mode swap: `FadeInDown` on `spring.soft`, keyed by mode. Reduced motion: 120ms fade.
- Result change: `PopIn`. Reduced motion: fade.
- Press on anything with a hard shadow: translate `press.travel` down and right, shadow to `hardShadow.pressed`, `press.duration`. Reduced motion: no translate, opacity `press.reducedOpacity`.
- Sheet enter and exit: unchanged (`spring.soft` in, 220ms out, opacity only under reduced motion).
- Toggle: 160ms travel, snaps under reduced motion.
- Progress bars animate width on `spring.medium`; reduced motion sets width directly.

---

## 8. Suggested order

1. `theme.ts` from `handoff/theme.ts`, plus `expo-font` loading for the three families. Nothing renders correctly until the fonts are in.
2. `HardShadow`, then `Button`, `IconButton`, `Card`, `Chip`, `ModeChip`, `SegmentedControl`, `Input`/`PickerField`/`UnitPair`, `Stepper`, `Toggle`, `ProgressBar`.
3. `TabBar` (flush shelf) and `Screen` (bottom padding 100, FAB and AdSlot anchors). This is where the collision fix lands.
4. `Fab`, `EmptyState`, `AdSlot`, `Toast`, `Tip`, `BottomSheet`, `Sam` (stroke weight + `tightCrop`).
5. Convert, all six modes and the tray.
6. Recipes, Starters, Swaps.
7. Sheets: recipe detail, create and edit, add starter, log a bake, plan a bake, settings, paywall.
8. Cook mode, starter detail, onboarding, timers.
9. Dark pass, then floured fingers pass, then reduced motion pass. Each is a sweep across everything, not a per screen afterthought.

---

## 9. Definition of done

- Every screen renders in light and dark, at both font scales, with reduced motion on and off.
- No screen has two hero cards.
- No content sits under the tab shelf, the ad slot or a sheet footer.
- No hard shadow is clipped by an `overflow: hidden` parent.
- Every colour, size, radius and duration resolves to a token. `grep` for hex literals outside `theme.ts` returns nothing but Sam's fixed brand accents.
- Every user facing string comes from `en.json`, and none contains a hyphen or dash.
