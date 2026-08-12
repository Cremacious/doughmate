import { formatRemaining, isTimerDone, parseDuration, timerRemainingMs } from './timer';

const MIN = 60_000;
const HOUR = 3_600_000;

describe('parseDuration', () => {
  it('parses minutes', () => {
    expect(parseDuration('30 min')).toBe(30 * MIN);
    expect(parseDuration('45 minutes')).toBe(45 * MIN);
    expect(parseDuration('90m')).toBe(90 * MIN);
  });
  it('parses hours', () => {
    expect(parseDuration('4 hr')).toBe(4 * HOUR);
    expect(parseDuration('2 hours')).toBe(2 * HOUR);
    expect(parseDuration('1h')).toBe(1 * HOUR);
  });
  it('parses hours and minutes together', () => {
    expect(parseDuration('1 hr 20 min')).toBe(HOUR + 20 * MIN);
    expect(parseDuration('1h 30m')).toBe(HOUR + 30 * MIN);
  });
  it('returns null when nothing parses', () => {
    expect(parseDuration('until puffy')).toBeNull();
    expect(parseDuration('')).toBeNull();
  });
});

describe('timerRemainingMs', () => {
  it('counts down a running timer', () => {
    expect(timerRemainingMs({ status: 'running', endsAt: 1000 + 5 * MIN }, 1000)).toBe(5 * MIN);
  });
  it('never goes negative', () => {
    expect(timerRemainingMs({ status: 'running', endsAt: 1000 }, 1000 + MIN)).toBe(0);
  });
  it('returns the held remaining while paused', () => {
    expect(timerRemainingMs({ status: 'paused', remainingMs: 7 * MIN }, 999999)).toBe(7 * MIN);
  });
  it('running timer without endsAt uses now as end time', () => {
    expect(timerRemainingMs({ status: 'running', endsAt: undefined }, 1000)).toBe(0);
  });
  it('paused timer without remainingMs returns 0', () => {
    expect(timerRemainingMs({ status: 'paused', remainingMs: undefined }, 999999)).toBe(0);
  });
});

describe('isTimerDone', () => {
  it('is done when running and past the end', () => {
    expect(isTimerDone({ status: 'running', endsAt: 1000 }, 1000)).toBe(true);
    expect(isTimerDone({ status: 'running', endsAt: 2000 }, 1000)).toBe(false);
  });
  it('is never done while paused', () => {
    expect(isTimerDone({ status: 'paused' }, 999999)).toBe(false);
  });
  it('handles running timer without endsAt (undefined defaults to Infinity)', () => {
    // This tests the ?? Infinity fallback when endsAt is undefined
    expect(isTimerDone({ status: 'running', endsAt: undefined }, 999999)).toBe(false);
  });
  it('is done when running and now equals endsAt', () => {
    // Additional edge case: exact match
    expect(isTimerDone({ status: 'running', endsAt: 5000 }, 5000)).toBe(true);
  });
});

describe('formatRemaining', () => {
  it('shows hours and minutes over an hour', () => {
    expect(formatRemaining(3 * HOUR + 41 * MIN)).toBe('3h 41m');
  });
  it('shows minutes and seconds under an hour', () => {
    expect(formatRemaining(12 * MIN + 4000)).toBe('12:04');
  });
  it('is 0:00 at zero', () => {
    expect(formatRemaining(0)).toBe('0:00');
  });
});
