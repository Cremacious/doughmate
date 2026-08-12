# Live Fermentation Timers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real countdown timers started from a recipe step's time or a custom duration, that run, persist, pause/resume, and notify (native) on completion, surfaced by a floating pill and a Timers sheet.

**Architecture:** Pure `src/lib/timer.ts` (`parseDuration`, `timerRemainingMs`, `isTimerDone`, `formatRemaining`) is unit tested. A new self contained `timers` store holds running/paused timers; "done" is derived from the clock. A `useNow` hook ticks the UI each second. Notifications are reconciled by a `TimerSync` component mirroring the existing `ReminderSync` (native only). New UI: a `TimerPill` in the tabs layout, a `TimerCard`, and a `/timers` sheet; recipe detail and cook mode gain a Start timer control per parseable step. Additive; other stores, engines, and feed reminders are untouched.

**Tech Stack:** Expo SDK 57, React 19, React Native 0.86, TypeScript strict, Expo Router (typed routes), expo-notifications, i18next, Jest (pure lib only), pnpm.

## Global Constraints

- No hyphens or dashes in any user facing copy. Rewrite around them.
- All user facing strings via i18n `t('key.path')` in `src/i18n/en.json`. Never hardcode display text.
- Colors, spacing, radii, durations from theme tokens (`useAppTheme` / `src/theme.ts`). Fermentation timers use the teal accent (`proofTeal` / `proofTealWash` / `proofTealText`).
- No back buttons; the Timers sheet is a dismissible bottom sheet.
- Dark mode, reduced motion, floured fingers must hold on every new surface.
- Additive and self contained: a new timers store and screens, additive functions in `src/lib/notifications.ts`, and entry point buttons on recipe detail and cook mode. Do not change other stores, engines, storage keys, monetization, or the existing feed reminder behavior.
- Pure engine files under `src/lib` keep 100% Jest coverage; new pure logic is tested and registered in `jest.config.js` `collectCoverageFrom`.
- Verify every task with `pnpm typecheck` and `pnpm lint` (both clean), run from `app-src/`.
- Work on branch `redesign/proof`. Commit per task. Do not push.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/timer.ts` | Pure `parseDuration`, `timerRemainingMs`, `isTimerDone`, `formatRemaining`. |
| `src/lib/timer.test.ts` | Their tests. |
| `jest.config.js` | Register `src/lib/timer.ts`. |
| `src/state/timers.tsx` | The timers store: type, provider, methods, persistence. |
| `src/hooks/useNow.ts` | A 1s ticking clock hook. |
| `src/lib/notifications.ts` | Add `scheduleTimerNotification` / `cancelTimerNotification` (native only). |
| `src/components/TimerSync.tsx` | Reconciles timer notifications with running timers. |
| `src/ui/TimerCard.tsx` | One running/finished timer with ring, remaining, controls. |
| `src/ui/TimerPill.tsx` | The floating active timers pill. |
| `app/timers.tsx` | The Timers sheet (running list + custom timer). |
| `app/(tabs)/_layout.tsx` | Render `TimerPill` above the tab bar. |
| `app/recipe/[id].tsx` | Start timer per parseable step. |
| `app/recipe/[id]/cook.tsx` | Start timer for the current step. |
| `app/_layout.tsx` | `TimersProvider`, `TimerSync`, register `timers` route. |
| `src/i18n/en.json` | All new copy. |

---

## Task 1: pure timer helpers

**Files:**
- Create: `src/lib/timer.ts`
- Create: `src/lib/timer.test.ts`
- Modify: `jest.config.js`

**Interfaces:**
- `parseDuration(text: string): number | null`
- `timerRemainingMs(timer: { status: 'running' | 'paused'; endsAt?: number; remainingMs?: number }, now: number): number`
- `isTimerDone(timer: { status: 'running' | 'paused'; endsAt?: number }, now: number): boolean`
- `formatRemaining(ms: number): string`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/timer.test.ts`:

