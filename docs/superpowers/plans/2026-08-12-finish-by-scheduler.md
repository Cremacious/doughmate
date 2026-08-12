# Finish by Scheduler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** From a recipe, pick a "ready by" time and get an armed, notifying backward schedule that tells you when to start the bake and each step.

**Architecture:** A new pure `src/lib/schedule.ts` computes the backward schedule, feasibility, progress, and clock formatting. A new `src/state/bakePlan.tsx` store holds one active plan (snapshotted). Additive bake plan notification functions plus a `BakePlanSync` reconciler mirror the existing timer/reminder pattern. New UI: a `ScheduleTimeline`, a `BakePlanCard`, and a `bake-plan` bottom sheet, with additive extensions to `TimerPill`, the Timers sheet, and recipe detail.

**Tech Stack:** Expo SDK 57, React 19, RN 0.86, TypeScript strict, Expo Router (typed routes), react-native-svg, i18next, expo-notifications, Jest.

## Global Constraints

- No hyphens or dashes in any user facing copy (ever). Use "to"/"through"/commas.
- All user facing strings via i18n (`src/i18n/en.json`); no hardcoded copy.
- Colors, spacing, radii from theme tokens only. Scheduler uses the teal fermentation accent (`proofTeal`/`proofTealWash`/`proofTealText`); the finish node uses `accentButter`; the not enough time warning uses the danger token.
- No back buttons; sheets are dismissible (`BottomSheet`, swipe or X to close).
- Dark mode, reduced motion, floured fingers hold on every new surface.
- Additive and self contained: new schedule lib, new bake plan store, new screens/components, additive bake plan notification functions, and documented additive extensions to `TimerPill`, `app/timers.tsx`, `src/ui/Stepper.tsx`, and `app/recipe/[id].tsx`. Do not touch other stores, engines, storage keys, monetization, the feed reminder behavior, or the live timer behavior.
- One active plan; `armPlan` replaces any existing plan.
- Pure logic (`src/lib/schedule.ts`) at 100% coverage, registered in `jest.config.js`.
- Commit per task on `redesign/proof`. Do not push until the user says "sync".

---

### Task 1: Pure schedule helpers

**Files:**
- Create: `src/lib/schedule.ts`
- Test: `src/lib/schedule.test.ts`
- Modify: `jest.config.js` (add `'src/lib/schedule.ts'` to `collectCoverageFrom`)

**Interfaces:**
- Consumes: `parseDuration` from `src/lib/timer.ts`.
- Produces:
  - `interface StepInput { text: string; time?: string }`
  - `interface ScheduleStep { index: number; text: string; time?: string; durationMs: number; isCheckpoint: boolean; startAt: number }`
  - `interface Schedule { startAt: number; finishAt: number; totalMs: number; steps: ScheduleStep[] }`
  - `totalActiveMs(steps: StepInput[]): number`
  - `buildSchedule(steps: StepInput[], finishAt: number): Schedule`
  - `isFeasible(steps: StepInput[], finishAt: number, now: number): boolean`
  - `earliestFinish(steps: StepInput[], now: number): number`
  - `interface PlanProgress { currentIndex: number | null; nextIndex: number | null; done: boolean }`
  - `planProgress(steps: { startAt: number }[], finishAt: number, now: number): PlanProgress`
  - `composeFinishAt(now: number, dayOffset: number, hour12: number, minute: number, meridiem: 'AM' | 'PM'): number`
  - `formatClock(ms: number): string` — e.g. `"8:00 AM"`, `"2:45 PM"`, `"12:00 AM"`
  - `formatDayLabel(ms: number, now: number): string` — `"Today"`, `"Tomorrow"`, else a weekday abbreviation (`"Sun".."Sat"`)

- [ ] **Step 1: Write the failing tests**

Create `src/lib/schedule.test.ts`. Use fixed timestamps built with `new Date(y, m, d, h, min)` so assertions are timezone consistent (both sides use local time). A shared realistic recipe: `[{text:'Mix, rest', time:'30 min'}, {text:'Add salt', }, {text:'Bulk ferment', time:'4 hr'}, {text:'Shape'}, {text:'Cold proof', time:'12 hr'}, {text:'Bake', time:'45 min'}]` → total = 30m + 4h + 12h + 45m = 17h 15m = 62_100_000 ms.

