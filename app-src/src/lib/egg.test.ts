import { convertEggs, getEggSize, listEggSizes } from './egg';

describe('convertEggs', () => {
  it('keeps the count for the same size', () => {
    expect(convertEggs(3, 'large', 'large')).toBe(3);
  });

  it('needs more when swapping large for medium', () => {
    expect(convertEggs(2, 'large', 'medium')).toBeCloseTo(2.27, 2);
  });

  it('needs fewer when swapping large for jumbo', () => {
    expect(convertEggs(1, 'jumbo', 'large')).toBeCloseTo(1.26, 2);
  });
});

describe('egg sizes', () => {
  it('lists all five sizes', () => {
    expect(listEggSizes().length).toBe(5);
  });

  it('knows a size weight', () => {
    expect(getEggSize('large')?.whole_g).toBe(50);
  });

  it('returns undefined for an unknown size', () => {
    expect(getEggSize('ostrich')).toBeUndefined();
  });
});
