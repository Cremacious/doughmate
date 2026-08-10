import { BUTTER_STICK_G, convertButter } from './butter';

describe('convertButter', () => {
  it('has 8 tablespoons in a stick', () => {
    expect(convertButter(1, 'stick', 'tbsp')).toBeCloseTo(8, 1);
  });

  it('has 2 sticks in a cup', () => {
    expect(convertButter(1, 'cup', 'stick')).toBeCloseTo(2, 5);
  });

  it('weighs a stick in grams', () => {
    expect(convertButter(1, 'stick', 'g')).toBeCloseTo(BUTTER_STICK_G, 5);
  });

  it('turns four tablespoons into half a stick', () => {
    expect(convertButter(4, 'tbsp', 'stick')).toBeCloseTo(0.5, 2);
  });

  it('still converts plain units without sticks', () => {
    expect(convertButter(1, 'cup', 'g')).toBe(227);
  });
});