```ts
import {
  totalActiveMs, buildSchedule, isFeasible, earliestFinish,
  planProgress, composeFinishAt, formatClock, formatDayLabel,
} from './schedule';

const STEPS = [
  { text: 'Mix, rest', time: '30 min' },
  { text: 'Add salt' },
  { text: 'Bulk ferment', time: '4 hr' },
  { text: 'Shape' },
  { text: 'Cold proof', time: '12 hr' },
  { text: 'Bake', time: '45 min' },
];
const TOTAL = (30 + 4 * 60 + 12 * 60 + 45) * 60_000; // 62_100_000

describe('totalActiveMs', () => {
  it('sums parseable step times, treating untimed as zero', () => {
    expect(totalActiveMs(STEPS)).toBe(TOTAL);
  });
  it('treats an unparseable time as zero', () => {
    expect(totalActiveMs([{ text: 'x', time: 'until puffy' }])).toBe(0);
  });
  it('is zero for no steps', () => {
    expect(totalActiveMs([])).toBe(0);
  });
});

describe('buildSchedule', () => {
  const finishAt = new Date(2026, 7, 13, 8, 0).getTime(); // Thu Aug 13 2026, 8:00 AM
  const s = buildSchedule(STEPS, finishAt);
  it('starts the bake total before the finish', () => {
    expect(s.totalMs).toBe(TOTAL);
    expect(s.startAt).toBe(finishAt - TOTAL);
    expect(s.finishAt).toBe(finishAt);
  });
  it('chains each step start forward from startAt', () => {
    expect(s.steps[0].startAt).toBe(s.startAt); // Mix
    expect(s.steps[1].startAt).toBe(s.startAt + 30 * 60_000); // Add salt (checkpoint)
    expect(s.steps[2].startAt).toBe(s.startAt + 30 * 60_000); // Bulk ferment
    expect(s.steps[5].startAt).toBe(finishAt - 45 * 60_000); // Bake
  });
  it('marks zero length steps as checkpoints', () => {
    expect(s.steps[1].isCheckpoint).toBe(true);
    expect(s.steps[1].durationMs).toBe(0);
    expect(s.steps[2].isCheckpoint).toBe(false);
    expect(s.steps[0].index).toBe(0);
    expect(s.steps[2].time).toBe('4 hr');
  });
});

describe('isFeasible / earliestFinish', () => {
  const now = new Date(2026, 7, 12, 12, 0).getTime(); // noon Aug 12
  it('is feasible when start is at or after now', () => {
    expect(isFeasible(STEPS, now + TOTAL, now)).toBe(true); // start == now, boundary
    expect(isFeasible(STEPS, now + TOTAL + 1, now)).toBe(true);
  });
  it('is not feasible when start would be before now', () => {
    expect(isFeasible(STEPS, now + TOTAL - 1, now)).toBe(false);
  });
  it('earliestFinish is now plus total', () => {
    expect(earliestFinish(STEPS, now)).toBe(now + TOTAL);
  });
});

describe('planProgress', () => {
  const steps = [{ startAt: 100 }, { startAt: 200 }, { startAt: 300 }];
  const finishAt = 400;
  it('before start: no current, next is first', () => {
    expect(planProgress(steps, finishAt, 50)).toEqual({ currentIndex: null, nextIndex: 0, done: false });
  });
  it('mid plan: current is last started, next is upcoming', () => {
    expect(planProgress(steps, finishAt, 250)).toEqual({ currentIndex: 1, nextIndex: 2, done: false });
  });
  it('on a boundary counts that step as started', () => {
    expect(planProgress(steps, finishAt, 200)).toEqual({ currentIndex: 1, nextIndex: 2, done: false });
  });
  it('all started, not yet finished: no next', () => {
    expect(planProgress(steps, finishAt, 350)).toEqual({ currentIndex: 2, nextIndex: null, done: false });
  });
  it('done at or past finish', () => {
    expect(planProgress(steps, finishAt, 400).done).toBe(true);
  });
  it('empty steps', () => {
    expect(planProgress([], 400, 50)).toEqual({ currentIndex: null, nextIndex: null, done: false });
  });
});

describe('composeFinishAt', () => {
  const now = new Date(2026, 7, 12, 9, 30).getTime(); // Wed Aug 12, 9:30 AM
  it('composes today at a wall clock time', () => {
    const r = new Date(composeFinishAt(now, 0, 8, 0, 'AM'));
    expect(r.getHours()).toBe(8);
    expect(r.getMinutes()).toBe(0);
    expect(r.getDate()).toBe(12);
  });
  it('applies the day offset', () => {
    expect(new Date(composeFinishAt(now, 1, 8, 0, 'AM')).getDate()).toBe(13);
  });
  it('12 AM maps to hour 0, 12 PM maps to hour 12', () => {
    expect(new Date(composeFinishAt(now, 0, 12, 0, 'AM')).getHours()).toBe(0);
    expect(new Date(composeFinishAt(now, 0, 12, 0, 'PM')).getHours()).toBe(12);
  });
  it('PM adds twelve hours', () => {
    expect(new Date(composeFinishAt(now, 0, 2, 45, 'PM')).getHours()).toBe(14);
  });
});

describe('formatClock', () => {
  it('formats AM and PM with padded minutes', () => {
    expect(formatClock(new Date(2026, 7, 12, 8, 0).getTime())).toBe('8:00 AM');
    expect(formatClock(new Date(2026, 7, 12, 14, 5).getTime())).toBe('2:05 PM');
  });
  it('midnight and noon read as 12', () => {
    expect(formatClock(new Date(2026, 7, 12, 0, 30).getTime())).toBe('12:30 AM');
    expect(formatClock(new Date(2026, 7, 12, 12, 0).getTime())).toBe('12:00 PM');
  });
});

describe('formatDayLabel', () => {
  const now = new Date(2026, 7, 12, 9, 0).getTime(); // Wed Aug 12
  it('labels today and tomorrow', () => {
    expect(formatDayLabel(new Date(2026, 7, 12, 20, 0).getTime(), now)).toBe('Today');
    expect(formatDayLabel(new Date(2026, 7, 13, 7, 0).getTime(), now)).toBe('Tomorrow');
  });
  it('labels further days by weekday abbreviation', () => {
    expect(formatDayLabel(new Date(2026, 7, 14, 7, 0).getTime(), now)).toBe('Fri');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test schedule` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/schedule.ts`**

```ts
// Pure backward scheduling for the finish by planner. Given a recipe's steps
// and a target ready time, compute when the bake and each step begin. Untimed
// steps are zero length checkpoints. Clock formatting is deterministic and
// hyphen free.
import { parseDuration } from './timer';

