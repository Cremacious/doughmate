import {
  formatUsd,
  type IngredientPrice,
  ingredientGrams,
  priceKey,
  pricePerGram,
  recipeCost,
  removePriceByName,
  upsertPrice,
} from './cost';

const priced = (ingredientName: string, perGram: number): IngredientPrice => ({
  ingredientName,
  pricePerGram: perGram,
  updatedAt: 0,
});

describe('priceKey', () => {
  it('is case and whitespace insensitive', () => {
    expect(priceKey('  Bread Flour ')).toBe('bread flour');
    expect(priceKey('BREAD   FLOUR')).toBe('bread flour');
  });
});

describe('pricePerGram', () => {
  it('divides price by the package weight in grams', () => {
    expect(pricePerGram(10, 1000, 'g')).toBeCloseTo(0.01, 10);
  });

  it('round trips a pounds package back to its price', () => {
    const perGram = pricePerGram(4.99, 5, 'lb');
    expect(perGram * 5 * 453.592).toBeCloseTo(4.99, 6);
  });

  it('throws on a package size that is zero or negative', () => {
    expect(() => pricePerGram(4.99, 0, 'lb')).toThrow();
    expect(() => pricePerGram(4.99, -1, 'lb')).toThrow();
  });

  it('throws on a negative price', () => {
    expect(() => pricePerGram(-1, 5, 'lb')).toThrow();
  });
});

describe('ingredientGrams', () => {
  it('converts a weight unit without needing a density', () => {
    expect(ingredientGrams({ amount: 2, unit: 'lb', item: 'Anything at all' })).toBeCloseTo(
      907.184,
      3
    );
    expect(ingredientGrams({ amount: 250, unit: 'g', item: 'Water' })).toBe(250);
  });

  it('converts a volume unit using the reference density', () => {
    expect(ingredientGrams({ amount: 2, unit: 'cup', item: 'All purpose flour' })).toBeCloseTo(
      240,
      6
    );
  });

  it('honours the European flour standard', () => {
    expect(
      ingredientGrams({ amount: 2, unit: 'cup', item: 'All purpose flour' }, { flourStandard: 125 })
    ).toBeCloseTo(250, 6);
  });

  it('returns null for a volume amount with no known density', () => {
    expect(ingredientGrams({ amount: 1, unit: 'cup', item: 'Sourdough discard' })).toBeNull();
  });

  it('returns null when there is no unit or no number', () => {
    expect(ingredientGrams({ amount: 2, unit: '', item: 'Eggs' })).toBeNull();
    expect(ingredientGrams({ amount: '', unit: 'g', item: 'Salt to taste' })).toBeNull();
  });

  it('returns null for a unit the conversion engine does not handle', () => {
    expect(ingredientGrams({ amount: 1, unit: 'stick', item: 'Butter' })).toBeNull();
  });
});

