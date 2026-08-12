// Whole days between two times, by UTC day buckets. Same day is 0. Used for the
// friendly bake date label ("Today", "Yesterday", "3 days ago").
const DAY_MS = 86_400_000;

export function daysAgo(bakedAt: number, now: number): number {
  const diff = Math.floor(now / DAY_MS) - Math.floor(bakedAt / DAY_MS);
  return diff > 0 ? diff : 0;
}
