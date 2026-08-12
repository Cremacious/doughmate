// Starter feed timing. Pure: given a starter and the current time, work out how
// far through the feed interval it is, whether a feed is due, and the remaining
// or overdue amount. The countdown and the progress ring both read from this.
const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;

export interface FeedStatus {
  /** True when the starter has never been fed. */
  fresh: boolean;
  /** True when the interval has elapsed and a feed is due. */
  due: boolean;
  /** Fraction through the feed interval, clamped to 0..1. */
  progress: number;
  /** Whole hours until the next feed. 0 when due or fresh. */
  hoursUntil: number;
  /** Whole minutes until the next feed. 0 when due or fresh. */
  minutesUntil: number;
  /** Whole hours a due starter has been waiting past its interval. */
  hoursWaited: number;
}

export function feedStatus(
  starter: { lastFedAt: number | null; intervalHours: number },
  now: number
): FeedStatus {
  if (starter.lastFedAt === null) {
    return { fresh: true, due: false, progress: 0, hoursUntil: 0, minutesUntil: 0, hoursWaited: 0 };
  }
  const intervalMs = starter.intervalHours * HOUR_MS;
  const elapsed = now - starter.lastFedAt;
  const remaining = intervalMs - elapsed;
  const progress = Math.max(0, Math.min(1, intervalMs === 0 ? 1 : elapsed / intervalMs));

  if (remaining <= 0) {
    return {
      fresh: false,
      due: true,
      progress: 1,
      hoursUntil: 0,
      minutesUntil: 0,
      hoursWaited: Math.floor(-remaining / HOUR_MS),
    };
  }

  return {
    fresh: false,
    due: false,
    progress,
    hoursUntil: Math.floor(remaining / HOUR_MS),
    minutesUntil: Math.floor(remaining / MINUTE_MS),
    hoursWaited: 0,
  };
}