```ts
import { formatRemaining, isTimerDone, parseDuration, timerRemainingMs } from './timer';

const MIN = 60_000;
const HOUR = 3_600_000;

describe('parseDuration', () => {
  it('parses minutes', () => {
    expect(parseDuration('30 min')).toBe(30 * MIN);
    expect(parseDuration('45 minutes')).toBe(45 * MIN);
    expect(parseDuration('90m')).toBe(90 * MIN);
  });
  it('parses hours', () => {
    expect(parseDuration('4 hr')).toBe(4 * HOUR);
    expect(parseDuration('2 hours')).toBe(2 * HOUR);
    expect(parseDuration('1h')).toBe(1 * HOUR);
  });
  it('parses hours and minutes together', () => {
    expect(parseDuration('1 hr 20 min')).toBe(HOUR + 20 * MIN);
    expect(parseDuration('1h 30m')).toBe(HOUR + 30 * MIN);
  });
  it('returns null when nothing parses', () => {
    expect(parseDuration('until puffy')).toBeNull();
    expect(parseDuration('')).toBeNull();
  });
});

describe('timerRemainingMs', () => {
  it('counts down a running timer', () => {
    expect(timerRemainingMs({ status: 'running', endsAt: 1000 + 5 * MIN }, 1000)).toBe(5 * MIN);
  });
  it('never goes negative', () => {
    expect(timerRemainingMs({ status: 'running', endsAt: 1000 }, 1000 + MIN)).toBe(0);
  });
  it('returns the held remaining while paused', () => {
    expect(timerRemainingMs({ status: 'paused', remainingMs: 7 * MIN }, 999999)).toBe(7 * MIN);
  });
});

describe('isTimerDone', () => {
  it('is done when running and past the end', () => {
    expect(isTimerDone({ status: 'running', endsAt: 1000 }, 1000)).toBe(true);
    expect(isTimerDone({ status: 'running', endsAt: 2000 }, 1000)).toBe(false);
  });
  it('is never done while paused', () => {
    expect(isTimerDone({ status: 'paused' }, 999999)).toBe(false);
  });
});

describe('formatRemaining', () => {
  it('shows hours and minutes over an hour', () => {
    expect(formatRemaining(3 * HOUR + 41 * MIN)).toBe('3h 41m');
  });
  it('shows minutes and seconds under an hour', () => {
    expect(formatRemaining(12 * MIN + 4000)).toBe('12:04');
  });
  it('is 0:00 at zero', () => {
    expect(formatRemaining(0)).toBe('0:00');
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd app-src && pnpm test -- timer.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

Create `src/lib/timer.ts`:

```ts
// Pure timer logic. Parse a free text step time to milliseconds, compute the
// remaining time and done state, and format a compact remaining label.
const MIN_MS = 60_000;
const HOUR_MS = 3_600_000;

