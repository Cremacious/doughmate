# Finish by Scheduler — Design

Date: 2026-08-12
Branch: `redesign/proof`
Status: Approved for planning

## Problem

Recipe step times tell you how long each stage takes, and live timers count a
single stage down, but nothing answers the question a baker actually asks:
"I want warm bread at 8 in the morning, so when do I start?" Sourdough is a
chain of long waits that usually crosses overnight, and doing that arithmetic
by hand is exactly the friction a baking companion should remove. Competitive
research flagged a "finish by" backward scheduler as a differentiator. This
pass delivers a real, armed plan that computes the start time and reminds you
at each step.

## Goals

- From a recipe, pick a "ready by" day and time and see a schedule computed
  backward from that target: a start time and every step's start time.
- Arm the plan so a native local reminder fires at each step's start.
- The armed plan persists across app close, shows "next up", and can be
  cancelled from anywhere.
- When the target is not achievable, explain why and offer the earliest
  achievable ready time.

## Non goals (this pass)

- No temperature adjustment of durations (that is the timers fast follow, not
  this feature).
- No auto starting of live timers at each boundary. The plan fires reminders;
  starting a live countdown for a stage stays the timers feature's job (you can
  still tap a step to start its timer).
- One active plan at a time. Arming a new plan replaces the current one. Multi
  plan is out of scope.
- No background recomputation. "Next up" and "done" are derived from the clock,
  like timers.

## Design decisions (all user approved)

- Launch from a "Plan a bake" action on recipe detail (sibling to Start baking
  and Log a bake). The active plan is then reachable globally.
- "Ready by" is chosen with day chips (Today, Tomorrow, and the next days) plus
  an hour and minute stepper and an AM/PM toggle. No new dependency; matches the
  app's existing stepper language.
- Untimed steps (mix, shape, score) are zero length checkpoints: they take 0 ms
  in the chain and are scheduled at the same instant as the following timed
  step. The plan is driven purely by the step times already written.
- The schedule shows a "Start baking" hero, then a vertical timeline: each step
  with its start time, a teal dot for timed steps, a hollow dot for checkpoints,
  and a gold "Ready to enjoy" node at the target.
- The armed plan folds into the existing floating pill and Timers sheet rather
  than adding a second floating element. A "Bake plan" card tops the Timers
  sheet (ready time, Next up, Cancel, a mini step strip). The one pill shows the
  next step's start when a plan is armed and no timer is running; running timers
  keep priority.
- If the target is not reachable, the schedule area becomes a gentle warning:
  total time needed, why it does not fit, the earliest achievable ready time,
  and a one tap "Use earliest time". Arm is hidden until the target is feasible.

## Pure logic (tested to 100%, `src/lib/schedule.ts`)

Consumes `RecipeStep` (`{ text: string; time?: string }`) and `parseDuration`
from `src/lib/timer.ts`.

```ts
export interface ScheduleStep {
  index: number;        // position in the recipe's steps
  text: string;
  time?: string;        // the original free text, when present
  durationMs: number;   // parseDuration(time) or 0 for a checkpoint
  isCheckpoint: boolean; // true when durationMs === 0
  startAt: number;      // absolute ms timestamp this step begins
}

export interface Schedule {
  startAt: number;      // when the whole bake begins
  finishAt: number;     // the target ready time (echoed back)
  totalMs: number;      // sum of all step durations
  steps: ScheduleStep[];
}

/** Sum of parseable step durations (checkpoints contribute 0). */
export function totalActiveMs(steps: RecipeStep[]): number;

/** Build the backward schedule for a finish target. startAt = finishAt - totalMs;
 *  each step's startAt is the running cursor from startAt forward. */
export function buildSchedule(steps: RecipeStep[], finishAt: number): Schedule;

/** True when the bake can still finish by finishAt given now (startAt >= now). */
export function isFeasible(steps: RecipeStep[], finishAt: number, now: number): boolean;

/** The earliest reachable ready time from now: now + totalActiveMs(steps). */
export function earliestFinish(steps: RecipeStep[], now: number): number;
```

Plan progress, also pure:

```ts
export interface PlanProgressStep { startAt: number }

export interface PlanProgress {
  currentIndex: number | null; // last step whose startAt <= now, or null before start
  nextIndex: number | null;    // first step whose startAt > now, or null when done
  done: boolean;               // now >= finishAt
}

/** Derive current/next/done from a plan's step start times and the finish. */
export function planProgress(
  steps: PlanProgressStep[],
  finishAt: number,
  now: number
): PlanProgress;
```

Registered in `jest.config.js` `collectCoverageFrom`. Edge cases covered:
no timed steps (totalMs 0, schedule collapses to finishAt), a single step,
checkpoints at the head and tail, now exactly on a boundary, finish already
passed.

## Time selection helper (pure, in `src/lib/schedule.ts`)

Day chips plus hour/minute/meridiem need to resolve to a timestamp without
pulling a date library. It lives in `src/lib/schedule.ts` alongside the rest of
the scheduler logic.

```ts
/** Compose a target timestamp from a day offset (0 = today) and a wall clock
 *  time, relative to `now`. Minutes are clamped to the 0..55 step-5 range by
 *  the caller. */
export function composeFinishAt(
  now: number,
  dayOffset: number,
  hour12: number,   // 1..12
  minute: number,   // 0..59
  meridiem: 'AM' | 'PM'
): number;
```

Tested to 100%: midnight and noon (12 AM, 12 PM) conversion, day offset
crossing month end, minute rounding.

## Data model (new, self contained)

A new store `src/state/bakePlan.tsx`, key `doughmate.bakeplan.v1`, independent
of other stores. Holds at most one active plan.

```ts
interface PlanStepSnapshot {
  text: string;
  time?: string;
  durationMs: number;
  isCheckpoint: boolean;
  startAt: number;
}

interface BakePlan {
  id: string;
  recipeId: string;
  recipeName: string;   // snapshot, so editing or deleting the recipe is safe
  finishAt: number;
  startAt: number;
  steps: PlanStepSnapshot[];
  createdAt: number;
}
```

- Store surface: `plan` (the active `BakePlan` or `null`), `armPlan(input)`
  (compute from a recipe + finishAt, snapshot the steps, replace any existing
  plan), `cancelPlan()` (clear it).
- The steps are snapshotted at arm time (like the bake journal snapshots
  `recipeName`) so a later recipe edit or delete never corrupts an armed plan.
- Only one plan; `armPlan` overwrites. Persisted to storage on every change.

## Notifications

Extend `src/lib/notifications.ts` (native only, web no op) with a third,
separately keyed map so bake plan reminders never collide with feed reminders
or timer notifications:

```ts
const BAKEPLAN_MAP_KEY = 'doughmate.notif.bakeplan.v1';
export async function scheduleBakePlanNotification(id, title, body, fireAt): Promise<void>;
export async function cancelBakePlanNotification(id): Promise<void>;
export async function cancelAllBakePlanNotifications(): Promise<void>;
```

These mirror the timer notification functions exactly (DATE trigger, self
cancel before reschedule, skip a fire time already in the past). A
`BakePlanSync` component (mirroring `TimerSync` and `ReminderSync`) reconciles:
when a plan is armed, schedule one notification per step whose `startAt` is in
the future, keyed `plan.id + ':' + stepIndex`; when the plan is cancelled or
absent, cancel all bake plan notifications. It renders nothing, is web guarded,
and is added to the provider tree beside `TimerSync`. The store stays pure
state; notifications are the reconciled side effect. Each step start fires
"Time to {step}" / "{recipe} is on schedule".

## Ticking

