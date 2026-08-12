import {
  totalActiveMs,
  buildSchedule,
  isFeasible,
  earliestFinish,
  planProgress,
  composeFinishAt,
  formatClock,
  formatDayLabel,
} from './schedule';

const STEPS = [
  { text: 'Mix, rest', time: '30 min' },
  { text: 'Add salt' },
  { text: 'Bulk ferment', time: '4 hr' },
  { text: 'Shape' },
  { text: 'Cold proof', time: '12 hr' },
  { text: 'Bake', time: '45 min' },
];
const TOTAL = (30 + 4 * 60 + 12 * 60 + 45) * 60_000; // 62_100_000

describe('totalActiveMs', () => {
  it('sums parseable step times, treating untimed as zero', () => {
    expect(totalActiveMs(STEPS)).toBe(TOTAL);
  });
  it('treats an unparseable time as zero', () => {
    expect(totalActiveMs([{ text: 'x', time: 'until puffy' }])).toBe(0);
  });
  it('is zero for no steps', () => {
    expect(totalActiveMs([])).toBe(0);
  });
});

describe('buildSchedule', () => {
  const finishAt = new Date(2026, 7, 13, 8, 0).getTime(); // Thu Aug 13 2026, 8:00 AM
  const s = buildSchedule(STEPS, finishAt);
  it('starts the bake total before the finish', () => {
    expect(s.totalMs).toBe(TOTAL);
    expect(s.startAt).toBe(finishAt - TOTAL);
    expect(s.finishAt).toBe(finishAt);
  });
  it('chains each step start forward from startAt', () => {
    expect(s.steps[0]!.startAt).toBe(s.startAt); // Mix
    expect(s.steps[1]!.startAt).toBe(s.startAt + 30 * 60_000); // Add salt (checkpoint)
    expect(s.steps[2]!.startAt).toBe(s.startAt + 30 * 60_000); // Bulk ferment
    expect(s.steps[5]!.startAt).toBe(finishAt - 45 * 60_000); // Bake
  });
  it('marks zero length steps as checkpoints', () => {
    expect(s.steps[1]!.isCheckpoint).toBe(true);
    expect(s.steps[1]!.durationMs).toBe(0);
    expect(s.steps[2]!.isCheckpoint).toBe(false);
    expect(s.steps[0]!.index).toBe(0);
    expect(s.steps[2]!.time).toBe('4 hr');
  });
});

describe('isFeasible / earliestFinish', () => {
  const now = new Date(2026, 7, 12, 12, 0).getTime(); // noon Aug 12
  it('is feasible when start is at or after now', () => {
    expect(isFeasible(STEPS, now + TOTAL, now)).toBe(true); // start == now, boundary
    expect(isFeasible(STEPS, now + TOTAL + 1, now)).toBe(true);
  });
  it('is not feasible when start would be before now', () => {
    expect(isFeasible(STEPS, now + TOTAL - 1, now)).toBe(false);
  });
  it('earliestFinish is now plus total', () => {
    expect(earliestFinish(STEPS, now)).toBe(now + TOTAL);
  });
});

describe('planProgress', () => {
  const steps = [{ startAt: 100 }, { startAt: 200 }, { startAt: 300 }];
  const finishAt = 400;
  it('before start: no current, next is first', () => {
    expect(planProgress(steps, finishAt, 50)).toEqual({
      currentIndex: null,
      nextIndex: 0,
      done: false,
    });
  });
  it('mid plan: current is last started, next is upcoming', () => {
    expect(planProgress(steps, finishAt, 250)).toEqual({
      currentIndex: 1,
      nextIndex: 2,
      done: false,
    });
  });
  it('on a boundary counts that step as started', () => {
    expect(planProgress(steps, finishAt, 200)).toEqual({
      currentIndex: 1,
      nextIndex: 2,
      done: false,
    });
  });
  it('all started, not yet finished: no next', () => {
    expect(planProgress(steps, finishAt, 350)).toEqual({
      currentIndex: 2,
      nextIndex: null,
      done: false,
    });
  });
  it('done at or past finish', () => {
    expect(planProgress(steps, finishAt, 400).done).toBe(true);
  });
  it('empty steps', () => {
    expect(planProgress([], 400, 50)).toEqual({ currentIndex: null, nextIndex: null, done: false });
  });
});

describe('composeFinishAt', () => {
  const now = new Date(2026, 7, 12, 9, 30).getTime(); // Wed Aug 12, 9:30 AM
  it('composes today at a wall clock time', () => {
    const r = new Date(composeFinishAt(now, 0, 8, 0, 'AM'));
    expect(r.getHours()).toBe(8);
    expect(r.getMinutes()).toBe(0);
    expect(r.getDate()).toBe(12);
  });
  it('applies the day offset', () => {
    expect(new Date(composeFinishAt(now, 1, 8, 0, 'AM')).getDate()).toBe(13);
  });
  it('12 AM maps to hour 0, 12 PM maps to hour 12', () => {
    expect(new Date(composeFinishAt(now, 0, 12, 0, 'AM')).getHours()).toBe(0);
    expect(new Date(composeFinishAt(now, 0, 12, 0, 'PM')).getHours()).toBe(12);
  });
  it('PM adds twelve hours', () => {
    expect(new Date(composeFinishAt(now, 0, 2, 45, 'PM')).getHours()).toBe(14);
  });
});

describe('formatClock', () => {
  it('formats AM and PM with padded minutes', () => {
    expect(formatClock(new Date(2026, 7, 12, 8, 0).getTime())).toBe('8:00 AM');
    expect(formatClock(new Date(2026, 7, 12, 14, 5).getTime())).toBe('2:05 PM');
  });
  it('midnight and noon read as 12', () => {
    expect(formatClock(new Date(2026, 7, 12, 0, 30).getTime())).toBe('12:30 AM');
    expect(formatClock(new Date(2026, 7, 12, 12, 0).getTime())).toBe('12:00 PM');
  });
});

describe('formatDayLabel', () => {
  const now = new Date(2026, 7, 12, 9, 0).getTime(); // Wed Aug 12
  it('labels today and tomorrow', () => {
    expect(formatDayLabel(new Date(2026, 7, 12, 20, 0).getTime(), now)).toBe('Today');
    expect(formatDayLabel(new Date(2026, 7, 13, 7, 0).getTime(), now)).toBe('Tomorrow');
  });
  it('labels further days by weekday abbreviation', () => {
    expect(formatDayLabel(new Date(2026, 7, 14, 7, 0).getTime(), now)).toBe('Fri');
  });
});