/** Parse "30 min", "4 hr", "1 hr 20 min", "1h", "90m" to ms. Null if none found. */
export function parseDuration(text: string): number | null {
  const lower = text.toLowerCase();
  let ms = 0;
  let found = false;
  const hours = /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/.exec(lower);
  if (hours) {
    ms += Number(hours[1]) * HOUR_MS;
    found = true;
  }
  const mins = /(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/.exec(lower);
  if (mins) {
    ms += Number(mins[1]) * MIN_MS;
    found = true;
  }
  return found ? Math.round(ms) : null;
}

export interface TimerLike {
  status: 'running' | 'paused';
  endsAt?: number;
  remainingMs?: number;
}

/** Remaining ms: running counts down to the end (never negative), paused is held. */
export function timerRemainingMs(timer: TimerLike, now: number): number {
  if (timer.status === 'running') {
    return Math.max(0, (timer.endsAt ?? now) - now);
  }
  return timer.remainingMs ?? 0;
}

/** A running timer past its end is done. Paused timers are never done. */
export function isTimerDone(timer: TimerLike, now: number): boolean {
  return timer.status === 'running' && now >= (timer.endsAt ?? Infinity);
}

/** "3h 41m" over an hour, "12:04" (m:ss) under an hour, "0:00" at zero. */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  if (total >= 3600) {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
```

Note: `parseDuration` matches hours first then minutes anywhere in the string, so "1 hr 20 min" sums both. The `\b` after unit words and the `m|min` ordering (regex alternation is greedy left to right per position, and `\b` bounds the token) handle "90m" and "45 minutes". Confirm against the tests.

- [ ] **Step 4: Register coverage and run**

Add `'src/lib/timer.ts',` to `collectCoverageFrom` in `jest.config.js`.
Run: `cd app-src && pnpm test:coverage`
Expected: PASS, `timer.ts` at 100%. If a branch is uncovered, add a focused test.

- [ ] **Step 5: Typecheck, lint, commit**

Run: `cd app-src && pnpm typecheck && pnpm lint`.

```bash
git add app-src/src/lib/timer.ts app-src/src/lib/timer.test.ts app-src/jest.config.js
git commit -m "feat(timers): pure duration parse, remaining, done, format helpers"
```

---

## Task 2: timers store + useNow hook

**Files:**
- Create: `src/state/timers.tsx`
- Create: `src/hooks/useNow.ts`
- Modify: `app/_layout.tsx` (add `TimersProvider` only; TimerSync and route come in Task 3 and Task 5)

**Interfaces:**
- `Timer`, `StartTimerInput` types; `useTimers()` -> `{ timers, startTimer, pauseTimer, resumeTimer, cancelTimer, getTimer }`. `timers` sorted soonest to finish (running by `endsAt` asc, then paused).
- `useNow(intervalMs?: number): number`.

- [ ] **Step 1: Create `useNow`**

Create `src/hooks/useNow.ts`:

```ts
import { useEffect, useState } from 'react';

/** Current time, updated on an interval, so countdowns re-render. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(h);
  }, [intervalMs]);
  return now;
}

export default useNow;
```

- [ ] **Step 2: Create the store**

Create `src/state/timers.tsx`, mirroring `src/state/starters.tsx` (read it first for the provider/commit/useMemo pattern):

```tsx
// Live timers. Each is running (with an end time) or paused (with a held
// remaining). "Done" is derived from the clock, not stored. Self contained.
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { storage } from '@/lib/storage';

export interface Timer {
  id: string;
  label: string;
  recipeId?: string;
  stepLabel?: string;
  durationMs: number;
  status: 'running' | 'paused';
  endsAt?: number;
  remainingMs?: number;
  createdAt: number;
}

export interface StartTimerInput {
  label: string;
  durationMs: number;
  recipeId?: string;
  stepLabel?: string;
}

const STORAGE_KEY = 'doughmate.timers.v1';

function loadTimers(): Timer[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as Timer[];
  } catch {
    return [];
  }
}

function sortTimers(list: Timer[]): Timer[] {
  return [...list].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'running' ? -1 : 1;
    }
    if (a.status === 'running') {
      return (a.endsAt ?? 0) - (b.endsAt ?? 0);
    }
    return b.createdAt - a.createdAt;
  });
}

interface TimersContextValue {
  timers: Timer[];
  startTimer: (input: StartTimerInput) => Timer;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  cancelTimer: (id: string) => void;
  getTimer: (id: string) => Timer | undefined;
}

const TimersContext = createContext<TimersContextValue | null>(null);

export function TimersProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>(() => sortTimers(loadTimers()));

  const value = useMemo<TimersContextValue>(() => {
    const commit = (next: Timer[]) => {
      const sorted = sortTimers(next);
      storage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      setTimers(sorted);
    };
    return {
      timers,
      startTimer: (input) => {
        const timer: Timer = {
          id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          label: input.label,
          recipeId: input.recipeId,
          stepLabel: input.stepLabel,
          durationMs: input.durationMs,
          status: 'running',
          endsAt: Date.now() + input.durationMs,
          createdAt: Date.now(),
        };
        commit([timer, ...timers]);
        return timer;
      },
      pauseTimer: (id) =>
        commit(
          timers.map((t) =>
            t.id === id && t.status === 'running'
              ? {
                  ...t,
                  status: 'paused',
                  remainingMs: Math.max(0, (t.endsAt ?? Date.now()) - Date.now()),
                  endsAt: undefined,
                }
              : t
          )
        ),
      resumeTimer: (id) =>
        commit(
          timers.map((t) =>
            t.id === id && t.status === 'paused'
              ? {
                  ...t,
                  status: 'running',
                  endsAt: Date.now() + (t.remainingMs ?? 0),
                  remainingMs: undefined,
                }
              : t
          )
        ),
      cancelTimer: (id) => commit(timers.filter((t) => t.id !== id)),
      getTimer: (id) => timers.find((t) => t.id === id),
    };
  }, [timers]);

  return <TimersContext.Provider value={value}>{children}</TimersContext.Provider>;
}

export function useTimers(): TimersContextValue {
  const ctx = useContext(TimersContext);
  if (!ctx) {
    throw new Error('useTimers must be used inside a TimersProvider');
  }
  return ctx;
}
```

- [ ] **Step 3: Add the provider**

In `app/_layout.tsx`, import `TimersProvider` and nest it in the provider tree (for example inside `BakesProvider`, around `StartersProvider`). Keep every existing provider.

- [ ] **Step 4: Typecheck, lint, commit**

Run: `cd app-src && pnpm typecheck && pnpm lint`; `pnpm test` still green.

```bash
git add app-src/src/state/timers.tsx app-src/src/hooks/useNow.ts app-src/app/_layout.tsx
git commit -m "feat(timers): timers store, useNow hook, provider"
```

---

## Task 3: timer notifications + TimerSync

**Files:**
- Modify: `src/lib/notifications.ts`
- Create: `src/components/TimerSync.tsx`
- Modify: `app/_layout.tsx` (render `TimerSync`)
- Modify: `src/i18n/en.json`

**Interfaces:**
- `scheduleTimerNotification(id: string, title: string, body: string, fireAt: number): Promise<void>`
- `cancelTimerNotification(id: string): Promise<void>`
- `cancelAllTimerNotifications(): Promise<void>`

- [ ] **Step 1: Add timer notification functions**

Read `src/lib/notifications.ts` for its existing pattern (an id map under `doughmate.notif.v1`, native only, `isNative` guard). Add analogous functions under a SEPARATE map key `doughmate.notif.timers.v1` so timer notifications never collide with feed reminders:

```ts
const TIMER_MAP_KEY = 'doughmate.notif.timers.v1';

function loadTimerMap(): Record<string, string> {
  try {
    return JSON.parse(storage.getItem(TIMER_MAP_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}
function saveTimerMap(map: Record<string, string>): void {
  storage.setItem(TIMER_MAP_KEY, JSON.stringify(map));
}

export async function scheduleTimerNotification(
  id: string,
  title: string,
  body: string,
  fireAt: number
): Promise<void> {
  if (!isNative) {
    return;
  }
  await cancelTimerNotification(id);
  const seconds = Math.max(1, Math.round((fireAt - Date.now()) / 1000));
  const notifId = await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
  });
  const map = loadTimerMap();
  map[id] = notifId;
  saveTimerMap(map);
}

export async function cancelTimerNotification(id: string): Promise<void> {
  if (!isNative) {
    return;
  }
  const map = loadTimerMap();
  const notifId = map[id];
  if (notifId) {
    await Notifications.cancelScheduledNotificationAsync(notifId);
    delete map[id];
    saveTimerMap(map);
  }
}

export async function cancelAllTimerNotifications(): Promise<void> {
  if (!isNative) {
    return;
  }
  const map = loadTimerMap();
  await Promise.all(
    Object.values(map).map((n) => Notifications.cancelScheduledNotificationAsync(n))
  );
  saveTimerMap({});
}
```

Match the exact trigger shape used by the existing feed reminder scheduling in this file (if it uses a `Date` trigger or a different `SchedulableTriggerInputTypes`, mirror that instead of the interval form above). Do not change the existing feed reminder functions.

- [ ] **Step 2: Create `TimerSync`**

Create `src/components/TimerSync.tsx`, mirroring `src/components/ReminderSync.tsx` (read it). It watches `useTimers().timers`, and on change reconciles native notifications: for each RUNNING timer with `endsAt` in the future, `scheduleTimerNotification(t.id, appName, t.label, t.endsAt)`; for timers that are paused, already ended, or no longer present, `cancelTimerNotification`. Simplest correct approach each effect run: cancel all, then schedule the currently running future ones. No op on web. Renders null. Use `t('timers.notification_body', { label })` or the timer label for the body, and `t('app.name')` for the title.

- [ ] **Step 3: Render `TimerSync` and add copy**

In `app/_layout.tsx`, render `<TimerSync />` next to `<ReminderSync />`. Add any i18n used (for example `timers.notification_title` if you prefer a dedicated title). All copy hyphen and dash free.

- [ ] **Step 4: Typecheck, lint, commit**

Run: `cd app-src && pnpm typecheck && pnpm lint`.

```bash
git add app-src/src/lib/notifications.ts app-src/src/components/TimerSync.tsx app-src/app/_layout.tsx app-src/src/i18n/en.json
git commit -m "feat(timers): schedule and reconcile completion notifications"
```

---

## Task 4: TimerCard and the Timers sheet

**Files:**
- Create: `src/ui/TimerCard.tsx`
- Create: `app/timers.tsx`
- Modify: `app/_layout.tsx` (register the `timers` route)
- Modify: `src/i18n/en.json`

**Interfaces:**
- `TimerCard({ timer, now, onPauseResume, onCancel })`.
- Route `/timers`.

- [ ] **Step 1: Add copy**

Add a `timers` block to `en.json` (hyphen and dash free):

```json
"timers": {
  "title": "Timers",
  "running": "Running",
  "custom": "Custom timer",
  "label_optional": "Label (optional)",
  "label_placeholder": "Name this timer",
  "how_long": "How long?",
  "hours": "Hours",
  "minutes": "Minutes",
  "start": "Start timer",
  "done": "Done",
  "dismiss": "Dismiss",
  "empty_title": "No timers running.",
  "empty_body": "Start one from a recipe step or set a custom timer.",
  "start_step_timer": "Start {{time}} timer",
  "notification_body": "{{label}} is done."
}
```

- [ ] **Step 2: Implement `TimerCard`**

Create `src/ui/TimerCard.tsx`. A row with a teal progress ring (reuse the ring approach from `src/ui/ProgressRing.tsx` if it fits, else a simple `react-native-svg` circle), the label + optional stepLabel, `formatRemaining(timerRemainingMs(timer, now))`, and controls: when running, a pause button and a cancel button; when done (`isTimerDone`), a Done label and a dismiss (cancel) button; when paused, a resume button and cancel. Progress fraction = `1 - remaining / durationMs`. Use teal tokens. Import `formatRemaining`, `timerRemainingMs`, `isTimerDone` from `@/lib/timer`.

- [ ] **Step 3: Build the Timers sheet**

Create `app/timers.tsx`, a tall `BottomSheet`, registered as a transparent modal in `app/_layout.tsx` (mirror `starter/[id]`). Contents:
- `now = useNow()`.
- Running label + the list of `TimerCard`s (all timers; sorted by the store). Empty state (`empty_title` / `empty_body`, optionally a small Sam) when there are no timers.
- The custom timer: `hours` and `minutes` state; two `Stepper`s (Hours min 0; Minutes min 0 step 5); a `formatRemaining((hours*60 + minutes) * 60000)` preview; quick pick chips (15m, 30m, 1h, 4h) that set hours/minutes; an optional label `Input`; a Start `Button` (disabled when `hours === 0 && minutes === 0`) that calls `startTimer({ label: label.trim() || t('timers.title'), durationMs: (hours*3600 + minutes*60) * 1000 })` and resets the form.
- Wire each card's onPauseResume to `pauseTimer`/`resumeTimer` by status, onCancel to `cancelTimer`.

- [ ] **Step 4: Typecheck, lint, manual check**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean).

Manual: open `/timers`; set a 1 minute custom timer, Start; it appears and counts down; pause holds it; resume continues; it reaches Done and can be dismissed.

- [ ] **Step 5: Commit**

```bash
git add app-src/src/ui/TimerCard.tsx app-src/app/timers.tsx app-src/app/_layout.tsx app-src/src/i18n/en.json
git commit -m "feat(timers): TimerCard and the Timers sheet with a custom timer"
```

---

## Task 5: TimerPill in the tabs layout

**Files:**
- Create: `src/ui/TimerPill.tsx`
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Implement `TimerPill`**

Create `src/ui/TimerPill.tsx`. Reads `useTimers()` and `useNow()`. Renders null when `timers.length === 0`. Otherwise picks the primary timer: the soonest to finish running timer, else the first. Shows a teal pill (position absolute, above the tab bar) with a small spinner or ring, the primary timer's label, `formatRemaining(timerRemainingMs(primary, now))` (or `t('timers.done')` when `isTimerDone`), and a `+N` badge when `timers.length > 1`. On press, `router.push('/timers')`. Use teal tokens and `shadow`. Give it a bottom offset that clears the floating tab bar.

- [ ] **Step 2: Mount it in the tabs layout**

In `app/(tabs)/_layout.tsx`, read the current layout. It renders `<Tabs tabBar={(props) => <AppTabBar {...props} />}>`. Wrap so `TimerPill` renders above the tab bar on every tab: place `<TimerPill />` in the custom `tabBar` render (returning a fragment with the pill above `AppTabBar`), or wrap the Tabs in a container `View` with `TimerPill` as an absolutely positioned sibling. Choose whichever renders the pill above the bar without breaking the tab bar; verify in the manual check.

- [ ] **Step 3: Typecheck, lint, manual check**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean).

Manual: with a timer running, the pill shows above the tab bar on every tab, updates each second, shows `+N` with multiple timers, and opens the Timers sheet on tap; with no timers it is absent.

- [ ] **Step 4: Commit**

```bash
git add app-src/src/ui/TimerPill.tsx "app-src/app/(tabs)/_layout.tsx"
git commit -m "feat(timers): floating active timers pill above the tab bar"
```

---

## Task 6: Start a timer from a step

**Files:**
- Modify: `app/recipe/[id].tsx`
- Modify: `app/recipe/[id]/cook.tsx`
- Modify: `src/i18n/en.json` (only if a new key is needed; `timers.start_step_timer` already added in Task 4)

- [ ] **Step 1: Recipe detail**

In `app/recipe/[id].tsx`, in the Method section where each step renders its time pill, for a step whose `parseDuration(step.time)` is non null, render a quiet "Start {time} timer" control (`t('timers.start_step_timer', { time: step.time })`) that calls `useTimers().startTimer({ label: step.text.trim().slice(0, 40), stepLabel: t('recipes.cook_step_short', ...) or 'step N', recipeId: recipe.id, durationMs })`. If a short step label key does not exist, use a simple `\`step ${i + 1}\`` composed without hyphens, or reuse an existing key. Keep the existing time pill display; the Start control is additive. Import `parseDuration` from `@/lib/timer` and `useTimers`.

- [ ] **Step 2: Cook mode**

In `app/recipe/[id]/cook.tsx`, on the current step, if `parseDuration(step.time)` is non null, render a quiet "Start {time} timer" action (near the step time) that starts the timer the same way (label from `step.text`, `recipeId`, `stepLabel` = the current step number, `durationMs`). Do not disturb the step navigation, All done, or Log this bake behavior.

- [ ] **Step 3: Typecheck, lint, manual check**

Run: `cd app-src && pnpm typecheck && pnpm lint` (both clean).

Manual: a recipe step with a time like "30 min" shows a Start timer control on the detail and in cook mode; tapping it starts a timer (the pill appears) labeled from the step; a step with an unparseable time ("until puffy") shows no Start control.

- [ ] **Step 4: Commit**

```bash
git add "app-src/app/recipe/[id].tsx" "app-src/app/recipe/[id]/cook.tsx" app-src/src/i18n/en.json
git commit -m "feat(timers): start a timer from a recipe step"
```

---

## Task 7: Verification sweep

**Files:** none expected (verify; fix forward if needed).

- [ ] **Step 1: Full gate**

Run from `app-src/`: `pnpm typecheck && pnpm lint && pnpm test:coverage`. Expected: clean; all suites pass; `src/lib` at 100% including `timer.ts`.

- [ ] **Step 2: Functional walk (browser)**

Start a custom timer and a step timer; both appear in the Timers sheet and in the pill; the countdown ticks each second; pause holds and resume continues; a short timer reaches Done and dismisses; cancel removes; the pill shows the soonest and a `+N`, and disappears when no timers remain. (OS notifications are native only and not expected to fire in web preview.)

- [ ] **Step 3: Hyphen and dash audit**

Scan every string value in `src/i18n/en.json` for hyphen, en dash, em dash, minus sign, figure dash. Expected: none.

- [ ] **Step 4: Accessibility modes**

With the Timers sheet, the pill, and a step Start control visible, verify light and dark, normal and floured fingers, reduced motion: no clipped content, tap targets large (the custom timer steppers especially), tokens honored, and the pill does not overlap the tab bar labels.

- [ ] **Step 5: Final commit if fixes were made**

```bash
git add -A
git commit -m "chore(timers): verification fixes"
```
(Skip if no changes.)

---

## Self-Review

**Spec coverage:**
- Live countdown timers, run/persist -> Task 2 (store).
- parse step time, remaining, done, format -> Task 1 (pure helpers).
- pause/resume/cancel, derived done -> Task 2 (store), Task 1 (`isTimerDone`).
- native completion notification, reconcile -> Task 3 (notifications + TimerSync).
- floating pill -> Task 5.
- Timers sheet + custom timer (big steppers) -> Task 4.
- start from a step -> Task 6.
- 1s tick -> Task 2 (`useNow`), consumed in Tasks 4 and 5.
- 100% coverage for pure logic -> Task 1, Task 7.
- web no op notifications, additive, house rules -> Global Constraints and Task 3.

**Placeholder scan:** No TBD/TODO. Tasks carry real code (helpers, store, notifications, useNow) and precise structure for the UI (TimerCard, sheet, pill) against named existing components (`Stepper`, `BottomSheet`, `Button`, `Input`, `Chip`, `ProgressRing`, `AppTabBar`, `ReminderSync`). Verification steps list concrete checks. The one flexible point (exact expo-notifications trigger shape) is anchored to "match the existing feed reminder scheduling in this file".

**Type consistency:** `Timer` and `StartTimerInput` defined in Task 2, consumed by TimerCard/sheet/pill/step starts (Tasks 4 to 6). `parseDuration`/`timerRemainingMs`/`isTimerDone`/`formatRemaining` defined in Task 1, used in Tasks 4 to 6. `useNow` defined in Task 2, used in Tasks 4 and 5. `scheduleTimerNotification`/`cancelTimerNotification` defined in Task 3, used by TimerSync. Store methods (`startTimer`/`pauseTimer`/`resumeTimer`/`cancelTimer`/`getTimer`) defined in Task 2, consumed in Tasks 4 to 6. i18n `timers.*` keys added in Task 4, used across Tasks 4 to 6.