export interface StepInput {
  text: string;
  time?: string;
}

export interface ScheduleStep {
  index: number;
  text: string;
  time?: string;
  durationMs: number;
  isCheckpoint: boolean;
  startAt: number;
}

export interface Schedule {
  startAt: number;
  finishAt: number;
  totalMs: number;
  steps: ScheduleStep[];
}

function stepDuration(step: StepInput): number {
  return step.time ? (parseDuration(step.time) ?? 0) : 0;
}

/** Sum of parseable step durations; checkpoints contribute zero. */
export function totalActiveMs(steps: StepInput[]): number {
  return steps.reduce((sum, s) => sum + stepDuration(s), 0);
}

/** Backward schedule: startAt = finishAt - total, each step chained forward. */
export function buildSchedule(steps: StepInput[], finishAt: number): Schedule {
  const totalMs = totalActiveMs(steps);
  const startAt = finishAt - totalMs;
  let cursor = startAt;
  const out: ScheduleStep[] = steps.map((s, index) => {
    const durationMs = stepDuration(s);
    const step: ScheduleStep = {
      index,
      text: s.text,
      time: s.time,
      durationMs,
      isCheckpoint: durationMs === 0,
      startAt: cursor,
    };
    cursor += durationMs;
    return step;
  });
  return { startAt, finishAt, totalMs, steps: out };
}

/** The bake can still finish by finishAt when its start is not before now. */
export function isFeasible(steps: StepInput[], finishAt: number, now: number): boolean {
  return finishAt - totalActiveMs(steps) >= now;
}

/** Earliest reachable ready time from now. */
export function earliestFinish(steps: StepInput[], now: number): number {
  return now + totalActiveMs(steps);
}

export interface PlanProgress {
  currentIndex: number | null;
  nextIndex: number | null;
  done: boolean;
}

/** Derive current (last started), next (first upcoming) and done from the clock. */
export function planProgress(
  steps: { startAt: number }[],
  finishAt: number,
  now: number
): PlanProgress {
  let currentIndex: number | null = null;
  let nextIndex: number | null = null;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i]!.startAt <= now) {
      currentIndex = i;
    } else {
      nextIndex = i;
      break;
    }
  }
  return { currentIndex, nextIndex, done: now >= finishAt };
}

