# Doughmate — Design Prompt for Claude Design

> Paste this whole document into a Claude Design conversation. It briefs the full
> redesign and asks for a design **plus an implementation handoff for Claude
> Code** at the end.

---

## Your task

You are designing **Doughmate**, a cozy mobile baking app (React Native + Expo,
iOS and Android). Create a **fresh, modern, cute** visual and interaction design
for the whole app, built as a **scalable design system** — a strong foundation we
can grow new features on, not a one‑off skin of today's screens. When the design
is settled, produce a **handoff for Claude Code** so it can implement the design
against the existing codebase.

The app is already fully built and functional. This is a redesign of the current
feature set. We are **establishing the design foundation first**, then adding
features on top of it.

---

## The product

Doughmate helps home bakers with the fiddly math: convert ingredients between
volume and weight, scale recipes, swap pans and oven temperatures, look up
substitutions, and keep a sourdough starter fed. Its mascot is **Sam, a
sourdough loaf** — warm, patient, quietly enthusiastic.

**Who uses it:** home bakers, often mid‑bake with floury hands. The app must be
**glanceable and thumb friendly** — big touch targets, primary actions within
thumb reach, no fussy navigation.

## Brand and voice — locked

- **Sam is a sourdough loaf.** The mascot stays a loaf.
- **Voice: warm, short, patient, and NEVER uses hyphens or dashes** in any user
  facing text. Not em dashes, not hyphenated words. Rewrite around them. Sam
  never says "sorry" (says "hmm"), never sounds corporate. Short sentences.
- The soul is **cozy and handmade**. Keep that feeling even as the look modernizes.

## What we want

1. **Fresh, modern, cute.** It should feel like a finished, delightful app, not a
   prototype. Cute means Sam forward charm, friendly rounded forms, and small
   delightful moments — without becoming childish. Modern means clean layout,
   clear hierarchy, generous space, and restraint. Cozy means warmth, softness,
   and a handmade touch.
2. **Touch first UX.** Kill clunky navigation. See the interaction model below.
3. **A design system that scales.** Define tokens and reusable components so new
   features compose from the system without a redesign. This is the priority:
   **foundation over one‑off screens.**

## Visual latitude — refresh the brand

Keep Sam (the loaf) and the cozy soul. **You may rework the color palette and the
typography freely** for a modern, cute feel. The current palette (warm cream and
crust browns) and fonts are a **starting reference you are free to replace**. Aim
for something fresh and characterful that still reads cozy, not clinical.

---

## Information architecture (decided — please keep)

Four bottom tabs. **Settings lives behind a gear icon** (top corner), not on the
tab bar.

| Tab               | Purpose                                                   |
| ----------------- | --------------------------------------------------------- |
| **Convert**       | One flexible calculator holding all six converters        |
| **Recipes**       | The Recipe Box (see "design for growth" — make this rich) |
| **Starters**      | Sourdough starters with feed tracking                     |
| **Substitutions** | Searchable ingredient swap lookup (its own tab)           |

There is **no "more tools" hub**. The six converters live inside Convert;
Substitutions is its own tab.

## Interaction model (decided — please keep)

**Convert is one shape shifting calculator.** The six converters —
**Ingredient, Pan, Oven, Yeast, Egg, Butter** — are **modes** of the Convert tab,
not separate screens. A mode selector (a segment / chip row plus a swipe up tray
for the full list) switches between them, and the calculator **swaps in place** —
no new screen, no back button. The big result and the primary action (Save) are
**bottom anchored** in the thumb zone.

**Everything else is a swipe down bottom sheet.** New Recipe, Add Starter, Scale
a recipe, recipe detail, the Pro paywall, and Settings all open as **sheets that
dismiss by swiping down** (grabber handle at the top). **No back buttons anywhere
in the app** — swipe down replaces them.

**Touch rules everywhere:** large targets (min ~44pt), primary actions bottom
anchored, swipe to dismiss, minimal top chrome.

## Sam — a moment, not a fixture

**Sam is not persistently on screen.** He appears **contextually**, where warmth
helps, then steps back:

- **Results** — reacts when a conversion lands
- **Confirmations** — saved a recipe, fed a starter, Pro unlocked
- **Empty states** — no recipes yet, no starters yet
- **Onboarding** and occasional **milestones** (first save, streaks)
- **Error / wobble** moments

He has a set of **moods** already planned (idle, cookies, sourdough, macarons,
focaccia, croissants, celebrate). Please define an **illustration style for Sam**
that these moods and future ones can follow. Animations will be added later as
Lottie; design him as an illustration that drops into these moments.

---

## Design for growth (important)

Design a **system**, not just the current screens. We are adding features soon,
and the design should already have room and patterns for them so we do not
redesign later. Known upcoming work:

- **Richer Recipes.** The current recipe feature is **under baked** — today a
  recipe is just a name and a few text lines. Please design Recipes as a
  **first class feature**: a real recipe detail (structured ingredients, method /
  steps, notes, servings and scaling, tags or categories, and room for a photo),
  a proper create / edit flow, and a browsable Recipe Box. Design it generously,
  as if it were the flagship feature.
- **Baker's percentages** and a **fermentation timer** (Pro features).
- A **themes / cosmetics shop** (buyable looks) — so the color system should
  support swappable themes.