describe('recipeCost', () => {
  it('costs a priced, gram measured ingredient', () => {
    const result = recipeCost(
      [{ amount: 500, unit: 'g', item: 'Bread flour' }],
      [priced('bread flour', 0.002)],
      2
    );
    expect(result.rows).toEqual([{ item: 'Bread flour', status: 'priced', cost: 1 }]);
    expect(result.total).toBeCloseTo(1, 10);
    expect(result.perServing).toBeCloseTo(0.5, 10);
    expect(result.pricedCount).toBe(1);
  });

  it('matches prices case insensitively', () => {
    const result = recipeCost(
      [{ amount: 500, unit: 'g', item: 'BREAD FLOUR' }],
      [priced('Bread Flour', 0.002)],
      1
    );
    expect(result.rows[0]!.status).toBe('priced');
  });

  it('marks a weighable ingredient with no price as no_price', () => {
    const result = recipeCost([{ amount: 100, unit: 'g', item: 'Rye flour' }], [], 1);
    expect(result.rows[0]).toEqual({ item: 'Rye flour', status: 'no_price', cost: null });
    expect(result.unpricedCount).toBe(1);
    expect(result.total).toBe(0);
  });

  // Weight is checked before price on purpose: offering "Add price" on a row that
  // still could not be costed afterwards would be a dead end.
  it('marks an unweighable ingredient as no_weight even when it has a price', () => {
    const result = recipeCost(
      [{ amount: 1, unit: 'cup', item: 'Sourdough discard' }],
      [priced('sourdough discard', 0.01)],
      1
    );
    expect(result.rows[0]).toEqual({ item: 'Sourdough discard', status: 'no_weight', cost: null });
    expect(result.unknownCount).toBe(1);
  });

  it('marks an unweighable, unpriced ingredient as no_weight too', () => {
    const result = recipeCost([{ amount: 2, unit: '', item: 'Eggs' }], [], 1);
    expect(result.rows[0]!.status).toBe('no_weight');
    expect(result.unpricedCount).toBe(0);
  });

  it('totals only the priced rows and keeps every row in order', () => {
    const result = recipeCost(
      [
        { amount: 500, unit: 'g', item: 'Bread flour' },
        { amount: 350, unit: 'g', item: 'Water' },
        { amount: 2, unit: '', item: 'Eggs' },
      ],
      [priced('bread flour', 0.002), priced('water', 0)],
      4
    );
    expect(result.rows.map((r) => r.status)).toEqual(['priced', 'priced', 'no_weight']);
    expect(result.total).toBeCloseTo(1, 10);
    expect(result.perServing).toBeCloseTo(0.25, 10);
  });

  it('returns a null per serving when servings is not positive', () => {
    const result = recipeCost(
      [{ amount: 500, unit: 'g', item: 'Bread flour' }],
      [priced('bread flour', 0.002)],
      0
    );
    expect(result.perServing).toBeNull();
    expect(result.total).toBeCloseTo(1, 10);
  });

  it('handles an empty recipe', () => {
    const result = recipeCost([], [], 4);
    expect(result.rows).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.perServing).toBe(0);
  });

  // Each line cost rounds to whole cents before the total is summed, so the
  // displayed lines always add up to the displayed total. Three rows at exactly
  // $0.125 would drift to a total of $0.38 if the total were computed from the
  // unrounded sum ($0.375) instead of from the rounded lines ($0.13 x 3 = $0.39).
  it('rounds each line to whole cents and sums the rounded values for the total', () => {
    const result = recipeCost(
      [
        { amount: 500, unit: 'g', item: 'Bread flour' },
        { amount: 500, unit: 'g', item: 'Rye flour' },
        { amount: 500, unit: 'g', item: 'Whole wheat flour' },
      ],
      [
        priced('bread flour', 0.00025),
        priced('rye flour', 0.00025),
        priced('whole wheat flour', 0.00025),
      ],
      3
    );
    expect(result.rows.map((r) => r.cost)).toEqual([0.13, 0.13, 0.13]);
    expect(result.total).toBeCloseTo(0.39, 10);
    expect(result.perServing).toBeCloseTo(0.13, 10);
  });
});

describe('upsertPrice', () => {
  it('adds a new price to the front of the list', () => {
    const next = upsertPrice([priced('water', 0)], priced('Bread flour', 0.002));
    expect(next.map((p) => p.ingredientName)).toEqual(['Bread flour', 'water']);
  });

  it('replaces an existing price in place, matching case insensitively', () => {
    const next = upsertPrice(
      [priced('water', 0), priced('bread flour', 0.002)],
      priced('Bread Flour', 0.003)
    );
    expect(next).toHaveLength(2);
    expect(next[1]).toEqual({ ingredientName: 'Bread Flour', pricePerGram: 0.003, updatedAt: 0 });
  });
});

describe('removePriceByName', () => {
  it('drops the matching price', () => {
    const next = removePriceByName([priced('water', 0), priced('bread flour', 0.002)], 'water');
    expect(next.map((p) => p.ingredientName)).toEqual(['bread flour']);
  });

  it('matches case and whitespace insensitively', () => {
    const next = removePriceByName([priced('bread flour', 0.002)], '  Bread   Flour ');
    expect(next).toEqual([]);
  });

  it('is a no-op when the name is absent', () => {
    const list = [priced('water', 0)];
    expect(removePriceByName(list, 'rye flour')).toEqual(list);
  });
});

describe('formatUsd', () => {
  it('always shows two decimal places with a leading dollar sign', () => {
    expect(formatUsd(1)).toBe('$1.00');
    expect(formatUsd(4.994)).toBe('$4.99');
    expect(formatUsd(0)).toBe('$0.00');
  });
});
