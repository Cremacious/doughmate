import { daysAgo } from './bake';

const DAY = 86_400_000;
const HOUR = 3_600_000;

describe('daysAgo', () => {
  it('is 0 for the same UTC day', () => {
    const now = 100 * DAY + 5 * HOUR;
    expect(daysAgo(100 * DAY + 1 * HOUR, now)).toBe(0);
  });

  it('is 1 for the previous day', () => {
    const now = 100 * DAY + 5 * HOUR;
    expect(daysAgo(99 * DAY + 20 * HOUR, now)).toBe(1);
  });

  it('counts several days back', () => {
    const now = 100 * DAY;
    expect(daysAgo(93 * DAY, now)).toBe(7);
  });

  it('clamps a future time to 0', () => {
    const now = 100 * DAY;
    expect(daysAgo(101 * DAY, now)).toBe(0);
  });
});
