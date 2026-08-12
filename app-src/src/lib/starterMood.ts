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
  const counts: number[] = [];
  counts.length = days;
  counts.fill(0);
  const todayIndex = Math.floor(now / DAY_MS);
  for (const t of feeds) {
    const offset = todayIndex - Math.floor(t / DAY_MS);
    if (offset >= 0 && offset < days) {
      counts[days - 1 - offset]! += 1;
    }
  }
  return counts;
}
