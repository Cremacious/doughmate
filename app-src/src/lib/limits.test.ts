import { atLimit, FREE_RECIPE_LIMIT, FREE_STARTER_LIMIT, FREE_TIMER_LIMIT } from './limits';

describe('atLimit', () => {
  it('lets a free baker under the cap through', () => {
    expect(atLimit(0, 5, false)).toBe(false);
    expect(atLimit(4, 5, false)).toBe(false);
  });

  it('blocks a free baker at the cap', () => {
    expect(atLimit(5, 5, false)).toBe(true);
  });

  it('never blocks Pro', () => {
    expect(atLimit(5, 5, true)).toBe(false);
    expect(atLimit(500, 5, true)).toBe(false);
  });

  // A collection built before the cap existed, or left behind by a lapsed
  // entitlement, still reports as blocked rather than throwing. Callers use this
  // to stop new additions, never to hide or delete what is already saved.
  it('blocks a free baker already over the cap', () => {
    expect(atLimit(9, 5, false)).toBe(true);
  });
});

describe('free tier caps', () => {
  it('are the values the paywall promises to lift', () => {
    expect(FREE_RECIPE_LIMIT).toBe(5);
    expect(FREE_STARTER_LIMIT).toBe(1);
    expect(FREE_TIMER_LIMIT).toBe(1);
  });
});
