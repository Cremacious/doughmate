# Sam Is Your Starter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Sam the face of each sourdough starter: six code-drawn moods tied to the feed cycle, a starter detail screen with a Sam mood hero and a 28 day feeding heatmap, starter editing, and an additive feed timestamp log.

**Architecture:** Two pure helpers (`starterMood`, `dailyFeedCounts`) build on the existing `feedStatus` engine. The `Starter` record gains an additive optional `feeds` timestamp array (backfilled from `lastFedAt`). New UI: a `StarterSam` svg mood component, a `FeedHeatmap` grid, and a starter detail bottom sheet at `app/starter/[id].tsx`. `starter-new.tsx` becomes a shared create/edit sheet via `?id=`. Presentation plus the additive field only; engines, storage keys, monetization, and notifications are untouched.

**Tech Stack:** Expo SDK 57, React 19, React Native 0.86, TypeScript strict, Expo Router (typed routes), react-native-svg, react-native-reanimated 4, i18next, Jest (pure lib only), pnpm.

## Global Constraints

- No hyphens or dashes in any user facing copy. Rewrite around them.
- All user facing strings via i18n `t('key.path')` in `src/i18n/en.json`. Never hardcode display text.
- Colors, spacing, radii, durations from theme tokens (`useAppTheme` / `src/theme.ts`). Exception: the Sam loaf art uses the same fixed brand colors as `src/assets/sam.svg` (`#E9B478` crust, `#2C1E17` ink, `#C77D3A` crust top, `#8B5A2B` shadow) in both themes, intentionally.
- No back buttons; the detail and edit are dismissible bottom sheets.
- Dark mode, reduced motion, floured fingers hold on every new surface.
- Only presentation and the additive optional `feeds?` field, plus new store methods `getStarter`/`updateStarter`, change. Do not touch engines beyond the new pure helpers, storage keys, monetization, or notifications.
- Pure engine files under `src/lib` keep 100% Jest coverage; new pure logic is tested and registered in `jest.config.js` `collectCoverageFrom`.
- Verify every task with `pnpm typecheck` and `pnpm lint` (both clean), run from `app-src/`.
- Work on branch `redesign/proof`. Commit per task. Do not push.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/starterMood.ts` | Pure `starterMood` + `dailyFeedCounts` (read side logic). |
| `src/lib/starterMood.test.ts` | Their tests. |
| `jest.config.js` | Add `src/lib/starterMood.ts` to `collectCoverageFrom`. |
| `src/state/starters.tsx` | Add `feeds?`, append on feed, load migration, `getStarter`, `updateStarter`. |
| `src/ui/StarterSam.tsx` | Loaf + a face per mood via react native svg. |
| `src/ui/FeedHeatmap.tsx` | 28 day grid from `dailyFeedCounts`. |
| `app/starter/[id].tsx` | Starter detail sheet. |
| `app/starter-new.tsx` | Shared create/edit via `?id=`. |
| `src/ui/StarterCard.tsx` | Tappable body opening detail + mood name. |
| `app/(tabs)/starters.tsx` | Pass navigation to cards. |
| `app/_layout.tsx` | Register `starter/[id]` transparent modal. |
| `src/i18n/en.json` | Mood names/descriptions, heatmap/stats/detail/edit copy. |

---

## Task 1: Pure helpers — `starterMood` and `dailyFeedCounts`

**Files:**
- Create: `src/lib/starterMood.ts`
- Create: `src/lib/starterMood.test.ts`
- Modify: `jest.config.js`

**Interfaces:**
- Consumes: `feedStatus` from `./starter`.
- Produces:
  - `type StarterMood = 'new' | 'full' | 'peak' | 'peckish' | 'hungry' | 'sleepy'`
  - `starterMood(starter: { lastFedAt: number | null; intervalHours: number }, now: number): StarterMood`
  - `dailyFeedCounts(feeds: number[], now: number, days?: number): number[]` — length `days` (default 28), oldest first, index `days - 1` is today; buckets by UTC day.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/starterMood.test.ts`:

```ts
import { dailyFeedCounts, starterMood } from './starterMood';

const HOUR = 3_600_000;
const DAY = 86_400_000;

describe('starterMood', () => {
  it('is new when never fed', () => {
    expect(starterMood({ lastFedAt: null, intervalHours: 24 }, 1000)).toBe('new');
  });

  it('is full just after a feed', () => {
    const now = 100 * DAY;
    expect(starterMood({ lastFedAt: now - 2 * HOUR, intervalHours: 24 }, now)).toBe('full');
  });

  it('is peak in the middle of the interval', () => {
    const now = 100 * DAY;
    expect(starterMood({ lastFedAt: now - 12 * HOUR, intervalHours: 24 }, now)).toBe('peak');
  });

  it('is peckish late in the interval', () => {
    const now = 100 * DAY;
    expect(starterMood({ lastFedAt: now - 20 * HOUR, intervalHours: 24 }, now)).toBe('peckish');
  });

  it('is hungry when due but not long overdue', () => {
    const now = 100 * DAY;
    expect(starterMood({ lastFedAt: now - 30 * HOUR, intervalHours: 24 }, now)).toBe('hungry');
  });

  it('is sleepy when overdue by a full interval or more', () => {
    const now = 100 * DAY;
    expect(starterMood({ lastFedAt: now - 48 * HOUR, intervalHours: 24 }, now)).toBe('sleepy');
  });
});

describe('dailyFeedCounts', () => {
  it('returns all zeros for no feeds', () => {
    const counts = dailyFeedCounts([], 100 * DAY, 28);
    expect(counts).toHaveLength(28);
    expect(counts.every((c) => c === 0)).toBe(true);
  });

  it('counts feeds on the same day into today (last index)', () => {
    const now = 100 * DAY + 5 * HOUR;
    const counts = dailyFeedCounts([100 * DAY + 1 * HOUR, 100 * DAY + 3 * HOUR], now, 28);
    expect(counts[27]).toBe(2);
  });

  it('places a feed from yesterday one cell before today', () => {
    const now = 100 * DAY + 5 * HOUR;
    const counts = dailyFeedCounts([99 * DAY + 2 * HOUR], now, 28);
    expect(counts[26]).toBe(1);
  });

  it('places the oldest in window feed at index 0', () => {
    const now = 100 * DAY;
    const counts = dailyFeedCounts([(100 - 27) * DAY], now, 28);
    expect(counts[0]).toBe(1);
  });

  it('ignores feeds outside the window and in the future', () => {
    const now = 100 * DAY;
    const counts = dailyFeedCounts([(100 - 28) * DAY, 101 * DAY], now, 28);
    expect(counts.every((c) => c === 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd app-src && pnpm test -- starterMood.test.ts`
Expected: FAIL (module not found / functions undefined).

- [ ] **Step 3: Implement the helpers**

Create `src/lib/starterMood.ts`:

```ts
// Read side helpers for the starter mood face and the feeding heatmap. Pure:
// given a starter and the current time, pick a mood; given feed timestamps,
// bucket them into per day counts. Day buckets use UTC days so the logic is
// deterministic and testable.
import { feedStatus } from './starter';

export type StarterMood = 'new' | 'full' | 'peak' | 'peckish' | 'hungry' | 'sleepy';

const DAY_MS = 86_400_000;

/** Pick a mood from where the starter sits in its feed cycle. */
export function starterMood(
  starter: { lastFedAt: number | null; intervalHours: number },
  now: number
): StarterMood {
  const status = feedStatus(starter, now);
  if (status.fresh) {
    return 'new';
  }
  if (!status.due) {
    if (status.progress < 0.3) {
      return 'full';
    }
    if (status.progress < 0.7) {
      return 'peak';
    }
    return 'peckish';
  }
  return status.hoursWaited >= starter.intervalHours ? 'sleepy' : 'hungry';
}

/**
 * Bucket feed timestamps into a per day count for the last `days` days.
 * Oldest first; the final element is today. Feeds outside the window or in the
 * future are ignored.
 */
export function dailyFeedCounts(feeds: number[], now: number, days = 28): number[] {
  const counts = new Array<number>(days).fill(0);
  const todayIndex = Math.floor(now / DAY_MS);
  for (const t of feeds) {
    const offset = todayIndex - Math.floor(t / DAY_MS);
    if (offset >= 0 && offset < days) {
      counts[days - 1 - offset] += 1;
    }
  }
  return counts;
}
```

- [ ] **Step 4: Register coverage and run tests**

In `jest.config.js`, add to `collectCoverageFrom` (after `src/lib/starter.ts`):

