// Doughmate conversion engine. Pure functions, no UI, no side effects.
// Volume/weight math plus ingredient density lookups from data/ingredients.json.
import ingredientsData from '../data/ingredients.json';

export type VolumeUnit = 'cup' | 'tbsp' | 'tsp' | 'ml';
export type WeightUnit = 'g' | 'oz' | 'lb';
export type Unit = VolumeUnit | WeightUnit;

/** Grams a level cup of flour is assumed to weigh. US = 120, European = 125. */
export type FlourStandard = 120 | 125;

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  per_cup_g: number;
  per_tbsp_g: number;
  per_tsp_g: number;
  aliases: string[];
}

export interface ConvertOptions {
  flourStandard?: FlourStandard;
}

export interface ConvertParams extends ConvertOptions {
  amount: number;
  from: Unit;
  to: Unit;
  ingredient?: Ingredient;
}

const ingredients = (ingredientsData as { ingredients: Ingredient[] }).ingredients;

// US customary volumes, expressed in teaspoons so cup/tbsp/tsp stay exact integers.
const ML_PER_CUP = 236.588;
const ML_PER_TSP = ML_PER_CUP / 48;
const VOL_IN_TSP: Record<VolumeUnit, number> = {
  cup: 48,
  tbsp: 3,
  tsp: 1,
  ml: 1 / ML_PER_TSP,
};

// Weight units expressed in grams.
const G_PER_UNIT: Record<WeightUnit, number> = {
  g: 1,
  oz: 28.3495,
  lb: 453.592,
};

export function isVolumeUnit(unit: string): unit is VolumeUnit {
  return unit === 'cup' || unit === 'tbsp' || unit === 'tsp' || unit === 'ml';
}

export function isWeightUnit(unit: string): unit is WeightUnit {
  return unit === 'g' || unit === 'oz' || unit === 'lb';
}

export function convertVolume(amount: number, from: VolumeUnit, to: VolumeUnit): number {
  return (amount * VOL_IN_TSP[from]) / VOL_IN_TSP[to];
}

export function convertWeight(amount: number, from: WeightUnit, to: WeightUnit): number {
  return (amount * G_PER_UNIT[from]) / G_PER_UNIT[to];
}

/** Look up one ingredient by id, exact name, or exact alias (case insensitive). */
export function getIngredient(query: string): Ingredient | undefined {
  const q = query.trim().toLowerCase();
  return ingredients.find(
    (i) =>
      i.id === q ||
      i.name.toLowerCase() === q ||
      i.aliases.some((alias) => alias.toLowerCase() === q)
  );
}

/** Fuzzy search across id, name, and aliases. Empty query returns everything. */
export function searchIngredients(query: string, limit?: number): Ingredient[] {
  const q = query.trim().toLowerCase();
  const matched = ingredients.filter((i) =>
    `${i.id} ${i.name} ${i.aliases.join(' ')}`.toLowerCase().includes(q)
  );
  return limit === undefined ? matched : matched.slice(0, limit);
}

/** Grams one unit of an ingredient weighs, honouring the flour standard. */
function gramsPerUnit(ingredient: Ingredient, unit: VolumeUnit, opts?: ConvertOptions): number {
  let grams: number;
  if (unit === 'cup') {
    grams = ingredient.per_cup_g;
  } else if (unit === 'tbsp') {
    grams = ingredient.per_tbsp_g;
  } else if (unit === 'tsp') {
    grams = ingredient.per_tsp_g;
  } else {
    // ml: derive density from the per cup weight.
    grams = ingredient.per_cup_g / ML_PER_CUP;
  }
  const useEuropeanFlour = ingredient.category === 'flour' && opts?.flourStandard === 125;
  return useEuropeanFlour ? grams * (125 / 120) : grams;
}

/** Convert an amount of an ingredient (in any unit) to grams. */
export function toGrams(
  ingredient: Ingredient,
  amount: number,
  unit: Unit,
  opts?: ConvertOptions
): number {
  if (isWeightUnit(unit)) {
    return convertWeight(amount, unit, 'g');
  }
  return amount * gramsPerUnit(ingredient, unit, opts);
}

/** Convert grams of an ingredient into a target unit. */
export function fromGrams(
  ingredient: Ingredient,
  grams: number,
  unit: Unit,
  opts?: ConvertOptions
): number {
  if (isWeightUnit(unit)) {
    return convertWeight(grams, 'g', unit);
  }
  return grams / gramsPerUnit(ingredient, unit, opts);
}

