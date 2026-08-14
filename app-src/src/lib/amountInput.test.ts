import {
  combineAmount,
  FRACTION_CHOICES,
  fractionLabel,
  isFractionInputUnit,
  splitAmount,
  WHOLE_MAX,
} from './amountInput';

describe('FRACTION_CHOICES', () => {
  it('starts with the no fraction dash and covers the kitchen fractions', () => {
    expect(FRACTION_CHOICES[0]).toEqual({ id: '0', label: '—', value: 0 });
    expect(FRACTION_CHOICES.map((c) => c.id)).toEqual([
      '0',
      '1/8',
      '1/4',
      '1/3',
      '3/8',
      '1/2',
      '5/8',
      '2/3',
      '3/4',
      '7/8',
    ]);
  });

  it('offers whole numbers up to a sensible cap', () => {
    expect(WHOLE_MAX).toBe(24);
  });
});

describe('isFractionInputUnit', () => {
  it('is true for cup, tbsp, tsp, and stick', () => {
    for (const u of ['cup', 'tbsp', 'tsp', 'stick', 'STICK', ' Cup ']) {
      expect(isFractionInputUnit(u)).toBe(true);
    }
  });

  it('is false for weights, ml, and missing units', () => {
    for (const u of ['g', 'oz', 'lb', 'ml', '']) {
      expect(isFractionInputUnit(u)).toBe(false);
    }
    expect(isFractionInputUnit(undefined)).toBe(false);
  });
});

describe('fractionLabel', () => {
  it('returns the label for a known id', () => {
    expect(fractionLabel('1/2')).toBe('1/2');
    expect(fractionLabel('0')).toBe('—');
  });

  it('falls back to the dash for an unknown id', () => {
    expect(fractionLabel('9/11')).toBe('—');
  });
});

describe('splitAmount', () => {
  it('splits a whole number', () => {
    expect(splitAmount(2)).toEqual({ whole: 2, fractionId: '0' });
  });

  it('splits a mixed number to the nearest fraction', () => {
    expect(splitAmount(1.5)).toEqual({ whole: 1, fractionId: '1/2' });
    expect(splitAmount(2.33)).toEqual({ whole: 2, fractionId: '1/3' });
    expect(splitAmount(0.13)).toEqual({ whole: 0, fractionId: '1/8' });
  });

  it('carries up when the fraction rounds to a whole', () => {
    expect(splitAmount(1.95)).toEqual({ whole: 2, fractionId: '0' });
  });

  it('collapses zero, negative, and non finite values to zero', () => {
    expect(splitAmount(0)).toEqual({ whole: 0, fractionId: '0' });
    expect(splitAmount(-3)).toEqual({ whole: 0, fractionId: '0' });
    expect(splitAmount(NaN)).toEqual({ whole: 0, fractionId: '0' });
  });
});

describe('combineAmount', () => {
  it('adds the fraction value to the whole', () => {
    expect(combineAmount(2, '0')).toBe(2);
    expect(combineAmount(1, '1/2')).toBe(1.5);
    expect(combineAmount(0, '3/4')).toBe(0.75);
  });

  it('rounds repeating fractions to four decimals', () => {
    expect(combineAmount(1, '1/3')).toBe(1.3333);
    expect(combineAmount(2, '2/3')).toBe(2.6667);
  });

  it('treats an unknown fraction id as no fraction', () => {
    expect(combineAmount(3, 'bogus')).toBe(3);
  });

  it('round trips through splitAmount', () => {
    const combined = combineAmount(2, '3/8');
    expect(splitAmount(combined)).toEqual({ whole: 2, fractionId: '3/8' });
  });
});
