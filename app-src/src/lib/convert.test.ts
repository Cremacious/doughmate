import {
  convert,
  convertVolume,
  convertWeight,
  formatQuantity,
  fromGrams,
  getIngredient,
  isVolumeUnit,
  isWeightUnit,
  round,
  searchIngredients,
  toGrams,
  toKitchenFraction,
  usesFractionUnit,
} from './convert';

describe('unit predicates', () => {
  it('recognizes volume units', () => {
    expect(isVolumeUnit('cup')).toBe(true);
    expect(isVolumeUnit('tbsp')).toBe(true);
    expect(isVolumeUnit('tsp')).toBe(true);
    expect(isVolumeUnit('ml')).toBe(true);
    expect(isVolumeUnit('g')).toBe(false);
  });

  it('recognizes weight units', () => {
    expect(isWeightUnit('g')).toBe(true);
    expect(isWeightUnit('oz')).toBe(true);
    expect(isWeightUnit('lb')).toBe(true);
    expect(isWeightUnit('cup')).toBe(false);
  });
});

describe('convertVolume', () => {
  it('has 16 tablespoons in a cup', () => {
    expect(convertVolume(1, 'cup', 'tbsp')).toBe(16);
  });

  it('has 3 teaspoons in a tablespoon', () => {
    expect(convertVolume(1, 'tbsp', 'tsp')).toBe(3);
  });

  it('has 48 teaspoons in a cup', () => {
    expect(convertVolume(1, 'cup', 'tsp')).toBe(48);
  });

  it('has 236.588 millilitres in a US cup', () => {
    expect(convertVolume(1, 'cup', 'ml')).toBeCloseTo(236.588, 2);
  });

  it('returns the same amount for the same unit', () => {
    expect(convertVolume(2.5, 'tsp', 'tsp')).toBe(2.5);
  });
});

describe('convertWeight', () => {
  it('has 28.3495 grams in an ounce', () => {
    expect(convertWeight(1, 'oz', 'g')).toBeCloseTo(28.3495, 3);
  });

  it('has 453.592 grams in a pound', () => {
    expect(convertWeight(1, 'lb', 'g')).toBeCloseTo(453.592, 2);
  });

  it('converts grams back to ounces', () => {
    expect(convertWeight(100, 'g', 'oz')).toBeCloseTo(3.5274, 3);
  });

  it('returns the same amount for the same unit', () => {
    expect(convertWeight(42, 'g', 'g')).toBe(42);
  });
});

describe('getIngredient', () => {
  it('finds an ingredient by id', () => {
    expect(getIngredient('all_purpose_flour')?.name).toBe('All purpose flour');
  });

  it('finds an ingredient by name, ignoring case', () => {
    expect(getIngredient('GRANULATED SUGAR')?.id).toBe('granulated_sugar');
  });

  it('finds an ingredient by alias', () => {
    expect(getIngredient('plain flour')?.id).toBe('all_purpose_flour');
    expect(getIngredient('strong flour')?.id).toBe('bread_flour');
  });

  it('returns undefined for an unknown ingredient', () => {
    expect(getIngredient('moon dust')).toBeUndefined();
  });
});

describe('searchIngredients', () => {
  it('matches on name and alias', () => {
    const results = searchIngredients('sugar');
    const ids = results.map((r) => r.id);
    expect(ids).toContain('granulated_sugar');
    expect(ids).toContain('brown_sugar');
    expect(ids).toContain('powdered_sugar');
  });

  it('returns every ingredient for an empty query', () => {
    expect(searchIngredients('').length).toBe(48);
  });

  it('respects the result limit', () => {
    expect(searchIngredients('', 5).length).toBe(5);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchIngredients('moon dust')).toEqual([]);
  });
});

describe('toGrams', () => {
  const flour = getIngredient('all_purpose_flour')!;
  const sugar = getIngredient('granulated_sugar')!;

  it('uses the per cup weight for cups', () => {
    expect(toGrams(flour, 1, 'cup')).toBe(120);
  });

  it('uses the per tablespoon weight for tablespoons', () => {
    expect(toGrams(sugar, 1, 'tbsp')).toBe(12.5);
  });

  it('uses the per teaspoon weight for teaspoons', () => {
    expect(toGrams(flour, 1, 'tsp')).toBe(2.5);
  });

  it('scales by amount', () => {
    expect(toGrams(flour, 2, 'cup')).toBe(240);
  });

  it('derives grams from millilitres via the per cup density', () => {
    expect(toGrams(flour, 236.588, 'ml')).toBeCloseTo(120, 4);
  });

  it('passes weight units straight through in grams', () => {
    expect(toGrams(flour, 1, 'oz')).toBeCloseTo(28.3495, 3);
  });

  it('applies the European flour standard to flour', () => {
    expect(toGrams(flour, 1, 'cup', { flourStandard: 125 })).toBeCloseTo(125, 5);
  });

  it('leaves non flour ingredients unaffected by the flour standard', () => {
    expect(toGrams(sugar, 1, 'cup', { flourStandard: 125 })).toBe(198);
  });
});

describe('fromGrams', () => {
  const flour = getIngredient('all_purpose_flour')!;

  it('converts grams to cups via density', () => {
    expect(fromGrams(flour, 120, 'cup')).toBeCloseTo(1, 5);
  });

  it('converts grams to another weight unit', () => {
    expect(fromGrams(flour, 28.3495, 'oz')).toBeCloseTo(1, 4);
  });

  it('is the inverse of toGrams', () => {
    const grams = toGrams(flour, 0.75, 'cup');
    expect(fromGrams(flour, grams, 'cup')).toBeCloseTo(0.75, 6);
  });
});

