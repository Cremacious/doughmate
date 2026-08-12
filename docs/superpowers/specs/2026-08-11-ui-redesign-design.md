# Doughmate UI / UX Redesign — Design Brief

**Date:** 2026-08-11
**For:** Claude Design (claude.com/product/design) will create the new visual
design from this brief.
**Status:** Structure and interaction model agreed. Visuals are open per the
latitude below.

---

## 1. Why we are redesigning

The app is functionally complete but the design reads as "still in progress."
Three problems, in priority order:

1. **UX / navigation (top priority).** Reaching the secondary tools means
   drilling through a "More tools" hub into a stack of full screen modals, each
   closed with a top corner back button. It feels clunky.
2. **Not touch first.** Small targets, text heavy screens, controls placed away
   from the thumb.
3. **Aesthetic.** It looks like a prototype, not a finished app. We want cozy and
   modern.

This redesign covers **UI, UX, and structure of the current feature set**. It
does **not** add new features. Nailing this iteration's design is the goal before
any new features are considered.

## 2. What stays locked

- **Sam is a sourdough loaf** mascot. Character unchanged.
- **Voice: no hyphens or dashes, ever, in any user facing text.** Warm, short,
  patient (see `doughmate-handoff/docs/sam-voice-style-guide.md`).
- **The feature set and content** (converters, recipes, starters,
  substitutions, settings, Pro, ads) — same capabilities, redesigned.

## 3. Visual latitude: "Refresh the brand"

Keep Sam (the loaf) and the cozy soul. **Claude Design may rework the palette and
typography freely** for a more modern feel — same soul, bigger visual change. The
existing warm cream/crust palette and Fredoka/Nunito type in
`app-src/src/theme.ts` are a **starting reference, not a constraint**; a new
palette and type system are welcome as long as the result still feels cozy and
handmade, not clinical.

Aesthetic target: **a mix of cozy warmth, clean modern calm, and a touch of
playfulness** from Sam. Cozy and modern is the north star; playful is a seasoning,
not the base.

---

## 4. Information architecture

Four bottom tabs. **Settings moves off the tab bar to a gear icon** (top corner,
occasional use).

| Tab              | Purpose                                                        |
| ---------------- | ------------------------------------------------------------- |
| **Convert**      | One flexible calculator (all six converters, see below)       |
| **Recipes**      | The Recipe Box: saved recipes                                 |
| **Starters**     | Sourdough starters with feed tracking                         |
| **Substitutions**| Searchable ingredient swap lookup (its own tab, not a tool)   |

There is **no "More tools" hub anymore** — the six converters live inside the
Convert tab, and Substitutions is promoted to its own tab.

## 5. Navigation and interaction model

The core decision (chosen as "Model B → B1"):

### Convert is one shape shifting calculator

- The six converters — **Ingredient, Pan, Oven, Yeast, Egg, Butter** — are
  **modes of the Convert tab**, not separate screens.
- A **mode selector** switches between them: a segment / chip row near the top
  plus a **swipe up tray** from the bottom for the full list.
- Selecting a mode **swaps the calculator in place**. No new screen pushes, no
  back button. Switching back to Ingredient is one tap.
- The primary output (the big result) and the primary action (**Save**) sit
  **bottom anchored**, in the thumb zone.

### Everything else is a swipe down bottom sheet

B1's swap in place is Convert specific. Every other second level surface is a
**bottom sheet that dismisses by swiping down** (or tapping the dimmed backdrop),
never a full screen with a top back button:

- New Recipe, Add Starter
- Scale a recipe, recipe detail
- The Pro paywall
- Settings (opened from the gear)

**No back buttons anywhere.** Swipe down replaces them. A grabber handle at the
top of every sheet signals the gesture; an optional small close affordance is
fine but the gesture is primary.

### Touch rules (apply to every screen)

- Large tap targets (min ~44pt), generous spacing.
- Primary actions **bottom anchored** within thumb reach.
- Swipe to dismiss instead of back navigation.
- Minimal top chrome; let content and the result breathe.

