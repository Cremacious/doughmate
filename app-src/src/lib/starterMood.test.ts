import { dailyFeedCounts, starterMood } from './starterMood';

const HOUR = 3_600_000;
const DAY = 86_400_000;

describe('starterMood', () => {
  it('is new when never fed', () => {
    expect(starterMood({ lastFedAt: null, intervalHours: 24 }, 1000)).toBe('new');
  });

  it('is full just after a feed', () => {
    const now = 100 * DAY;
    expect(starterMood({ lastFedAt: now - 2 * HOUR, intervalHours: 24 }, now)).toBe('full');
  });

  it('is peak in the middle of the interval', () => {
    const now = 100 * DAY;
    expect(starterMood({ lastFedAt: now - 12 * HOUR, intervalHours: 24 }, now)).toBe('peak');
  });

  it('is peckish late in the interval', () => {
    const now = 100 * DAY;
    expect(starterMood({ lastFedAt: now - 20 * HOUR, intervalHours: 24 }, now)).toBe('peckish');
  });

  it('is hungry when due but not long overdue', () => {
    const now = 100 * DAY;
    expect(starterMood({ lastFedAt: now - 30 * HOUR, intervalHours: 24 }, now)).toBe('hungry');
  });

  it('is sleepy when overdue by a full interval or more', () => {
    const now = 100 * DAY;
    expect(starterMood({ lastFedAt: now - 48 * HOUR, intervalHours: 24 }, now)).toBe('sleepy');
  });
});

describe('dailyFeedCounts', () => {
  it('returns all zeros for no feeds', () => {
    const counts = dailyFeedCounts([], 100 * DAY, 28);
    expect(counts).toHaveLength(28);
    expect(counts.every((c) => c === 0)).toBe(true);
  });

  it('counts feeds on the same day into today (last index)', () => {
    const now = 100 * DAY + 5 * HOUR;
    const counts = dailyFeedCounts([100 * DAY + 1 * HOUR, 100 * DAY + 3 * HOUR], now, 28);
    expect(counts[27]).toBe(2);
  });

  it('places a feed from yesterday one cell before today', () => {
    const now = 100 * DAY + 5 * HOUR;
    const counts = dailyFeedCounts([99 * DAY + 2 * HOUR], now, 28);
    expect(counts[26]).toBe(1);
  });

  it('places the oldest in window feed at index 0', () => {
    const now = 100 * DAY;
    const counts = dailyFeedCounts([(100 - 27) * DAY], now, 28);
    expect(counts[0]).toBe(1);
  });

  it('ignores feeds outside the window and in the future', () => {
    const now = 100 * DAY;
    const counts = dailyFeedCounts([(100 - 28) * DAY, 101 * DAY], now, 28);
    expect(counts.every((c) => c === 0)).toBe(true);
  });

  it('defaults to a 28 day window', () => {
    const now = 100 * DAY + 5 * HOUR;
    const counts = dailyFeedCounts([100 * DAY + 1 * HOUR], now);
    expect(counts).toHaveLength(28);
    expect(counts[27]).toBe(1);
  });
});
