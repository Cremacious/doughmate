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