```js
    'src/lib/starterMood.ts',
```

Run: `cd app-src && pnpm test:coverage`
Expected: PASS, all suites green, `starterMood.ts` at 100%.

- [ ] **Step 5: Typecheck, lint, commit**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean).

```bash
git add app-src/src/lib/starterMood.ts app-src/src/lib/starterMood.test.ts app-src/jest.config.js
git commit -m "feat(starters): starterMood and dailyFeedCounts helpers"
```

---

## Task 2: Store — feed log, migration, getStarter, updateStarter

**Files:**
- Modify: `src/state/starters.tsx`

**Interfaces:**
- Consumes: existing `Starter`, `StarterInput`, `storage`.
- Produces:
  - `Starter.feeds?: number[]` (optional; ascending feed timestamps).
  - `feedStarter(id)` appends `Date.now()` to `feeds`.
  - `getStarter(id: string): Starter | undefined`
  - `updateStarter(id: string, input: StarterInput): void` — updates name/intervalHours/hydration/ratio/notes; preserves id, createdAt, lastFedAt, feedCount, feeds.

- [ ] **Step 1: Add the `feeds` field and migrate on load**

In `src/state/starters.tsx`, add to the `Starter` interface:

```ts
  /** Timestamps of every feed, ascending. Absent on records saved before v6. */
  feeds?: number[];
```

Update `loadStarters` so records without `feeds` are backfilled from `lastFedAt` (find the `JSON.parse` return and map over it):

```ts
function loadStarters(): Starter[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const list = JSON.parse(raw) as Starter[];
    return list.map((s) =>
      s.feeds ? s : { ...s, feeds: s.lastFedAt != null ? [s.lastFedAt] : [] }
    );
  } catch {
    return [];
  }
}
```

- [ ] **Step 2: Initialise `feeds` on add, append on feed**

In `addStarter`, set `feeds: []` on the new starter object. In `feedStarter`, append the timestamp:

```ts
      feedStarter: (id) =>
        commit(
          starters.map((s) =>
            s.id === id
              ? {
                  ...s,
                  lastFedAt: Date.now(),
                  feedCount: s.feedCount + 1,
                  feeds: [...(s.feeds ?? []), Date.now()],
                }
              : s
          )
        ),
```

- [ ] **Step 3: Add `getStarter` and `updateStarter` to the context value and type**

Add to `StartersContextValue`:

```ts
  getStarter: (id: string) => Starter | undefined;
  updateStarter: (id: string, input: StarterInput) => void;
```

Implement inside the `useMemo` value (alongside the others):

```ts
      getStarter: (id) => starters.find((s) => s.id === id),
      updateStarter: (id, input) =>
        commit(
          starters.map((s) =>
            s.id === id
              ? {
                  ...s,
                  name: input.name,
                  intervalHours: input.intervalHours,
                  hydration: input.hydration,
                  ratio: input.ratio,
                  notes: input.notes,
                }
              : s
          )
        ),
```

- [ ] **Step 4: Typecheck, lint, commit**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean). `pnpm test` still green (137+ pass).

```bash
git add app-src/src/state/starters.tsx
git commit -m "feat(starters): feed timestamp log, getStarter, updateStarter"
```

---

## Task 3: `StarterSam` mood component + mood copy

**Files:**
- Create: `src/ui/StarterSam.tsx`
- Modify: `src/i18n/en.json`

**Interfaces:**
- Consumes: `StarterMood` from `@/lib/starterMood`; `react-native-svg`.
- Produces: `StarterSam` component with props `{ mood: StarterMood; size?: number }`.

- [ ] **Step 1: Add mood copy to i18n**

Add a `moods` block under a new top level `starters_mood` key (keep existing keys). All copy hyphen and dash free:

```json
"starters_mood": {
  "new_name": "New", "new_sub": "Just born. Feed when you like.",
  "full_name": "Full", "full_sub": "Fed and settling in.",
  "peak_name": "At peak", "peak_sub": "Bubbly and active, a great time to bake.",
  "peckish_name": "Peckish", "peckish_sub": "Slowing down, feed soon.",
  "hungry_name": "Hungry", "hungry_sub": "Feed me. It is time.",
  "sleepy_name": "Sleepy", "sleepy_sub": "Resting. A feed will wake it up."
}
```

