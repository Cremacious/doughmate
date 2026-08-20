// Recipe costing. Turns a baker's own ingredient prices into a per line cost, a
// recipe total, and a cost per serving. Pure functions, no UI, no side effects.
//
// Every price is stored normalised to dollars per gram so any recipe unit can be
// costed against it, whatever unit the price was originally entered in.
import {
  type ConvertOptions,
  convertWeight,
  getIngredient,
  isVolumeUnit,
  isWeightUnit,
  toGrams,
  type WeightUnit,
} from './convert';

export interface IngredientPrice {
  /** As the baker typed it. Matching is done on `priceKey`, not on this. */
  ingredientName: string;
  pricePerGram: number;
  updatedAt: number;
  /** What was actually entered, kept so the editor can reopen as it was filled in. */
  price?: number;
  packageAmount?: number;
  packageUnit?: WeightUnit;
}

/** The structural shape of a recipe ingredient this module needs. */
export interface CostIngredient {
  amount: number | '';
  unit: string;
  item: string;
}

export type CostStatus = 'priced' | 'no_price' | 'no_weight';

export interface CostRow {
  item: string;
  status: CostStatus;
  cost: number | null;
}

export interface RecipeCost {
  rows: CostRow[];
  total: number;
  /** Null when the recipe has no positive serving count to divide by. */
  perServing: number | null;
  pricedCount: number;
  unpricedCount: number;
  unknownCount: number;
}

/** Normalised lookup key for an ingredient name. Case and spacing insensitive. */
export function priceKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Dollars per gram, from a price and the package size it covers. */
export function pricePerGram(
  price: number,
  packageAmount: number,
  packageUnit: WeightUnit
): number {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`Invalid price: ${price}`);
  }
  if (!Number.isFinite(packageAmount) || packageAmount <= 0) {
    throw new Error(`Invalid package amount: ${packageAmount}`);
  }
  return price / convertWeight(packageAmount, packageUnit, 'g');
}

/**
 * Grams one recipe ingredient weighs, or null when that cannot be known.
 *
 * Weights convert outright. Volumes need a density from the reference list, so an
 * ingredient the list has never heard of returns null rather than a wrong number.
 * Countable amounts ("2 eggs") and kitchen units the engine does not model
 * ("1 stick") return null for the same reason.
 */
export function ingredientGrams(ingredient: CostIngredient, opts?: ConvertOptions): number | null {
  const { amount, unit, item } = ingredient;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return null;
  }
  if (isWeightUnit(unit)) {
    return convertWeight(amount, unit, 'g');
  }
  if (!isVolumeUnit(unit)) {
    return null;
  }
  const reference = getIngredient(item);
  if (!reference) {
    return null;
  }
  return toGrams(reference, amount, unit, opts);
}

/**
 * Cost every ingredient in a recipe against a price list.
 *
 * Weight resolvability is checked before the price lookup on purpose: a row that
 * could not be costed even once priced should say so, rather than inviting the
 * baker to add a price that would change nothing.
 *
 * Each line cost is rounded to whole cents here, and the total is the sum of those
 * already-rounded values (not a rounding of the unrounded sum). That keeps the
 * displayed lines always adding up to the displayed total, the same guarantee the
 * levain build gives its seed/flour/water split.
 */
export function recipeCost(
  ingredients: CostIngredient[],
  prices: IngredientPrice[],
  servings: number,
  opts?: ConvertOptions
): RecipeCost {
  const byKey = new Map(prices.map((p) => [priceKey(p.ingredientName), p]));

  const rows: CostRow[] = ingredients.map((ingredient) => {
    const grams = ingredientGrams(ingredient, opts);
    if (grams === null) {
      return { item: ingredient.item, status: 'no_weight', cost: null };
    }
    const price = byKey.get(priceKey(ingredient.item));
    if (!price) {
      return { item: ingredient.item, status: 'no_price', cost: null };
    }
    const cost = Math.round(grams * price.pricePerGram * 100) / 100;
    return { item: ingredient.item, status: 'priced', cost };
  });

  const total = rows.reduce((sum, row) => sum + (row.cost ?? 0), 0);

  return {
    rows,
    total,
    perServing: servings > 0 ? total / servings : null,
    pricedCount: rows.filter((r) => r.status === 'priced').length,
    unpricedCount: rows.filter((r) => r.status === 'no_price').length,
    unknownCount: rows.filter((r) => r.status === 'no_weight').length,
  };
}

/** Add a price, or replace the existing one for the same ingredient in place. */
export function upsertPrice(list: IngredientPrice[], entry: IngredientPrice): IngredientPrice[] {
  const key = priceKey(entry.ingredientName);
  const index = list.findIndex((p) => priceKey(p.ingredientName) === key);
  if (index === -1) {
    return [entry, ...list];
  }
  return list.map((p, i) => (i === index ? entry : p));
}

/** USD only, matching every other unit in the app. */
export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}
