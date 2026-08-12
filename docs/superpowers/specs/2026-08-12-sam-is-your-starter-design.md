# Sam Is Your Starter — Design

Date: 2026-08-12
Branch: `redesign/proof`
Status: Approved for planning

## Problem

The sourdough starter tracker is functional but plain: a card with a progress ring, a Feed button, and a delete. Competitive research showed the starter niche is crowded but utilitarian, and that Doughmate's clearest white space is its mascot. No competitor makes a character *be* your starter. This feature turns Sam into the face of each starter and gives starters a proper home.

## Goals

- Sam expresses each starter's state through six moods as it moves through its feed cycle.
- A new starter detail screen: Sam as the mood hero, a countdown, a Feed action, a 28 day feeding heatmap, stats, the starter's details, edit, and delete.
- Editing an existing starter (name, hydration, ratio, feed interval, notes), which is not possible today.

## Non goals

- No streak counter (kept deliberately low pressure; sourdough is forgiving).
- No commissioned art or Lottie: the moods are drawn in code as SVG.
- No fridge/retard care mode as a stored setting this pass; "sleepy" covers long overdue.
- No AI, no photo analysis, no notifications changes.

## Design decisions (all user approved)

### Six moods, mapped to the feed cycle

The mood follows how far the starter is through its feed interval (rise then hunger), plus a fresh state and a long overdue state:

| Mood | Condition |
| --- | --- |
| `new` | never fed (`lastFedAt === null`) |
| `full` | fed, `progress < 0.3` |
| `peak` | `0.3 <= progress < 0.7` |
| `peckish` | `0.7 <= progress < 1` |
| `hungry` | due, overdue by less than one interval |
| `sleepy` | due, overdue by one full interval or more |

Where `progress` and the overdue amount come from the existing `feedStatus` engine (`src/lib/starter.ts`).

Each mood is drawn as the same loaf with a swappable face plus small props (rising bubbles at peak, a sweat drop when peckish, an exclamation when hungry, "z z z" when sleepy, rosy cheeks when full). All faces are simple `react-native-svg` shapes over the loaf body, no new asset files.

### Starter detail screen (new)

A tall bottom sheet at `app/starter/[id].tsx`, presented transparent like `recipe/[id]`. Top to bottom:

1. Header: starter name (`display.lg`) + hydration badge + a `✎ Edit` button (opens the edit sheet).
2. Sam mood hero (large, ~150): the current mood face, the mood name in `proofTealText`, a one line description, and a countdown line ("Next feed in 7h · fed 3h ago").
3. Feed now button (teal / success), logs a feed; Sam re renders in the new mood.
4. Feeding heatmap card: a 28 day grid (7 wide), each cell tinted by that day's feed count (skipped = `bgSunken`; one/two/three or more feeds = increasing `proofTeal` shades), today ringed in `primary`, with a "skipped to fed more" legend.
5. Stats card: total feeds and average interval. No streak.
6. Details card: hydration, feed ratio, notes.
7. Delete starter (destructive), with the existing undo toast.

### Starter card

The card stays, gaining two things: the whole card body (ring + name area) becomes tappable to open the detail screen, and the sub line shows the mood name. The existing Feed and delete controls stay on the card for quick actions; tapping them must not trigger navigation.

### Editing

`app/starter-new.tsx` becomes a shared create/edit sheet (the pattern already used by the recipe editor): it reads an optional `?id=`, pre fills from `getStarter(id)`, and saves via a new `updateStarter(id, input)`. Create is unchanged.

## Data model

Extends `Starter` in `src/state/starters.tsx`, additive and backward compatible:

```ts
interface Starter {
  // ...existing: id, name, intervalHours, lastFedAt, feedCount, createdAt, hydration?, ratio?, notes?
  feeds?: number[]; // NEW. Timestamps of every feed, for the heatmap and stats.
}
```

- `feedStarter(id)` appends `Date.now()` to `feeds` (and keeps updating `lastFedAt` and `feedCount` as today).
- Load migration: when a stored starter has no `feeds`, initialise it from `lastFedAt` (`lastFedAt ? [lastFedAt] : []`). One time, in the load path, no storage key bump.
- New store methods: `getStarter(id)` and `updateStarter(id, input)`. `feedCount` stays but the detail screen reads `feeds.length` for total feeds.

## Pure logic (tested to 100%, in `src/lib`)

1. `starterMood(starter, now): MoodId` in `src/lib/starterMood.ts` — maps the feed cycle to one of the six mood ids using `feedStatus`. Returns `'new' | 'full' | 'peak' | 'peckish' | 'hungry' | 'sleepy'`.
2. `dailyFeedCounts(feeds, now, days = 28): number[]` in `src/lib/starterMood.ts` (or a small `feedHeatmap.ts`) — buckets feed timestamps into a per day count for the last N days, oldest first, length `days`. Drives the heatmap.

Both are registered in `jest.config.js` `collectCoverageFrom` and fully unit tested. `feedStatus` is reused unchanged.

## Components and files

| File | Responsibility |
| --- | --- |
| `src/lib/starterMood.ts` | Pure `starterMood` + `dailyFeedCounts` (+ tests). |
| `src/state/starters.tsx` | Add `feeds?`, feed appends to it, load migration, `getStarter`, `updateStarter`. |
| `src/ui/StarterSam.tsx` | Draws the loaf + a face per mood via react native svg. Prop: `mood`, `size`. |
| `src/ui/FeedHeatmap.tsx` | The 28 day grid from `dailyFeedCounts`. |
| `app/starter/[id].tsx` | The starter detail sheet. |
| `app/starter-new.tsx` | Becomes shared create/edit via `?id=`. |
| `app/(tabs)/starters.tsx` | Card opens detail; mood on the card. |
| `src/ui/StarterCard.tsx` | Tappable body + mood name; keep Feed/delete. |
| `app/_layout.tsx` | Register `starter/[id]` as a transparent modal (mirror `recipe/[id]`). |
| `src/i18n/en.json` | Mood names + descriptions, heatmap/stat/detail labels, edit copy. All hyphen free. |

## Edge cases

- A starter with no feeds (new) shows the `new` mood, an empty heatmap, and 0 total feeds.
- Old starters (pre `feeds`) backfill one feed from `lastFedAt`, so the heatmap shows at least the last feed.
- `dailyFeedCounts` ignores feeds older than the window and future timestamps.
- The mood recomputes from `now`; the detail screen ticks `now` on a timer like the starters list already does.
- Delete plus undo unchanged.

## Constraints (house rules)

- No hyphens or dashes in any user facing copy.
- All strings via i18n; colors, spacing, radii from tokens only.
- No back buttons; the detail and edit are dismissible sheets.
- Dark mode, reduced motion, floured fingers hold on every new surface. The Sam faces use theme tokens where they carry meaning; the fixed loaf palette (crust brown, ink) matches the existing `sam.svg` and is intentional brand art, consistent light and dark.
- Presentation plus the additive `feeds?` field and `updateStarter`/`getStarter`. Engines, storage keys, monetization, notifications untouched.
- Pure logic at 100% coverage, registered in `jest.config.js`.