- [ ] **Step 2: Implement `StarterSam`**

Create `src/ui/StarterSam.tsx`. The loaf body is shared; each mood swaps its face group. Fixed brand colors per Global Constraints.

```tsx
// Sam drawn as your starter. Same loaf, a face and small props per mood. All
// react native svg, no asset files. Fixed brand palette, intentional in light
// and dark.
import Svg, { Circle, Ellipse, G, Path, Text as SvgText } from 'react-native-svg';

import type { StarterMood } from '@/lib/starterMood';

const INK = '#2C1E17';
const CRUST = '#E9B478';
const CRUST_TOP = '#C77D3A';
const SHADOW = '#8B5A2B';
const TEAL = '#2C7A70';
const CHEEK = '#F2A0A0';
const DROP = '#8FC0EA';
const PRIMARY = '#F2603C';
const FAINT = '#A08D7C';

const ASPECT = 105 / 120;

function Face({ mood }: { mood: StarterMood }) {
  switch (mood) {
    case 'new':
      return (
        <G stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <Path d="M46 58 q5 4 10 0" />
          <Path d="M64 58 q5 4 10 0" />
          <Path d="M55 72 q5 2 10 0" />
        </G>
      );
    case 'full':
      return (
        <G>
          <Ellipse cx={42} cy={66} rx={6} ry={4} fill={CHEEK} opacity={0.55} />
          <Ellipse cx={78} cy={66} rx={6} ry={4} fill={CHEEK} opacity={0.55} />
          <G stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none">
            <Path d="M46 61 q5 -5 10 0" />
            <Path d="M64 61 q5 -5 10 0" />
            <Path d="M52 68 q8 7 16 0" />
          </G>
        </G>
      );
    case 'peak':
      return (
        <G>
          <Circle cx={26} cy={30} r={4.5} stroke={TEAL} strokeWidth={1.7} fill="none" />
          <Circle cx={38} cy={18} r={3} stroke={TEAL} strokeWidth={1.7} fill="none" />
          <Circle cx={95} cy={26} r={3.6} stroke={TEAL} strokeWidth={1.7} fill="none" />
          <Circle cx={51} cy={56} r={4.2} fill={INK} />
          <Circle cx={69} cy={56} r={4.2} fill={INK} />
          <Circle cx={52.6} cy={54.4} r={1.3} fill="#fff" />
          <Circle cx={70.6} cy={54.4} r={1.3} fill="#fff" />
          <Path d="M51 68 q9 10 18 0 z" fill={INK} />
        </G>
      );
    case 'peckish':
      return (
        <G>
          <Path d="M86 46 q3.5 6 0 10 q-3.5 -4 0 -10" fill={DROP} />
          <Circle cx={51} cy={56} r={3.4} fill={INK} />
          <Circle cx={69} cy={56} r={3.4} fill={INK} />
          <Path
            d="M53 71 q3.5 -3 7 0 q3.5 3 7 0"
            stroke={INK}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    case 'hungry':
      return (
        <G>
          <SvgText x={92} y={28} fontSize={20} fontWeight="800" fill={PRIMARY}>
            !
          </SvgText>
          <Circle cx={51} cy={55} r={5} fill={INK} />
          <Circle cx={69} cy={55} r={5} fill={INK} />
          <Circle cx={52.8} cy={57} r={1.6} fill="#fff" />
          <Circle cx={70.8} cy={57} r={1.6} fill="#fff" />
          <Ellipse cx={60} cy={72} rx={3.2} ry={4} fill={INK} />
        </G>
      );
    case 'sleepy':
      return (
        <G>
          <SvgText x={84} y={24} fontSize={12} fontWeight="800" fill={FAINT}>
            z
          </SvgText>
          <SvgText x={92} y={18} fontSize={16} fontWeight="800" fill={FAINT}>
            z
          </SvgText>
          <SvgText x={102} y={10} fontSize={20} fontWeight="800" fill={FAINT}>
            z
          </SvgText>
          <G stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none">
            <Path d="M46 57 h10" />
            <Path d="M64 57 h10" />
            <Path d="M56 71 h8" />
          </G>
        </G>
      );
  }
}

export interface StarterSamProps {
  mood: StarterMood;
  size?: number;
}

export function StarterSam({ mood, size = 120 }: StarterSamProps) {
  return (
    <Svg width={size} height={size * ASPECT} viewBox="0 0 120 105">
      <Ellipse cx={60} cy={97} rx={40} ry={5} fill={SHADOW} opacity={0.2} />
      <Ellipse cx={60} cy={58} rx={47} ry={40} fill={CRUST} stroke={INK} strokeWidth={2.5} />
      <Path d="M38 46 q22 -13 44 0" stroke={CRUST_TOP} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Face mood={mood} />
    </Svg>
  );
}

export default StarterSam;
```