- **Home screen widgets**.
- **Weekly tips from Sam**, milestones and streaks.
- **Cross device sync** later.

Concretely, deliver a **component library** (cards, list rows, bottom sheets,
inputs, steppers, segmented controls, tags/chips, result displays, empty states,
banners/toasts, the Sam moment block) and a **token system** those features can
compose from.

## Screens in this redesign (current scope)

Design each screen and its sheets, in light and dark, with empty / loading /
error states where relevant:

- **Convert** — mode selector (segment + swipe up tray); the active converter's
  inputs; the big result; bottom anchored Save; Sam reacts on result / save.
- **Recipes** — a rich Recipe Box list; a **recipe detail sheet** (designed for
  the richer future above); a **create / edit sheet**; a scale action; delete
  with undo; a cozy empty state with Sam.
- **Starters** — list of starters, each with a **countdown to next feed**, a
  **Feed now** action, and feed count; an **Add Starter sheet**; delete with
  undo; empty state with Sam.
- **Substitutions** — a search field and a scrollable list of swap cards
  (missing → substitute + notes). A reference, not a calculator.
- **Settings** (gear) — a sheet: appearance (theme auto / light / dark), sound and
  feel (reduced motion, sound, haptics), preferences (default units, flour
  standard 120 vs 125 grams per cup, floured fingers mode), notifications
  (starter reminders, weekly tip), a **Pro** row, and about / version.
- **Paywall** — a sheet: Doughmate Pro, the perk list, a single purchase call to
  action, and restore.
- **Onboarding** — three warm steps (welcome, features, notifications), Sam
  forward.

## Accessibility and states — must hold

- **Dark mode** on every screen (design both).
- **Reduced motion** — a calm variant of every motion.
- **Floured fingers mode** — an extra large text and bigger target mode for messy
  hands. The type scale must support a comfortable enlarged setting.
- Clear **empty, loading, and error** states (Sam shows up in empty and error).

---

## Deliverables

Please produce, in this order:

1. **A design system**
   - Color tokens for **light and dark** (semantic: background layers, text,
     primary, accent, success, warning, borders), built so themes can be swapped.
   - A **type scale** (display, heading, body, caption, numeric) with the chosen
     typefaces.
   - Spacing, radius, elevation / shadow, and **motion** principles (including the
     reduced motion variant).
   - **Iconography** style and an **illustration style for Sam**.
2. **Component library** — specs for every reusable component listed above, with
   variants and states (default, pressed, disabled, selected, dark).
3. **High fidelity screen designs** for every screen and sheet above, light and
   dark, with the key states.
4. **A handoff for Claude Code** (see next section).

## Handoff for Claude Code

End the design with an **implementation ready handoff** that Claude Code can build
from directly. It should include:

- **Exact token values** (all colors for light and dark, type ramp with sizes /
  weights / line heights, spacing scale, radii, shadows, motion durations /
  easings) in a form that maps to a single theme file.
- **Component specs**: each component's props / variants, sizing, and states.
- **Per screen layout specs**: structure, spacing, which tokens and components,
  interaction and motion notes, and the empty / error content.
- **A mapping to the existing app** so implementation is unambiguous (see below).

### How the current app is built (so the handoff maps cleanly)

Only the **presentation** changes. The engines, state, storage, monetization, and
notifications stay as built. Please have Claude Code:

- Put all tokens in a single theme file (today it is `app-src/src/theme.ts`) and
  **consume tokens everywhere, never hardcode values**.
- Keep **all user facing strings in i18n** (`app-src/src/i18n/en.json`, already
  written in Sam's voice) and read them via `t('key.path')`.
- Preserve **dark mode, reduced motion, and floured fingers**.
- Use **Expo Router**; the current routes are a tab group plus modal routes.
  Rework them to the new IA (four tabs, gear Settings) and the sheet based
  navigation.
- Keep the existing **pure engines** (`app-src/src/lib`: convert, recipe, pan,
  oven, yeast, egg, butter, substitutions, sam reactions) and **context stores**
  (`app-src/src/state`: settings, pro, recipes, starters); only the UI layer is
  rebuilt.
- **No hyphens or dashes** in any user facing text.

### Inputs available in the repository (for realistic design and an accurate handoff)

- `app-src/src/theme.ts` — current tokens (reference, replaceable)
- `app-src/src/i18n/en.json` — every user facing string, in Sam's voice
- `app-src/src/data/*.json` — real content (48 ingredients, pans, yeast, eggs,
  substitutions) for realistic mockups
- `app-src/src/assets/sam.svg` — the current Sam vector
- `doughmate-handoff/docs/sam-voice-style-guide.md` — the full voice rules
- `README.md` — the architecture overview

---

## Success criteria

- Feels **fresh, modern, cute, and finished** — not a prototype.
- **No back button drilling.** Convert swaps in place; everything else is a swipe
  down sheet; actions are thumb reachable.
- A **design system that scales** — new features (especially a much richer
  Recipes) compose from it without a redesign.
- **Recipes feels first class**, not under baked.
- Dark mode, reduced motion, and floured fingers all hold.
- **No hyphens** in any user facing text.