describe('convert', () => {
  const flour = getIngredient('all_purpose_flour')!;

  it('converts volume to volume without an ingredient', () => {
    expect(convert({ amount: 1, from: 'cup', to: 'tbsp' })).toBe(16);
  });

  it('converts weight to weight without an ingredient', () => {
    expect(convert({ amount: 1, from: 'oz', to: 'g' })).toBeCloseTo(28.3495, 3);
  });

  it('converts a cup of flour to grams', () => {
    expect(convert({ amount: 1, from: 'cup', to: 'g', ingredient: flour })).toBe(120);
  });

  it('converts grams of flour back to cups', () => {
    expect(convert({ amount: 120, from: 'g', to: 'cup', ingredient: flour })).toBeCloseTo(1, 5);
  });

  it('honours the flour standard end to end', () => {
    expect(
      convert({ amount: 1, from: 'cup', to: 'g', ingredient: flour, flourStandard: 125 })
    ).toBeCloseTo(125, 5);
  });

  it('throws when crossing volume and weight without an ingredient', () => {
    expect(() => convert({ amount: 1, from: 'cup', to: 'g' })).toThrow(/ingredient/i);
  });
});

describe('round', () => {
  it('rounds to the given number of decimals', () => {
    expect(round(120.456, 1)).toBe(120.5);
  });

  it('defaults to whole numbers', () => {
    expect(round(120.456)).toBe(120);
  });

  it('never returns negative zero', () => {
    expect(Object.is(round(-0.0001, 2), -0)).toBe(false);
    expect(round(-0.0001, 2)).toBe(0);
  });
});

describe('formatQuantity', () => {
  it('shows whole numbers with no decimals for large amounts', () => {
    expect(formatQuantity(120)).toBe('120');
    expect(formatQuantity(236.588)).toBe('237');
  });

  it('shows one decimal for medium amounts', () => {
    expect(formatQuantity(12.34)).toBe('12.3');
  });

  it('shows up to two decimals for small amounts', () => {
    expect(formatQuantity(2.567)).toBe('2.57');
  });

  it('drops trailing zeros', () => {
    expect(formatQuantity(2.5)).toBe('2.5');
    expect(formatQuantity(2)).toBe('2');
  });

  it('shows zero cleanly', () => {
    expect(formatQuantity(0)).toBe('0');
  });

  it('renders a fraction for volume units when asked', () => {
    expect(formatQuantity(1.5, { format: 'fraction', unit: 'cup' })).toBe('1 1/2');
    expect(formatQuantity(0.371, { format: 'fraction', unit: 'tbsp' })).toBe('3/8');
    expect(formatQuantity(0.25, { format: 'fraction', unit: 'tsp' })).toBe('1/4');
  });

  it('stays decimal for non volume units even in fraction mode', () => {
    expect(formatQuantity(1.5, { format: 'fraction', unit: 'g' })).toBe('1.5');
    expect(formatQuantity(1.5, { format: 'fraction', unit: 'ml' })).toBe('1.5');
    expect(formatQuantity(1.5, { format: 'fraction' })).toBe('1.5');
  });

  it('stays decimal for volume units in decimal mode', () => {
    expect(formatQuantity(1.5, { format: 'decimal', unit: 'cup' })).toBe('1.5');
  });
});

describe('usesFractionUnit', () => {
  it('is true for cup, tbsp, tsp and their common spellings', () => {
    for (const u of ['cup', 'cups', 'Tbsp', 'tablespoon', 'tablespoons', 'tsp', 'Teaspoons']) {
      expect(usesFractionUnit(u)).toBe(true);
    }
  });

  it('is false for weight units, ml, and unknown or missing units', () => {
    for (const u of ['g', 'oz', 'lb', 'ml', 'x', 'stick', '']) {
      expect(usesFractionUnit(u)).toBe(false);
    }
    expect(usesFractionUnit(undefined)).toBe(false);
  });
});

describe('toKitchenFraction', () => {
  it('renders bare whole numbers', () => {
    expect(toKitchenFraction(0)).toBe('0');
    expect(toKitchenFraction(2)).toBe('2');
  });

  it('snaps the fractional part to the nearest kitchen fraction', () => {
    expect(toKitchenFraction(0.125)).toBe('1/8');
    expect(toKitchenFraction(0.25)).toBe('1/4');
    expect(toKitchenFraction(0.333)).toBe('1/3');
    expect(toKitchenFraction(0.375)).toBe('3/8');
    expect(toKitchenFraction(0.5)).toBe('1/2');
    expect(toKitchenFraction(0.625)).toBe('5/8');
    expect(toKitchenFraction(0.667)).toBe('2/3');
    expect(toKitchenFraction(0.75)).toBe('3/4');
    expect(toKitchenFraction(0.875)).toBe('7/8');
  });

  it('renders mixed numbers', () => {
    expect(toKitchenFraction(1.52)).toBe('1 1/2');
    expect(toKitchenFraction(2.34)).toBe('2 1/3');
  });

  it('carries up when the fraction snaps to a whole', () => {
    expect(toKitchenFraction(0.95)).toBe('1');
    expect(toKitchenFraction(1.98)).toBe('2');
  });

  it('floors tiny positive amounts to the smallest fraction instead of zero', () => {
    expect(toKitchenFraction(0.02)).toBe('1/8');
  });

  it('handles negative values', () => {
    expect(toKitchenFraction(-1.5)).toBe('-1 1/2');
    expect(toKitchenFraction(-0.5)).toBe('-1/2');
  });
});