- [ ] **Step 3: Typecheck, lint, commit**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean).

```bash
git add app-src/src/ui/StarterSam.tsx app-src/src/i18n/en.json
git commit -m "feat(starters): StarterSam mood faces and mood copy"
```

---

## Task 4: `FeedHeatmap` component

**Files:**
- Create: `src/ui/FeedHeatmap.tsx`
- Modify: `src/i18n/en.json`

**Interfaces:**
- Consumes: `dailyFeedCounts` from `@/lib/starterMood`; `useAppTheme`.
- Produces: `FeedHeatmap` with props `{ feeds: number[]; now: number; days?: number }`.

- [ ] **Step 1: Add heatmap copy**

Add under `starters` in `en.json`:

```json
"heatmap_label": "Feeding, last 28 days",
"heatmap_less": "skipped",
"heatmap_more": "fed more"
```

- [ ] **Step 2: Implement `FeedHeatmap`**

Create `src/ui/FeedHeatmap.tsx`. A 7 column grid; each cell tinted by that day's feed count using `proofTeal` opacity so it works in both themes; today ringed in `primary`.

```tsx
// A 28 day feeding heatmap. Cells tint up with more feeds that day; today is
// ringed. Theme aware: teal at increasing opacity over the sunken base.
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { dailyFeedCounts } from '@/lib/starterMood';
import { spacing, typography } from '@/theme';

export interface FeedHeatmapProps {
  feeds: number[];
  now: number;
  days?: number;
}

function levelOpacity(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 0.35;
  if (count === 2) return 0.65;
  return 1;
}

export function FeedHeatmap({ feeds, now, days = 28 }: FeedHeatmapProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const counts = dailyFeedCounts(feeds, now, days);

  const cell = (count: number, ring: boolean, key: number) => {
    const op = levelOpacity(count);
    return (
      <View
        key={key}
        style={[
          styles.cell,
          { backgroundColor: op === 0 ? palette.bgSunken : palette.proofTeal, opacity: op === 0 ? 1 : op },
          ring ? { borderWidth: 2, borderColor: palette.primary } : null,
        ]}
      />
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>{counts.map((c, i) => cell(c, i === days - 1, i))}</View>
      <View style={styles.legend}>
        <Text style={[typography.body.sm, { color: palette.textFaint }]}>
          {t('starters.heatmap_less')}
        </Text>
        {[0, 0.35, 0.65, 1].map((op, i) => (
          <View
            key={i}
            style={[
              styles.legendCell,
              { backgroundColor: op === 0 ? palette.bgSunken : palette.proofTeal, opacity: op === 0 ? 1 : op },
            ]}
          />
        ))}
        <Text style={[typography.body.sm, { color: palette.textFaint }]}>
          {t('starters.heatmap_more')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, borderRadius: 6, flexGrow: 0 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
});

export default FeedHeatmap;
```

Note on the grid: 7 columns via `width: 100/7 %` with a 6px gap can overflow a row. If lint or a quick render check shows wrapping issues, switch the cell width to a computed fixed size in the detail screen (measure container width, `(w - 6*6) / 7`) and pass it in; the implementer should confirm 7 per row during the detail screen manual check (Task 5) and adjust if needed.

- [ ] **Step 3: Typecheck, lint, commit**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean).

```bash
git add app-src/src/ui/FeedHeatmap.tsx app-src/src/i18n/en.json
git commit -m "feat(starters): FeedHeatmap grid"
```

---

## Task 5: Starter detail screen

**Files:**
- Create: `app/starter/[id].tsx`
- Modify: `app/_layout.tsx`
- Modify: `src/i18n/en.json`

