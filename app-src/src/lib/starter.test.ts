import { feedStatus } from './starter';

const HOUR = 3_600_000;

describe('feedStatus', () => {
  it('reports a fresh starter that has never been fed', () => {
    expect(feedStatus({ lastFedAt: null, intervalHours: 24 }, 1_000_000)).toEqual({
      fresh: true,
      due: false,
      progress: 0,
      hoursUntil: 0,
      minutesUntil: 0,
      hoursWaited: 0,
    });
  });

  it('reports progress partway through the interval', () => {
    const now = 100 * HOUR;
    const status = feedStatus({ lastFedAt: now - 6 * HOUR, intervalHours: 24 }, now);
    expect(status.due).toBe(false);
    expect(status.progress).toBeCloseTo(0.25);
    expect(status.hoursUntil).toBe(18);
    expect(status.minutesUntil).toBe(18 * 60);
  });

  it('rounds the countdown down to whole units', () => {
    const now = 100 * HOUR;
    const status = feedStatus({ lastFedAt: now - 23.5 * HOUR, intervalHours: 24 }, now);
    expect(status.hoursUntil).toBe(0);
    expect(status.minutesUntil).toBe(30);
  });

  it('flags a due starter and how long it has waited', () => {
    const now = 100 * HOUR;
    const status = feedStatus({ lastFedAt: now - 27 * HOUR, intervalHours: 24 }, now);
    expect(status).toMatchObject({ fresh: false, due: true, progress: 1, hoursWaited: 3 });
  });

  it('treats a zero interval as immediately due', () => {
    const status = feedStatus({ lastFedAt: 500, intervalHours: 0 }, 500);
    expect(status.due).toBe(true);
    expect(status.progress).toBe(1);
  });
});
