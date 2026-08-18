// Pure timer logic. Parse a free text step time to milliseconds, compute the
// remaining time and done state, and format a compact remaining label.
const MIN_MS = 60_000;
const HOUR_MS = 3_600_000;

/** Parse "30 min", "4 hr", "1 hr 20 min", "1h", "90m", or a lone number as
 *  minutes ("20" -> 20 min) to ms. Null if nothing parses. */
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
  if (found) {
    return Math.round(ms);
  }
  // A lone number with no unit reads as minutes, the way a baker would jot "20".
  const bare = /^\s*(\d+(?:\.\d+)?)\s*$/.exec(lower);
  if (bare) {
    return Math.round(Number(bare[1]) * MIN_MS);
  }
  return null;
}

/** Display a step time, adding "min" to a lone number so "20" reads as "20 min". */
export function formatStepTime(time: string): string {
  const trimmed = time.trim();
  return /^\d+(?:\.\d+)?$/.test(trimmed) ? `${trimmed} min` : trimmed;
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

/**
 * Timers still occupying a slot. A finished timer sits in the list until it is
 * dismissed, but it has stopped doing anything, so it does not hold the free
 * tier's slot against the next bake.
 */
export function activeTimerCount(timers: TimerLike[], now: number): number {
  return timers.filter((timer) => !isTimerDone(timer, now)).length;
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