**Interfaces:**
- Consumes: `useStarters` (`getStarter`, `feedStarter`, `removeStarter`, `restoreStarter`), `starterMood`, `feedStatus`, `StarterSam`, `FeedHeatmap`, `BottomSheet`, `Button`, `Card`, `useToast`, `useSamMood`, `router`, `useLocalSearchParams`.
- Produces: the route `/starter/[id]`.

- [ ] **Step 1: Add detail/stats/edit copy to i18n**

Add under `starters` in `en.json` (reuse existing `button_feed_now`, `countdown_*`, `toast_fed`, `toast_deleted`, `button_delete`, hydration/ratio/notes labels where present):

```json
"detail_stats": "Stats",
"detail_total_feeds": "total feeds",
"detail_every": "every",
"detail_details": "Details",
"detail_hydration": "Hydration",
"detail_ratio": "Feed ratio",
"detail_notes": "Notes",
"fed_ago": "fed {{hours}}h ago",
"edit": "Edit"
```

- [ ] **Step 2: Register the route**

In `app/_layout.tsx`, add a `Stack.Screen` for `starter/[id]` mirroring `recipe/[id]`:

```tsx
        <Stack.Screen
          name="starter/[id]"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
```

- [ ] **Step 3: Build the detail sheet**

Create `app/starter/[id].tsx`. Tick `now` on a 60s timer as `app/(tabs)/starters.tsx` does. Layout per the spec.

```tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { feedStatus } from '@/lib/starter';
import { starterMood } from '@/lib/starterMood';
import { useSamMood } from '@/state/samMood';
import { useStarters } from '@/state/starters';
import { radius, spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { FeedHeatmap } from '@/ui/FeedHeatmap';
import { StarterSam } from '@/ui/StarterSam';
import { useToast } from '@/ui/Toast';

const TICK_MS = 60_000;

export default function StarterDetailSheet() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getStarter, feedStarter, removeStarter, restoreStarter } = useStarters();
  const { celebrate } = useSamMood();
  const { show } = useToast();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(h);
  }, []);

  const starter = getStarter(id);
  if (!starter) {
    return (
      <BottomSheet size="tall" onClose={() => router.back()}>
        <View />
      </BottomSheet>
    );
  }

  const mood = starterMood(starter, now);
  const status = feedStatus(starter, now);
  const feeds = starter.feeds ?? [];

  const countdown = status.fresh
    ? t('starters.countdown_fresh')
    : status.due
      ? t('starters.countdown_ready')
      : status.hoursUntil >= 1
        ? t('starters.countdown_future', { hours: status.hoursUntil })
        : t('starters.countdown_soon', { minutes: status.minutesUntil });

  const feed = () => {
    feedStarter(starter.id);
    setNow(Date.now());
    celebrate();
    show({ message: t('starters.toast_fed', { name: starter.name }), variant: 'confirmation' });
  };

  const del = () => {
    removeStarter(starter.id);
    router.back();
    show({
      message: t('starters.toast_deleted', { name: starter.name }),
      actionLabel: t('recipes.button_undo'),
      onAction: () => restoreStarter(starter),
    });
  };

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <View style={styles.headerRow}>
          <Text style={[typography.display.lg, { color: palette.textInk }]}>{starter.name}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('starters.edit')}
            onPress={() => router.push(`/starter-new?id=${starter.id}`)}
            style={[styles.editBtn, { backgroundColor: palette.bgSunken }]}
          >
            <Text style={[typography.title, { color: palette.textInk }]}>
              {`✎ ${t('starters.edit')}`}
            </Text>
          </Pressable>
        </View>
      }
      footer={<Button label={t('starters.button_feed_now')} onPress={feed} haptic="success" />}
    >
      <View style={styles.body}>
        <View style={styles.hero}>
          <StarterSam mood={mood} size={150} />
          <Text style={[typography.heading, { color: palette.proofTeal }]}>
            {t(`starters_mood.${mood}_name` as 'starters_mood.new_name')}
          </Text>
          <Text style={[typography.body.md, styles.center, { color: palette.textSoft }]}>
            {t(`starters_mood.${mood}_sub` as 'starters_mood.new_sub')}
          </Text>
          <Text style={[typography.numeric.sm, { color: palette.textSoft }]}>{countdown}</Text>
        </View>

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('starters.heatmap_label')}
        </Text>
        <Card>
          <FeedHeatmap feeds={feeds} now={now} />
        </Card>

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('starters.detail_stats')}
        </Text>
        <Card style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[typography.numeric.lg, { color: palette.textInk }]}>{feeds.length}</Text>
            <Text style={[typography.body.sm, { color: palette.textSoft }]}>
              {t('starters.detail_total_feeds')}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[typography.numeric.lg, { color: palette.textInk }]}>
              {`${starter.intervalHours}h`}
            </Text>
            <Text style={[typography.body.sm, { color: palette.textSoft }]}>
              {t('starters.detail_every')}
            </Text>
          </View>
        </Card>

        {starter.hydration || starter.ratio || starter.notes ? (
          <>
            <Text style={[typography.label, { color: palette.textSoft }]}>
              {t('starters.detail_details')}
            </Text>
            <Card style={styles.details}>
              {starter.hydration ? (
                <Row k={t('starters.detail_hydration')} v={`${starter.hydration}%`} />
              ) : null}
              {starter.ratio ? <Row k={t('starters.detail_ratio')} v={starter.ratio} /> : null}
              {starter.notes ? <Row k={t('starters.detail_notes')} v={starter.notes} /> : null}
            </Card>
          </>
        ) : null}

        <Button label={t('starters.button_delete')} onPress={del} variant="destructive" haptic="tap" />
      </View>
    </BottomSheet>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[typography.body.md, { color: palette.textSoft }]}>{k}</Text>
      <Text style={[typography.body.lg, styles.rowV, { color: palette.textInk }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
  },
  editBtn: { height: 40, paddingHorizontal: spacing.md, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.xl, gap: spacing.sm },
  hero: { alignItems: 'center', gap: spacing['2xs'], paddingBottom: spacing.sm },
  center: { textAlign: 'center' },
  statRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', gap: spacing['2xs'] },
  details: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  rowV: { flexShrink: 1, textAlign: 'right' },
});
```