Reuse the existing `useNow(intervalMs)` hook so the planner preview, the plan
card, and the pill recompute "next up" and feasibility each minute (a
`60_000` interval is enough for a schedule; the second by second `useNow` stays
the timers' concern).

## Screens and components

- `app/bake-plan.tsx` (new, transparent modal bottom sheet, registered in
  `app/_layout.tsx`): the "Plan a bake" sheet. Params: `recipeId`. Two states:
  - Not yet armed for this recipe: day chips + hour/minute steppers + AM/PM
    toggle; below, the computed schedule (via `buildSchedule`) as a
    `ScheduleTimeline`, a "Start baking" hero, and an "Arm this plan" button.
    When `isFeasible` is false, the schedule area is replaced by the warning
    block (total needed, earliest ready via `earliestFinish`, "Use earliest
    time" which sets the pickers to the earliest) and Arm is hidden.
  - Already armed (a plan exists for this recipe): the same timeline in a read
    only "armed" presentation with the ready time, "next up", and a Cancel
    action.
- `src/ui/ScheduleTimeline.tsx` (new): renders the timeline rows (dot/line
  rail, start time column, step text, a teal duration pill for timed steps, a
  "checkpoint" caption for zero length steps, the gold finish node). Reused by
  the planner sheet and, in compact form, the plan card. Highlights the
  current/next step from `planProgress` when a plan is armed.
- `src/ui/BakePlanCard.tsx` (new): the "Bake plan" card for the Timers sheet
  (recipe name, ready time, a Next up chip with the next step and its start
  time, Cancel, and a compact one line step strip). Tapping opens
  `app/bake-plan.tsx` for that recipe.
- `app/timers.tsx` (modify, additive): when `useBakePlan().plan` is set, render
  a "Bake plan" section with `BakePlanCard` above the Running list. The running
  timers list and custom timer are unchanged.
- `src/ui/TimerPill.tsx` (modify, additive): the pill already shows when timers
  exist. Extend so it also shows when a plan is armed: if any timer is running,
  keep the current timer behavior; else if a plan is armed and not done, show
  the next step label and "starts {time}". Tap still routes to `/timers`. Null
  only when there are no timers and no armed plan.
- `app/recipe/[id].tsx` (modify, additive): add a "Plan a bake" action near
  Start baking and Log a bake. It is shown when the recipe has at least one
  parseable step time (otherwise a backward schedule is meaningless); it routes
  to `app/bake-plan.tsx?recipeId=...`.
- `BakePlanProvider` added to the provider tree in `app/_layout.tsx`;
  `BakePlanSync` rendered beside `TimerSync`.

## Custom time picker

Four day chips (Today, Tomorrow, and the two days after, each showing the
weekday and date) drive `dayOffset` (0..3). An hour `Stepper` (1..12, wrapping), a
minute `Stepper` (0..55, step 5, wrapping), and an AM/PM `SegmentedControl`
(reused from the bake journal) drive the wall clock time. `composeFinishAt`
turns the selection into `finishAt`. Defaults to the next morning at 8:00 AM
(a sensible sourdough target) when the sheet opens.

## Edge cases

- No timed steps in the recipe: the "Plan a bake" action does not appear; a
  schedule would be all zero length.
- Target not reachable: `isFeasible` false, warning shown, Arm hidden, earliest
  offered.
- App reopened after some step starts have passed: `planProgress` derives the
  current and next step from the clock; already passed reminders will have
  fired on a device; the plan reads correctly without any background work.
- Recipe edited or deleted after arming: the plan uses its snapshot, so it keeps
  working; the `recipeId` link may simply not resolve when tapping through.
- A plan whose finish time has fully passed reads as done (`planProgress.done`);
  its card offers Cancel to clear it. (No auto clear this pass.)
- Arming a new plan while one exists replaces it (and its notifications are
  reconciled away by `BakePlanSync`).
- Permissions: reuse `ensureNotificationPermission` before arming, matching the
  feed reminder and timer flows.

## Constraints (house rules)

- No hyphens or dashes in any user facing copy.
- All strings via i18n; colors, spacing, radii from theme tokens only. The
  scheduler uses the teal fermentation accent; the finish node uses the butter
  accent; the not enough time warning uses the danger token.
- No back buttons; the planner is a dismissible bottom sheet.
- Dark mode, reduced motion, floured fingers hold on every new surface.
- Additive and self contained: a new schedule lib, a new bake plan store, new
  screens and components, additive bake plan notification functions, and
  documented additive extensions to `TimerPill` and `app/timers.tsx`. Other
  stores, engines, storage keys, monetization, the feed reminder behavior, and
  the live timer behavior are untouched.
- Pure logic (`src/lib/schedule.ts` and any clock helper) at 100% coverage,
  registered in `jest.config.js`.
