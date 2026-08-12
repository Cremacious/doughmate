import {
  bakersPercentages,
  groupBySection,
  matchFactor,
  parseIngredientLine,
  parseLeadingQuantity,
  scaleRecipeText,
  scaleText,
} from './recipe';

describe('parseLeadingQuantity', () => {
  it('parses a whole number', () => {
    expect(parseLeadingQuantity('2 eggs')).toEqual({ value: 2, rest: 'eggs' });
  });

  it('parses a decimal', () => {
    expect(parseLeadingQuantity('1.5 cups sugar')).toEqual({ value: 1.5, rest: 'cups sugar' });
  });

  it('parses a simple fraction', () => {
    expect(parseLeadingQuantity('3/4 cup butter')).toEqual({ value: 0.75, rest: 'cup butter' });
  });

  it('parses a mixed number', () => {
    expect(parseLeadingQuantity('1 1/2 cups flour')).toEqual({ value: 1.5, rest: 'cups flour' });
  });

  it('ignores surrounding whitespace', () => {
    expect(parseLeadingQuantity('  2   eggs  ')).toEqual({ value: 2, rest: 'eggs' });
  });

  it('parses a bare number with no rest', () => {
    expect(parseLeadingQuantity('3')).toEqual({ value: 3, rest: '' });
  });

  it('parses a bare fraction with no rest', () => {
    expect(parseLeadingQuantity('3/4')).toEqual({ value: 0.75, rest: '' });
  });

  it('parses a bare mixed number with no rest', () => {
    expect(parseLeadingQuantity('1 1/2')).toEqual({ value: 1.5, rest: '' });
  });

  it('returns null when there is no leading number', () => {
    expect(parseLeadingQuantity('pinch of salt')).toBeNull();
  });

  it('returns null for an empty line', () => {
    expect(parseLeadingQuantity('   ')).toBeNull();
  });
});

describe('scaleText', () => {
  it('scales a whole number', () => {
    expect(scaleText('2 eggs', 2)).toBe('4 eggs');
  });

  it('scales a mixed number and simplifies', () => {
    expect(scaleText('1 1/2 cups flour', 2)).toBe('3 cups flour');
  });

  it('scales a fraction into a decimal', () => {
    expect(scaleText('3/4 cup butter', 2)).toBe('1.5 cup butter');
  });

  it('halves an amount', () => {
    expect(scaleText('180 g sugar', 0.5)).toBe('90 g sugar');
  });

  it('leaves lines without a quantity untouched', () => {
    expect(scaleText('pinch of salt', 2)).toBe('pinch of salt');
  });

  it('scales a bare number with no trailing text', () => {
    expect(scaleText('3', 2)).toBe('6');
  });
});

describe('scaleRecipeText', () => {
  it('scales every line and preserves the ones without amounts', () => {
    const recipe = '2 eggs\n1 cup flour\npinch of salt';
    expect(scaleRecipeText(recipe, 2)).toBe('4 eggs\n2 cup flour\npinch of salt');
  });

  it('preserves blank lines', () => {
    expect(scaleRecipeText('2 eggs\n\n1 cup milk', 3)).toBe('6 eggs\n\n3 cup milk');
  });
});

describe('matchFactor', () => {
  it('computes the factor to reach an available amount', () => {
    expect(matchFactor(2, 3)).toBe(1.5);
  });

  it('returns null when the original amount is zero', () => {
    expect(matchFactor(0, 3)).toBeNull();
  });
});

describe('parseIngredientLine', () => {
  it('parses amount, unit, and item', () => {
    expect(parseIngredientLine('1 cup flour')).toEqual({ amount: 1, unit: 'cup', item: 'flour' });
  });

  it('handles multi word items', () => {
    expect(parseIngredientLine('300 g bread flour')).toEqual({
      amount: 300,
      unit: 'g',
      item: 'bread flour',
    });
  });

  it('normalises plural units and mixed numbers', () => {
    expect(parseIngredientLine('1 1/2 cups sugar')).toEqual({
      amount: 1.5,
      unit: 'cup',
      item: 'sugar',
    });
  });

  it('leaves the unit empty when the next word is not a unit', () => {
    expect(parseIngredientLine('2 eggs')).toEqual({ amount: 2, unit: '', item: 'eggs' });
  });

  it('keeps the whole line as the item when there is no number', () => {
    expect(parseIngredientLine('pinch of salt')).toEqual({
      amount: '',
      unit: '',
      item: 'pinch of salt',
    });
  });

  it('handles a bare number', () => {
    expect(parseIngredientLine('3')).toEqual({ amount: 3, unit: '', item: '' });
  });

  it('handles an empty line', () => {
    expect(parseIngredientLine('   ')).toEqual({ amount: '', unit: '', item: '' });
  });
});