- [ ] **Step 4: Typecheck, lint, manual verification**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean).

Manual (dev server at `http://localhost:8081`): seed or open a starter, navigate to `/starter/<id>`. Confirm: Sam shows a mood face; the mood name/sub/countdown read; the heatmap shows 7 cells per row (adjust cell sizing per Task 4 note if it wraps wrong); stats show total feeds and interval; details show when present; Feed logs a feed and Sam re renders; Delete returns and shows the undo toast; the `✎ Edit` button routes to `/starter-new?id=`. Toggle dark mode and reduced motion and re check.

- [ ] **Step 5: Commit**

```bash
git add app-src/app/starter/[id].tsx app-src/app/_layout.tsx app-src/src/i18n/en.json
git commit -m "feat(starters): starter detail sheet with Sam mood hero and heatmap"
```

---

## Task 6: Starter editing + card integration

**Files:**
- Modify: `app/starter-new.tsx`
- Modify: `src/ui/StarterCard.tsx`
- Modify: `app/(tabs)/starters.tsx`
- Modify: `src/i18n/en.json`

**Interfaces:**
- Consumes: `useStarters` (`addStarter`, `updateStarter`, `getStarter`), `useLocalSearchParams`.
- Produces: `starter-new` handles `?id=`; `StarterCard` gains an `onOpen` prop.

- [ ] **Step 1: Make `starter-new` a shared create/edit sheet**

In `app/starter-new.tsx`, read `const { id } = useLocalSearchParams<{ id?: string }>();`, `const existing = id ? getStarter(id) : undefined;`, seed the `useState` initial values from `existing` (name, hydration, ratio, intervalHours, notes). The header title uses `existing ? t('starters.edit_title') : t('starters.add_title')`; the save button uses `existing ? t('starters.save_changes') : t('starters.button_save')`. In `save`, call `updateStarter(existing.id, input)` when editing, else `addStarter(input)`; the toast stays `toast_added` for create and a new `toast_updated` for edit. Add i18n keys `starters.edit_title` ("Edit starter"), `starters.save_changes` ("Save changes"), `starters.toast_updated` ("{{name}} updated."). All hyphen free.

- [ ] **Step 2: Make `StarterCard` open the detail**

