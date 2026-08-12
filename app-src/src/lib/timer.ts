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
