# Live Fermentation Timers — Design

Date: 2026-08-12
Branch: `redesign/proof`
Status: Approved for planning

## Problem

Recipe step times are display only. There is no way to actually time a bulk ferment, a proof, or a bake, and the long waits are exactly where bakers need a nudge. Competitive research flagged live (and later temperature aware) timers as a category differentiator. This pass delivers real, running, notifying timers.

## Goals

- Start a countdown timer from a recipe step's stated time, or as a custom duration.
- Timers run, persist across app close, and can be paused, resumed, and cancelled.
- A native local notification fires when a timer finishes.
- A floating pill keeps running timers visible across the app; a Timers sheet manages them all.

## Non goals (this pass)

- No temperature based adjustment of durations; that is a focused fast follow.
- No background process to flip a finished timer's state; "done" is derived from the clock.
- Web does not fire OS notifications (expo notifications is native only). The countdown UI still works everywhere; the OS alert only lands on a device.

## Design decisions (all user approved)

- A floating "active timers" pill above the tab bar, visible on every tab whenever a timer is running, showing the soonest to finish plus a count, tapping to the Timers sheet.
- A Timers sheet listing running timers (teal ring, remaining, pause and cancel, a Done state to dismiss) and a custom timer.
- Start a timer by tapping a step's time, on the recipe detail and in cook mode.
- The custom timer uses full width Hours and Minutes steppers with 52px round buttons (minutes step by 5), a live preview, and a few quick pick chips.
- "Done" is derived (running and `now >= endsAt`); no background job.
- Pause holds the remaining time and cancels the notification until resume.

## Data model (new, self contained)

A new store `src/state/timers.tsx`, key `doughmate.timers.v1`, independent of other stores.

```ts
interface Timer {
  id: string;
  label: string;         // from the step text, or a custom label
  recipeId?: string;     // set when started from a recipe step
  stepLabel?: string;    // context, e.g. "step 3"
  durationMs: number;
  status: 'running' | 'paused';
  endsAt?: number;       // set while running (resume time + remaining)
  remainingMs?: number;  // held while paused
  createdAt: number;
}
```

- Store methods: `timers`, `startTimer(input)`, `pauseTimer(id)`, `resumeTimer(id)`, `cancelTimer(id)`, `getTimer(id)`. `startTimer` sets `status: 'running'`, `endsAt: Date.now() + durationMs`.
- `pauseTimer` computes and stores `remainingMs = max(0, endsAt - now)`, sets `status: 'paused'`, clears `endsAt`.
- `resumeTimer` sets `endsAt = now + remainingMs`, `status: 'running'`, clears `remainingMs`.
- `cancelTimer` removes the timer (used both for cancel and for dismissing a finished one).
- Sorted for display by soonest to finish (running by `endsAt` ascending, paused after).

## Pure logic (tested to 100%, `src/lib/timer.ts`)

- `parseDuration(text: string): number | null` — free text step time to milliseconds. Handles "30 min", "45 minutes", "4 hr", "2 hours", "1 hr 20 min", "1h", "90m", and returns null when nothing parses (that step shows no Start timer button).
- `timerRemainingMs(timer, now): number` — running: `max(0, endsAt - now)`; paused: `remainingMs ?? 0`.
- `isTimerDone(timer, now): boolean` — `status === 'running' && now >= endsAt`.
- `formatRemaining(ms: number): string` — a compact label: hours and minutes when over an hour ("3h 41m"), minutes and seconds under an hour ("12:04"), "0:00" at zero. No hyphens or dashes.

All registered in `jest.config.js` `collectCoverageFrom`.

## Notifications

Extend `src/lib/notifications.ts` (native only, web no op) with generic per timer functions that mirror the existing feed reminder pattern: `scheduleTimerNotification(id, title, body, fireAt)` and `cancelTimerNotification(id)`, tracking notification ids in a map (separate key from feed reminders). A `TimerSync` component (mirroring `ReminderSync`) reconciles: for each running timer with `endsAt` in the future, ensure a notification is scheduled at `endsAt`; for paused, removed, or already finished timers, cancel theirs. `TimerSync` renders nothing and is added to the tree. The store stays pure state; notifications are a reconciled side effect.

## Ticking

A small `useNow(intervalMs = 1000)` hook returns the current time, updating on an interval, so the pill and the Timers sheet recompute remaining each second. Cleared on unmount; under reduced motion the interval still runs (it is a clock, not an animation).

## Screens and components

- `src/ui/TimerPill.tsx` (or rendered in the tabs layout): the floating pill. Reads the timers store and `useNow`. Renders only when at least one timer exists; shows the soonest to finish timer's label and remaining, a `+N` when more, and opens `/timers` on press. A finished timer shows a Done style until dismissed. Placed in `app/(tabs)/_layout.tsx` above the `AppTabBar`.
- `app/timers.tsx`: the Timers sheet (transparent modal). A running list of timer cards and the custom timer. Registered in `app/_layout.tsx`.
- `src/ui/TimerCard.tsx`: one running or finished timer, with the teal progress ring, `formatRemaining`, pause or resume, and cancel or dismiss.
- Start from a step: `app/recipe/[id].tsx` and `app/recipe/[id]/cook.tsx` render, for each step whose `time` parses, a quiet "Start {time} timer" control that calls `startTimer` with `label` from the step text (trimmed and truncated), `recipeId`, `stepLabel`, and the parsed `durationMs`.
- `TimersProvider` added to the provider tree in `app/_layout.tsx`; `TimerSync` rendered alongside `ReminderSync`.

## Custom timer

Hours `Stepper` (min 0) and Minutes `Stepper` (min 0, step 5) reusing the existing `src/ui/Stepper.tsx`, a live `formatRemaining` preview, quick pick chips (for example 15m, 30m, 1h, 4h) that set the duration, an optional label `Input`, and a Start button that calls `startTimer` and clears the form. Start is disabled when the duration is zero.

## Edge cases

- A step time that does not parse: no Start timer button on that step.
- A finished running timer: reads as Done via `isTimerDone`; the notification already fired (native); dismiss removes it.
- App reopened after a timer's end passed while closed: it reads as Done immediately (derived), and the OS notification will have fired on a device.
- Pausing a nearly finished timer holds its small remaining and cancels the pending notification.
- Multiple concurrent timers are supported; the pill shows the soonest and a count.
- Deleting a recipe does not touch its timers; a timer keeps its label text (the `recipeId` link just may not resolve).

## Constraints (house rules)

- No hyphens or dashes in any user facing copy.
- All strings via i18n; colors, spacing, radii from theme tokens only. Fermentation timers use the teal accent.
- No back buttons; the Timers sheet is a dismissible bottom sheet.
- Dark mode, reduced motion, floured fingers hold on every new surface.
- Additive and self contained: a new timers store and screens, plus additive timer functions in the notifications lib and the entry point buttons on recipe detail and cook mode. Other stores, engines, storage keys, monetization, and the existing feed reminder behavior are untouched.
- Pure logic at 100% coverage, registered in `jest.config.js`.
