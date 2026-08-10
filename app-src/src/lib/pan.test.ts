import {
  bakeTimeHint,
  getPan,
  listPans,
  panScaleFactor,
  rectangleArea,
  roundArea,
  squareArea,
} from './pan';

describe('area formulas', () => {
  it('computes a round pan area', () => {
    expect(roundArea(8)).toBeCloseTo(50.27, 1);
  });

  it('computes a square pan area', () => {
    expect(squareArea(8)).toBe(64);
  });

  it('computes a rectangular pan area', () => {
    expect(rectangleArea(13, 9)).toBe(117);
  });
});

describe('getPan / listPans', () => {
  it('finds a pan by id', () => {
    expect(getPan('round_9')?.area_sqin).toBeCloseTo(63.6, 1);
  });

  it('returns undefined for an unknown pan', () => {
    expect(getPan('frisbee')).toBeUndefined();
  });

  it('lists every common pan', () => {
    expect(listPans().length).toBe(16);
  });
});

describe('panScaleFactor', () => {
  it('scales down from a 9 inch round to an 8 inch round', () => {
    expect(panScaleFactor(63.6, 50.3)).toBeCloseTo(0.791, 2);
  });

  it('scales up from an 8 inch to a 9 inch round', () => {
    expect(panScaleFactor(50.3, 63.6)).toBeCloseTo(1.264, 2);
  });

  it('returns null when the original area is zero', () => {
    expect(panScaleFactor(0, 63.6)).toBeNull();
  });
});

describe('bakeTimeHint', () => {
  it('says larger when the new pan is bigger', () => {
    expect(bakeTimeHint(50.3, 63.6)).toBe('larger');
  });

  it('says smaller when the new pan is smaller', () => {
    expect(bakeTimeHint(63.6, 50.3)).toBe('smaller');
  });

  it('says same when the areas are close', () => {
    expect(bakeTimeHint(63.6, 64)).toBe('same');
  });
});