/**
 * Unified conversion entry point.
 * Volume to volume and weight to weight need no ingredient. Crossing between the
 * two needs an ingredient for its density, or it throws.
 */
export function convert({ amount, from, to, ingredient, flourStandard }: ConvertParams): number {
  if (isVolumeUnit(from) && isVolumeUnit(to)) {
    return convertVolume(amount, from, to);
  }
  if (isWeightUnit(from) && isWeightUnit(to)) {
    return convertWeight(amount, from, to);
  }
  if (!ingredient) {
    throw new Error('An ingredient is needed to convert between volume and weight.');
  }
  const grams = toGrams(ingredient, amount, from, { flourStandard });
  return fromGrams(ingredient, grams, to, { flourStandard });
}

/** Round to a number of decimals, normalising negative zero to zero. */
export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return rounded === 0 ? 0 : rounded;
}

export type NumberFormat = 'decimal' | 'fraction';

// Units bakers measure by scoop, where a fraction reads more naturally than a
// decimal. Weights (g, oz, lb) and millilitres always stay decimal.
const FRACTION_UNIT_TOKENS = new Set([
  'cup',
  'cups',
  'tbsp',
  'tablespoon',
  'tablespoons',
  'tsp',
  'teaspoon',
  'teaspoons',
]);

/** Whether an amount in this unit should be shown as a kitchen fraction. */
export function usesFractionUnit(unit: string | undefined): boolean {
  return unit !== undefined && FRACTION_UNIT_TOKENS.has(unit.trim().toLowerCase());
}

// Fractional parts a cook can actually measure, plus 0 and 1 as the bounds.
const KITCHEN_FRACTIONS: { n: number; d: number; value: number }[] = [
  { n: 0, d: 1, value: 0 },
  { n: 1, d: 8, value: 1 / 8 },
  { n: 1, d: 4, value: 1 / 4 },
  { n: 1, d: 3, value: 1 / 3 },
  { n: 3, d: 8, value: 3 / 8 },
  { n: 1, d: 2, value: 1 / 2 },
  { n: 5, d: 8, value: 5 / 8 },
  { n: 2, d: 3, value: 2 / 3 },
  { n: 3, d: 4, value: 3 / 4 },
  { n: 7, d: 8, value: 7 / 8 },
  { n: 1, d: 1, value: 1 },
];

/**
 * Render a number as a mixed kitchen fraction, snapping the fractional part to
 * the nearest common measuring fraction (eighths, thirds, quarters, halves).
 * Whole numbers render bare; a positive amount that would snap to zero floors
 * to the smallest fraction so tiny quantities are not lost.
 */
export function toKitchenFraction(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  let whole = Math.floor(abs);
  const frac = abs - whole;

  let best = KITCHEN_FRACTIONS[0]!;
  for (const candidate of KITCHEN_FRACTIONS) {
    if (Math.abs(frac - candidate.value) < Math.abs(frac - best.value)) {
      best = candidate;
    }
  }

  // Snapped up to a whole unit: carry it into the integer part.
  if (best.d === 1 && best.value === 1) {
    return `${sign}${whole + 1}`;
  }
  // Snapped to zero: keep a bare whole, unless the amount is a tiny positive
  // that would otherwise vanish, in which case floor to the smallest fraction.
  if (best.value === 0) {
    if (whole === 0 && abs > 0) {
      return `${sign}1/8`;
    }
    return `${sign}${whole}`;
  }
  const fractionText = `${best.n}/${best.d}`;
  return whole === 0 ? `${sign}${fractionText}` : `${sign}${whole} ${fractionText}`;
}

/**
 * Format a converted amount for display. Precision scales with magnitude so
 * big numbers stay clean and small ones stay useful. Trailing zeros are dropped.
 * In fraction mode, volume amounts (cup/tbsp/tsp) render as kitchen fractions.
 */
export function formatQuantity(
  value: number,
  opts?: { format?: NumberFormat; unit?: string }
): string {
  if (opts?.format === 'fraction' && usesFractionUnit(opts.unit)) {
    return toKitchenFraction(value);
  }
  const magnitude = Math.abs(value);
  const decimals = magnitude >= 100 ? 0 : magnitude >= 10 ? 1 : 2;
  return String(round(value, decimals));
}
