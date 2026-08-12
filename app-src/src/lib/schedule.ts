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