describe('bakersPercentages', () => {
  it('computes each gram ingredient against total flour weight', () => {
    const rows = bakersPercentages([
      { amount: 500, unit: 'g', item: 'bread flour' },
      { amount: 350, unit: 'g', item: 'water' },
      { amount: 10, unit: 'g', item: 'salt' },
    ]);
    expect(rows).toEqual([
      { item: 'bread flour', pct: 100 },
      { item: 'water', pct: 70 },
      { item: 'salt', pct: 2 },
    ]);
  });

  it('sums multiple flours for the base weight', () => {
    const rows = bakersPercentages([
      { amount: 400, unit: 'g', item: 'bread flour' },
      { amount: 100, unit: 'g', item: 'rye flour' },
      { amount: 400, unit: 'g', item: 'water' },
    ]);
    expect(rows?.find((r) => r.item === 'water')?.pct).toBe(80);
  });

  it('ignores ingredients that are not measured in grams', () => {
    const rows = bakersPercentages([
      { amount: 500, unit: 'g', item: 'flour' },
      { amount: 2, unit: '', item: 'eggs' },
      { amount: 1, unit: 'cup', item: 'milk' },
    ]);
    expect(rows).toEqual([{ item: 'flour', pct: 100 }]);
  });

  it('returns null when there is no flour weight', () => {
    expect(
      bakersPercentages([
        { amount: 350, unit: 'g', item: 'water' },
        { amount: '', unit: '', item: 'pinch of salt' },
      ])
    ).toBeNull();
  });
});

describe('groupBySection', () => {
  it('puts ingredients with no section into one leading unlabeled group', () => {
    const groups = groupBySection([
      { amount: 2, unit: '', item: 'eggs' },
      { amount: 1, unit: 'cup', item: 'flour' },
    ]);
    expect(groups).toEqual([
      {
        section: undefined,
        items: [
          { amount: 2, unit: '', item: 'eggs' },
          { amount: 1, unit: 'cup', item: 'flour' },
        ],
      },
    ]);
  });

  it('groups by section name in first appearance order, keeping item order', () => {
    const groups = groupBySection([
      { amount: 500, unit: 'g', item: 'bread flour', section: 'Dough' },
      { amount: 350, unit: 'g', item: 'water', section: 'Dough' },
      { amount: 2, unit: 'tbsp', item: 'semolina', section: 'Finish' },
    ]);
    expect(groups.map((g) => g.section)).toEqual(['Dough', 'Finish']);
    expect(groups[0]!.items.map((i) => i.item)).toEqual(['bread flour', 'water']);
    expect(groups[1]!.items.map((i) => i.item)).toEqual(['semolina']);
  });

  it('collects non contiguous items of the same section together', () => {
    const groups = groupBySection([
      { amount: 1, unit: '', item: 'a', section: 'X' },
      { amount: 1, unit: '', item: 'b', section: 'Y' },
      { amount: 1, unit: '', item: 'c', section: 'X' },
    ]);
    expect(groups.map((g) => g.section)).toEqual(['X', 'Y']);
    expect(groups[0]!.items.map((i) => i.item)).toEqual(['a', 'c']);
  });

  it('treats an empty string section as the unlabeled group', () => {
    const groups = groupBySection([{ amount: 1, unit: '', item: 'a', section: '' }]);
    expect(groups).toEqual([
      { section: undefined, items: [{ amount: 1, unit: '', item: 'a', section: '' }] },
    ]);
  });

  it('returns an empty array for no ingredients', () => {
    expect(groupBySection([])).toEqual([]);
  });
});