## 6. Sam: a moment, not a fixture

**Remove the persistent floating loaf above the tab bar.** Sam is no longer
on screen at all times. Instead he appears **contextually**, where warmth helps,
then steps back:

- **Results** — reacts when a conversion lands (there is already a reaction
  system: recipe/bake keyword maps to a Sam mood — idle, cookies, sourdough,
  macarons, focaccia, croissants, celebrate).
- **Confirmations** — saved a recipe, fed a starter, Pro unlocked.
- **Empty states** — no recipes yet, no starters yet.
- **Onboarding** and occasional **milestones** (first save, streaks).
- **Error / wobble** moments.

Sam animations arrive later as Lottie files (integration points are already
wired in `app-src/src/assets/lottie/`). For the redesign, treat Sam as an
illustration that can drop into these moments; he is the loaf, warm and quiet.

## 7. Screen by screen (structure, not visuals)

Content and controls per surface. Claude Design owns the visual treatment.

- **Convert** — mode selector (segment + swipe up tray); the active converter's
  inputs (amount, from/to units or pan/size pickers, etc.); the big result; a
  bottom anchored Save. Sam reacts on result/save.
- **Recipes** — list of saved recipes (name + a line or two). Each opens a
  **detail sheet**; actions: Scale (opens the scaler sheet), Delete (with undo).
  A prominent New Recipe entry opens a **create sheet**. Cozy empty state with
  Sam.
- **Starters** — list of starters, each showing a **countdown to the next feed**,
  a **Feed now** action, and feed count. Add Starter opens a **create sheet**.
  Delete with undo. Empty state with Sam.
- **Substitutions** — a **search field** and a scrollable list of swap cards
  (missing → substitute + notes). No calculator controls; it is a reference.
- **Settings** (gear) — a **sheet** with: appearance (theme auto/light/dark),
  sound and feel (reduced motion, sound, haptics), preferences (default units,
  flour standard 120/125, floured fingers mode), notifications (starter reminders,
  weekly tip), a **Pro** row, and about/version.
- **Paywall** — a **sheet**: Doughmate Pro, the perk list, a single purchase CTA,
  restore. Reached from Settings and from free tier limits.
- **Onboarding** — the existing three warm steps (welcome, features,
  notifications), Sam forward.

## 8. Accessibility and states (must survive the redesign)

- **Dark mode** on every screen.
- **Reduced motion** honored on every animation.
- **Floured fingers mode** — an extra large text / bigger target mode for messy
  hands. The new type scale must support a comfortable enlarged setting.
- Clear empty, loading, and error states (Sam appears in empty and error).

## 9. Inputs Claude Design can pull from (in this repo)

- `app-src/src/theme.ts` — current tokens (reference, freely replaceable).
- `app-src/src/i18n/en.json` — every user facing string, already in Sam's voice.
- `app-src/src/data/*.json` — real content (ingredients, pans, etc.) for
  realistic mockups.
- `app-src/src/assets/sam.svg` — the current Sam vector.
- `doughmate-handoff/docs/sam-voice-style-guide.md` — the voice rules.
- The running app (`cd app-src && pnpm web`) — to see current screens.

## 10. Success criteria

- Reaching any converter or tool takes **no drilling and no back button**.
- Every second level surface is a **swipe down sheet**.
- Primary actions are **thumb reachable**.
- The app reads as **finished, cozy, and modern**, not a prototype.
- Dark mode, reduced motion, and floured fingers all still hold.
- No hyphens in any user facing text.

## 11. Out of scope

- New features (baker's percentages, fermentation timer, themes shop, widgets,
  cross device sync, etc.). These come after this design lands.
- Implementation details of the engines, storage, monetization, and
  notifications — those stay as built; only the presentation changes.

---

## Handoff

The plan is for **Claude Design to produce the new visual design** from this
brief. This document is the source of truth for structure, interaction, and
constraints. Once Claude Design returns a design, a separate implementation pass
maps it onto the existing screens and components in `app-src`.