/** Compose a target timestamp from a day offset and a 12 hour wall clock time. */
export function composeFinishAt(
  now: number,
  dayOffset: number,
  hour12: number,
  minute: number,
  meridiem: 'AM' | 'PM'
): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  let hour24 = hour12 % 12;
  if (meridiem === 'PM') {
    hour24 += 12;
  }
  d.setHours(hour24, minute, 0, 0);
  return d.getTime();
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "8:00 AM" style, deterministic and locale independent. */
export function formatClock(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes();
  const meridiem = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${meridiem}`;
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "Today" / "Tomorrow" / a weekday abbreviation. */
export function formatDayLabel(ms: number, now: number): string {
  const dayMs = 86_400_000;
  const diff = Math.round((startOfDay(ms) - startOfDay(now)) / dayMs);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return WEEKDAYS[new Date(ms).getDay()]!;
}
```

- [ ] **Step 4: Register coverage**

In `jest.config.js`, add `'src/lib/schedule.ts',` to `collectCoverageFrom` (after the `'src/lib/timer.ts',` line).

- [ ] **Step 5: Run tests and coverage**

Run: `pnpm test schedule` then `pnpm test:coverage`. Expected: all pass; `src/lib/schedule.ts` at 100% statements/branches/functions/lines. If a branch is uncovered, add the missing case (do not lower thresholds).

- [ ] **Step 6: Typecheck, lint, commit**

Run: `pnpm typecheck && pnpm lint` (clean). Then:
```bash
git add src/lib/schedule.ts src/lib/schedule.test.ts jest.config.js
git commit -m "feat(scheduler): pure backward schedule, feasibility, progress, clock format"
```

---

### Task 2: Bake plan store and provider

**Files:**
- Create: `src/state/bakePlan.tsx`
- Modify: `app/_layout.tsx` (wrap tree with `BakePlanProvider`)

**Interfaces:**
- Consumes: `buildSchedule`, `Schedule`, `ScheduleStep` from `src/lib/schedule.ts`; `storage` from `src/lib/storage`; `Recipe`/`RecipeStep` shape from `src/state/recipes`.
- Produces:
  - `interface PlanStepSnapshot { text: string; time?: string; durationMs: number; isCheckpoint: boolean; startAt: number }`
  - `interface BakePlan { id: string; recipeId: string; recipeName: string; finishAt: number; startAt: number; steps: PlanStepSnapshot[]; createdAt: number }`
  - `interface ArmPlanInput { recipeId: string; recipeName: string; steps: { text: string; time?: string }[]; finishAt: number }`
  - Context value `useBakePlan()` → `{ plan: BakePlan | null; armPlan: (input: ArmPlanInput) => BakePlan; cancelPlan: () => void }`
  - `BakePlanProvider`.

**Pattern:** Mirror `src/state/timers.tsx` (createContext + useState + storage load/save on every mutation, `createContext<... | null>(null)`, a `useBakePlan` hook that throws if used outside the provider). Key: `doughmate.bakeplan.v1`. Use the same id scheme the timers store uses (`Date.now().toString() + '-' + a random suffix`) for `id`.

- [ ] **Step 1: Write `src/state/bakePlan.tsx`**

```tsx
// The active bake plan. At most one plan is armed at a time; arming replaces
// any prior plan. Steps are snapshotted at arm time so editing or deleting the
// recipe never corrupts a running plan.
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { buildSchedule } from '@/lib/schedule';
import { storage } from '@/lib/storage';

export interface PlanStepSnapshot {
  text: string;
  time?: string;
  durationMs: number;
  isCheckpoint: boolean;
  startAt: number;
}

export interface BakePlan {
  id: string;
  recipeId: string;
  recipeName: string;
  finishAt: number;
  startAt: number;
  steps: PlanStepSnapshot[];
  createdAt: number;
}

export interface ArmPlanInput {
  recipeId: string;
  recipeName: string;
  steps: { text: string; time?: string }[];
  finishAt: number;
}

const STORAGE_KEY = 'doughmate.bakeplan.v1';

function loadPlan(): BakePlan | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BakePlan | null; // JSON.parse('null') === null
  } catch {
    return null;
  }
}

// storage only exposes getItem/setItem (no removeItem), so a cleared plan is
// persisted as the JSON literal null, which loadPlan reads back as null.
function savePlan(plan: BakePlan | null): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

interface BakePlanContextValue {
  plan: BakePlan | null;
  armPlan: (input: ArmPlanInput) => BakePlan;
  cancelPlan: () => void;
}

const BakePlanContext = createContext<BakePlanContextValue | null>(null);

export function BakePlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<BakePlan | null>(() => loadPlan());

  const value = useMemo<BakePlanContextValue>(
    () => ({
      plan,
      armPlan: (input) => {
        const schedule = buildSchedule(input.steps, input.finishAt);
        const next: BakePlan = {
          id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          recipeId: input.recipeId,
          recipeName: input.recipeName,
          finishAt: input.finishAt,
          startAt: schedule.startAt,
          steps: schedule.steps.map((s) => ({
            text: s.text,
            time: s.time,
            durationMs: s.durationMs,
            isCheckpoint: s.isCheckpoint,
            startAt: s.startAt,
          })),
          createdAt: Date.now(),
        };
        setPlan(next);
        savePlan(next);
        return next;
      },
      cancelPlan: () => {
        setPlan(null);
        savePlan(null);
      },
    }),
    [plan]
  );

  return <BakePlanContext.Provider value={value}>{children}</BakePlanContext.Provider>;
}

export function useBakePlan(): BakePlanContextValue {
  const ctx = useContext(BakePlanContext);
  if (!ctx) {
    throw new Error('useBakePlan must be used within a BakePlanProvider');
  }
  return ctx;
}
```

Note: confirm `storage` exposes `removeItem` (check `src/lib/storage.ts`); if it only has `getItem`/`setItem`, add a hyphen free `removeItem` there additively, or `setItem(STORAGE_KEY, '')` and treat `''` as null in `loadPlan`. Prefer a real `removeItem` if the other stores use one.

- [ ] **Step 2: Wire the provider**

In `app/_layout.tsx`, add `import { BakePlanProvider } from '@/state/bakePlan';` and nest `BakePlanProvider` in the provider tree next to `TimersProvider` (inside it is fine; order does not matter as they are independent).

- [ ] **Step 3: Typecheck, lint, commit**

Run: `pnpm typecheck && pnpm lint`. Then:
```bash
git add src/state/bakePlan.tsx app/_layout.tsx src/lib/storage.ts
git commit -m "feat(scheduler): bake plan store and provider"
```

---

### Task 3: Bake plan notifications and reconciler

**Files:**
- Modify: `src/lib/notifications.ts` (add bake plan functions, separate map key)
- Create: `src/components/BakePlanSync.tsx`
- Modify: `app/_layout.tsx` (render `BakePlanSync` beside `TimerSync`)
- Modify: `src/i18n/en.json` (notification copy)

**Interfaces:**
- Consumes: `useBakePlan` from `src/state/bakePlan`; `planProgress` from `src/lib/schedule`; the existing notifications helpers.
- Produces (in `notifications.ts`): `scheduleBakePlanNotification(id: string, title: string, body: string, fireAt: number): Promise<void>`, `cancelBakePlanNotification(id: string): Promise<void>`, `cancelAllBakePlanNotifications(): Promise<void>`.

- [ ] **Step 1: Add bake plan notification functions**

In `src/lib/notifications.ts`, after the timer notification block, add a third separately keyed map exactly mirroring the timer functions (they are the template — copy their structure, swapping the key and names):

```ts
// Bake plan step reminders. Separate map key so they never collide with feed
// reminders or timer notifications.
const BAKEPLAN_MAP_KEY = 'doughmate.notif.bakeplan.v1';

function loadBakePlanMap(): IdMap {
  try {
    return JSON.parse(storage.getItem(BAKEPLAN_MAP_KEY) ?? '{}') as IdMap;
  } catch {
    return {};
  }
}

function saveBakePlanMap(map: IdMap): void {
  storage.setItem(BAKEPLAN_MAP_KEY, JSON.stringify(map));
}

export async function cancelBakePlanNotification(id: string): Promise<void> {
  if (!isNative) return;
  const map = loadBakePlanMap();
  const notificationId = map[id];
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    delete map[id];
    saveBakePlanMap(map);
  }
}

export async function scheduleBakePlanNotification(
  id: string,
  title: string,
  body: string,
  fireAt: number
): Promise<void> {
  if (!isNative) return;
  await cancelBakePlanNotification(id);
  if (fireAt <= Date.now()) return;
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(fireAt) },
  });
  const map = loadBakePlanMap();
  map[id] = notificationId;
  saveBakePlanMap(map);
}

export async function cancelAllBakePlanNotifications(): Promise<void> {
  if (!isNative) return;
  for (const id of Object.keys(loadBakePlanMap())) {
    await cancelBakePlanNotification(id);
  }
}
```

- [ ] **Step 2: Create `src/components/BakePlanSync.tsx`**

Mirror `src/components/TimerSync.tsx`: read the store, reconcile on change, render null, web guarded. Reconcile = cancel all, then schedule one notification per plan step whose `startAt` is in the future, keyed `plan.id + ':' + index`.

```tsx
// Keeps scheduled bake plan reminders in sync with the active plan. One
// notification per future step start. Native only; renders nothing.
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { cancelAllBakePlanNotifications, scheduleBakePlanNotification } from '@/lib/notifications';
import { useBakePlan } from '@/state/bakePlan';

export function BakePlanSync() {
  const { plan } = useBakePlan();
  const { t } = useTranslation();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;
    (async () => {
      await cancelAllBakePlanNotifications();
      if (cancelled || !plan) return;
      const now = Date.now();
      for (const step of plan.steps) {
        if (step.startAt > now) {
          await scheduleBakePlanNotification(
            `${plan.id}:${plan.steps.indexOf(step)}`,
            t('bakePlan.notif_title', { step: step.text }),
            t('bakePlan.notif_body', { recipe: plan.recipeName }),
            step.startAt
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plan, t]);

  return null;
}
```

Use a stable key: prefer `for (let i = 0; i < plan.steps.length; i++)` with `i` as the index rather than `indexOf` (duplicate step texts would collide with `indexOf`). Rewrite the loop with an explicit index.

- [ ] **Step 3: Render `BakePlanSync`**

In `app/_layout.tsx`, render `<BakePlanSync />` right next to `<TimerSync />` (inside `BakePlanProvider`).

- [ ] **Step 4: Add i18n copy**

In `src/i18n/en.json`, add a `bakePlan` block (start it here; later tasks extend it):
```json
"bakePlan": {
  "notif_title": "Time to {{step}}",
  "notif_body": "{{recipe}} is on schedule"
}
```
Verify no hyphens or dashes.

- [ ] **Step 5: Typecheck, lint, commit**

Run: `pnpm typecheck && pnpm lint`. Then:
```bash
git add src/lib/notifications.ts src/components/BakePlanSync.tsx app/_layout.tsx src/i18n/en.json
git commit -m "feat(scheduler): schedule and reconcile bake plan step reminders"
```

---

### Task 4: ScheduleTimeline and BakePlanCard components

**Files:**
- Create: `src/ui/ScheduleTimeline.tsx`
- Create: `src/ui/BakePlanCard.tsx`
- Modify: `src/i18n/en.json`

**Interfaces:**
- Consumes: `ScheduleStep` from `src/lib/schedule`; `formatClock`, `formatDayLabel`, `planProgress` from `src/lib/schedule`; `BakePlan` from `src/state/bakePlan`; `useAppTheme`, theme tokens, `useNow`.
- Produces:
  - `ScheduleTimeline` props: `{ steps: ScheduleStep[]; finishAt: number; currentIndex?: number | null; nextIndex?: number | null }`. Renders the rail (teal dot for timed, hollow dot for checkpoint), a start time column (`formatClock`), the step text, a teal duration pill for timed steps (`step.time`), a `checkpoint` caption for zero length, and a final `accentButter` node row labeled `bakePlan.ready_to_enjoy` at `formatClock(finishAt)`. When `currentIndex`/`nextIndex` are provided, emphasize the next step row (teal wash background).
  - `BakePlanCard` props: `{ plan: BakePlan; onCancel: () => void; onPress: () => void }`. A teal bordered card: recipe name, `bakePlan.ready_at` with `formatDayLabel(finishAt,now) + ' ' + formatClock(finishAt)`, a Cancel control, a "Next up" chip (from `planProgress` over `plan.steps`) showing the next step text + `formatClock(step.startAt)` (or a done state when `progress.done`), and a compact one line step strip.

- [ ] **Step 1: Build `ScheduleTimeline.tsx`**

Match the approved mockup: a `View` per step with a left rail column (a `View` dot + a connecting line), a fixed width start time `Text` (`typography.numeric`/`Space Grotesk`, `palette.textInk`, faint for checkpoints), the step text, and a duration pill (`proofTealWash` bg, `proofTealText`) for timed steps or a `checkpoint` caption (`palette.textFaint`) for checkpoints. End with a finish row using an `accentButter` dot and `bakePlan.ready_to_enjoy` in `proofTealText`/primary. All spacing/radii from tokens. No hardcoded colors.

- [ ] **Step 2: Build `BakePlanCard.tsx`**

Match the approved Frame A card. Use `useNow(60_000)` to recompute `planProgress(plan.steps, plan.finishAt, now)` so "Next up" stays current. When `progress.done`, show a done label instead of a next chip. Cancel is a quiet danger control; the whole card (or a chevron area) calls `onPress`.

- [ ] **Step 3: Add i18n copy**

Extend the `bakePlan` block:
```json
"ready_to_enjoy": "Ready to enjoy",
"checkpoint": "checkpoint",
"next_up": "Next up",
"ready_at": "Ready {{when}}",
"cancel": "Cancel",
"done": "All done"
```
No hyphens or dashes.

- [ ] **Step 4: Typecheck, lint, commit**

Run: `pnpm typecheck && pnpm lint` (run `pnpm prettier --write` on the two files if lint flags wrap length). Then:
```bash
git add src/ui/ScheduleTimeline.tsx src/ui/BakePlanCard.tsx src/i18n/en.json
git commit -m "feat(scheduler): schedule timeline and bake plan card"
```

---

### Task 5: The Plan a bake sheet

**Files:**
- Create: `app/bake-plan.tsx`
- Modify: `app/_layout.tsx` (register the `bake-plan` modal route, mirroring how `timers` is registered)
- Modify: `src/ui/Stepper.tsx` (additive: optional `max` and `wrap` props)
- Modify: `src/i18n/en.json`

**Interfaces:**
- Consumes: `useLocalSearchParams`/`router` (expo-router); `useRecipes` (`getRecipe`); `useBakePlan`; `buildSchedule`, `isFeasible`, `earliestFinish`, `composeFinishAt`, `formatClock`, `formatDayLabel` from schedule lib; `formatRemaining` from `src/lib/timer` (for the "needs X" total); `ScheduleTimeline`; `BottomSheet`, `Button`, `SegmentedControl`, `Stepper`, `Chip`; `ensureNotificationPermission`; `useNow`.
- Route: `bake-plan` accepts `recipeId` param.

- [ ] **Step 1: Extend `Stepper` (additive)**

Add optional `max?: number` and `wrap?: boolean` to `StepperProps`. Update the increment/decrement: with `wrap`, `+` past `max` returns to `min` and `-` below `min` returns to `max`; without `wrap`, clamp to `[min, max ?? Infinity]`. Existing callers pass neither, so behavior is unchanged (default `max` unbounded, no wrap). Keep the visual identical.

- [ ] **Step 2: Build `app/bake-plan.tsx`**

A `BottomSheet` (tall). Read `recipe = getRecipe(recipeId)`; if absent, render a short empty state. Local state: `dayOffset` (0..3), `hour12` (1..12), `minute` (0..55 step 5), `meridiem` ('AM'|'PM'). Default to the next morning 8:00 AM: `dayOffset` = 1, `hour12` = 8, `minute` = 0, `meridiem` = 'AM'.

- `useNow(60_000)` provides `now`. `finishAt = composeFinishAt(now, dayOffset, hour12, minute, meridiem)`.
- **Ready by** section: four day chips built from `now` (`formatDayLabel(dayStart, now)` + `new Date(dayStart).getDate()`, where `dayStart = composeFinishAt(now, k, 12, 0, 'AM')` for k in 0..3), selected chip in teal; an hour `Stepper` (min 1, max 12, wrap), a minute `Stepper` (min 0, max 55, step 5, wrap), and an AM/PM `SegmentedControl`.
- **Existing armed plan for THIS recipe** (`plan?.recipeId === recipe.id`): show the armed presentation — `ScheduleTimeline` over `plan.steps` with `planProgress` emphasis, the ready line, and a Cancel button (`cancelPlan`). Skip the picker/arm.
- **Feasible target** (`isFeasible(recipe.steps, finishAt, now)`): a "Start baking" hero (`formatDayLabel(schedule.startAt, now) + ' ' + formatClock(schedule.startAt)` from `buildSchedule`), the `ScheduleTimeline`, and an "Arm this plan" `Button` that calls `ensureNotificationPermission()` then `armPlan({ recipeId, recipeName: recipe.name, steps: recipe.steps, finishAt })` and closes.
- **Infeasible target**: the warning block — `bakePlan.not_enough_body` with `total = formatRemaining(totalActiveMs)`, `target = formatClock(finishAt)`, `start = formatClock(finishAt - total)`; `bakePlan.earliest` with `formatDayLabel(earliest,now) + ' ' + formatClock(earliest)` where `earliest = earliestFinish(recipe.steps, now)`; and a "Use earliest time" control that sets the pickers from `earliest` (derive dayOffset/hour/minute/meridiem back from the timestamp). Arm is hidden.

- [ ] **Step 3: Register the route**

In `app/_layout.tsx`, add the `bake-plan` screen to the `Stack` with the same transparent modal presentation options used for `timers`.

- [ ] **Step 4: Add i18n copy**

Extend `bakePlan`:
```json
"title": "Plan a bake",
"ready_by": "Ready by",
"your_schedule": "Your schedule",
"start_baking": "Start baking",
"arm": "Arm this plan",
"arm_hint": "Reminds you at each step start. Cancel anytime.",
"today": "Today",
"tomorrow": "Tomorrow",
"hours": "Hours",
"minutes": "Minutes",
"am": "AM",
"pm": "PM",
"not_enough_time": "Not enough time",
"not_enough_body": "This bake needs {{total}}. To be ready by {{target}} you would have started at {{start}}, which has passed.",
"earliest": "Earliest you can be ready is {{when}}.",
"use_earliest": "Use earliest time",
"empty": "This recipe has no steps to schedule."
```
No hyphens or dashes anywhere.

- [ ] **Step 5: Typecheck, lint, commit**

Run: `pnpm typecheck && pnpm lint` (prettier write if needed). Then:
```bash
git add app/bake-plan.tsx app/_layout.tsx src/ui/Stepper.tsx src/i18n/en.json
git commit -m "feat(scheduler): plan a bake sheet with day chips, time steppers, arm and too late states"
```

---

### Task 6: Entry points — recipe detail, Timers sheet, pill

**Files:**
- Modify: `app/recipe/[id].tsx` (add "Plan a bake" action)
- Modify: `app/timers.tsx` (add a "Bake plan" section)
- Modify: `src/ui/TimerPill.tsx` (show the plan's next step when armed and no timer runs)
- Modify: `src/i18n/en.json`

**Interfaces:**
- Consumes: `useBakePlan`, `BakePlanCard`, `planProgress`, `formatClock`, `parseDuration` (already imported in detail), `useTimers`, `useNow`, `router`.

- [ ] **Step 1: Recipe detail action**

In `app/recipe/[id].tsx`, near Start baking and Log a bake, add a "Plan a bake" `Button`/action that routes to `/bake-plan?recipeId=${recipe.id}`. Show it only when the recipe has at least one parseable step time: `recipe.steps.some((s) => s.time && parseDuration(s.time) !== null)`. Do not disturb existing actions or the start step timers from the timers feature.

- [ ] **Step 2: Timers sheet section**

In `app/timers.tsx`, read `plan = useBakePlan().plan`. When `plan` is set, render a "Bake plan" labeled section with `<BakePlanCard plan={plan} onCancel={cancelPlan} onPress={() => router.push('/bake-plan?recipeId=' + plan.recipeId)} />` above the Running list. Leave the running list and custom timer untouched.

- [ ] **Step 3: Extend `TimerPill`**

Currently the pill renders when timers exist. Extend: read `plan` from `useBakePlan` and `now` from `useNow`. If any timer is running/present, keep the existing timer pill exactly. Else if `plan` is set and `!planProgress(plan.steps, plan.finishAt, now).done`, render a plan pill: the next step label (`bakePlan.pill_next` with the `planProgress().nextIndex` step text, or the current step if none upcoming) and `bakePlan.pill_starts` with `formatClock(nextStep.startAt)`; press routes to `/timers`. Render null only when there are no timers AND no active (not done) plan. Do not change the timer branch behavior or the pill position.

- [ ] **Step 4: Add i18n copy**

Extend `bakePlan`:
```json
"section": "Bake plan",
"pill_next": "{{step}} next",
"pill_starts": "starts {{when}}"
```
No hyphens or dashes.

- [ ] **Step 5: Typecheck, lint, commit**

Run: `pnpm typecheck && pnpm lint`. Then:
```bash
git add app/recipe/[id].tsx app/timers.tsx src/ui/TimerPill.tsx src/i18n/en.json
git commit -m "feat(scheduler): plan a bake entry point, timers sheet section, pill next step"
```

---

### Task 7: Verification sweep

**Files:** none expected (verify; fix forward if needed).

- [ ] **Step 1: Full gate**

Run from `app-src/`: `pnpm typecheck && pnpm lint && pnpm test:coverage`. Expected: clean; all suites pass; `src/lib` at 100% including `schedule.ts`.

- [ ] **Step 2: Functional walk (browser — controller runs this; exclude from subagent)**

Plan a bake from a recipe with timed steps: day chips + time steppers set a target; the schedule computes backward with a Start baking hero and per step start times; checkpoints show no duration pill; arming shows the Bake plan card atop the Timers sheet and the next step in the pill; cancel clears it; an unreachable target shows the not enough time warning with an earliest time and hides Arm; "Use earliest time" makes it feasible. A recipe with no timed steps shows no "Plan a bake" action.

- [ ] **Step 3: Hyphen and dash audit**

Scan every string value in `src/i18n/en.json` for hyphen, en dash, em dash, minus sign, figure dash. Expected: none.

- [ ] **Step 4: Accessibility modes**

With the planner, the plan card, and the pill visible: light and dark, normal and floured fingers, reduced motion. No clipped content; tap targets large (day chips, steppers, AM/PM); tokens honored; the pill does not overlap the tab bar; glyph only controls carry `accessibilityLabel`.

- [ ] **Step 5: Final commit if fixes were made**

```bash
git add -A
git commit -m "chore(scheduler): verification fixes"
```
(Skip if no changes.)

---

## Self-Review

**Spec coverage:**
- Backward schedule, start time, per step times → Task 1 (`buildSchedule`), Task 4/5 (timeline, sheet).
- Feasibility and earliest ready → Task 1 (`isFeasible`/`earliestFinish`), Task 5 (warning).
- Zero length checkpoints → Task 1 (`isCheckpoint`), Task 4 (rendering).
- Armed plan persists, one at a time, snapshot → Task 2 (store).
- Native reminder per step start, reconciled, separate key, web no op → Task 3.
- Launch from recipe detail; plan reachable globally → Task 6 (action, Timers section, pill).
- Day chips + hour/minute steppers + AM/PM; next morning default → Task 5.
- Folds into existing pill + Timers sheet, timers keep priority → Task 6.
- "Next up" derived, done derived → Task 1 (`planProgress`), Task 4/6.
- Clock/day formatting hyphen free → Task 1 (`formatClock`/`formatDayLabel`).
- 100% pure coverage, registered → Task 1.
- House rules (copy, tokens, dark/reduced/floured, additive) → Global Constraints + each task.

**Placeholder scan:** Task 1 carries full code and tests. Stores/notifications carry concrete code mirroring named existing files (`timers.tsx`, `TimerSync.tsx`, the timer notification block). UI tasks carry precise structure against named existing primitives (`BottomSheet`, `Stepper`, `SegmentedControl`, `Chip`, `Button`, `ScheduleTimeline`, `BakePlanCard`) and the approved mockups. No TBD/TODO.

**Type consistency:** `StepInput`/`Schedule`/`ScheduleStep`/`PlanProgress` defined in Task 1, consumed in Tasks 2, 4, 5, 6. `BakePlan`/`PlanStepSnapshot`/`ArmPlanInput`/`useBakePlan` defined in Task 2, consumed in Tasks 3, 4, 5, 6. Bake plan notification functions defined in Task 3, consumed by `BakePlanSync`. `bakePlan.*` i18n keys introduced across Tasks 3 to 6, each added before use. `Stepper` `max`/`wrap` added in Task 5 before its only consumer uses them.