In `src/ui/StarterCard.tsx`, add `onOpen: () => void` to props. Wrap the top area (the progress ring + name/badge block, not the Feed or delete controls) in a `Pressable` with `accessibilityRole="button"` calling `onOpen`. Show the mood name near the name: import `starterMood` from `@/lib/starterMood`, compute `const mood = starterMood(starter, now)`, and render `t(\`starters_mood.${mood}_name\`)` in `palette.proofTeal` as a small line. Keep the existing Feed and delete buttons working and outside the `Pressable`.

- [ ] **Step 3: Wire the card in the list**

In `app/(tabs)/starters.tsx`, pass `onOpen={() => router.push(\`/starter/${starter.id}\`)}` to each `StarterCard`.

- [ ] **Step 4: Typecheck, lint, manual verification**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean). In the browser: tapping a card opens the detail; the card shows the mood name; the `✎ Edit` path pre fills the editor and Save updates the starter (name/hydration/ratio/interval/notes) without losing feed history or the feed log.

- [ ] **Step 5: Commit**

```bash
git add app-src/app/starter-new.tsx app-src/src/ui/StarterCard.tsx "app-src/app/(tabs)/starters.tsx" app-src/src/i18n/en.json
git commit -m "feat(starters): edit starters and open detail from the card"
```

---

## Task 7: Backward compatibility + verification sweep

**Files:** none expected (verify; fix forward if needed).

- [ ] **Step 1: Backward compatibility**

In the browser console, seed an old style starter (no `feeds`, with a `lastFedAt`), reload, and open it: the load migration backfills one feed, the heatmap shows that day, total feeds reads 1, and the mood computes. Confirm a brand new starter (no feeds, `lastFedAt` null) shows `new`, an empty heatmap, and 0 total feeds.

- [ ] **Step 2: Full gate**

Run from `app-src/`:
```bash
pnpm typecheck && pnpm lint && pnpm test:coverage
```
Expected: typecheck clean, lint clean, all Jest suites pass, `src/lib` at 100% (including `starterMood.ts`).

- [ ] **Step 3: Hyphen and dash audit**

Scan every string value in `src/i18n/en.json` for hyphen, en dash, em dash, minus sign, figure dash. Expected: none. Fix any by rewording.

- [ ] **Step 4: Accessibility modes**

With the starter detail and edit open, verify light and dark, normal and floured fingers, and reduced motion: no clipped content, the heatmap keeps 7 per row, Sam renders, tap targets stay large. Fix any clipped sheet or hardcoded color found (the Sam loaf brand colors are the intended exception).

- [ ] **Step 5: Final commit if fixes were made**

```bash
git add -A
git commit -m "chore(starters): backward compatibility and accessibility verification fixes"
```
(Skip if Steps 1 to 4 produced no changes.)

---

## Self-Review

**Spec coverage:**
- Six moods + feed cycle mapping → Task 1 (`starterMood`), Task 3 (faces + copy).
- 28 day feeding heatmap → Task 1 (`dailyFeedCounts`), Task 4 (`FeedHeatmap`), Task 5 (placement).
- Feed timestamp log + backfill migration → Task 2.
- `getStarter` / `updateStarter` → Task 2; consumed in Tasks 5 and 6.
- Starter detail screen (Sam hero, countdown, feed, heatmap, stats without streak, details, edit, delete) → Task 5.
- Starter editing via `?id=` → Task 6 Step 1.
- Card tappable + mood cue → Task 6 Steps 2 to 3.
- No streak → stats card shows only total feeds and interval (Task 5 Step 3).
- Backward compatibility, house rules, 100% coverage → Task 7 and Global Constraints.

**Placeholder scan:** No TBD/TODO. The heatmap 7 per row sizing carries an explicit fallback instruction and a manual check, not a vague placeholder. All code steps carry real code.

**Type consistency:** `StarterMood` defined in Task 1 and consumed by `StarterSam` (Task 3), `FeedHeatmap` uses `dailyFeedCounts` (Task 1), the detail screen uses `starterMood`/`feedStatus`/`getStarter`/`feedStarter`/`removeStarter`/`restoreStarter`. `Starter.feeds?` added in Task 2 and read in Tasks 4 to 6. `updateStarter(id, StarterInput)` defined in Task 2, consumed in Task 6. i18n keys referenced (`starters_mood.*`, `starters.heatmap_*`, `starters.detail_*`, `starters.edit*`, `starters.save_changes`, `starters.toast_updated`) are all added in Tasks 3 to 6.
