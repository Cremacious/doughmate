// Butter conversions, including US sticks. A stick is half a cup of butter.
// Standard units reuse the butter density from the main conversion engine.
import { fromGrams, getIngredient, toGrams, type Unit } from './convert';

export type ButterUnit = Unit | 'stick';

const butter = getIngredient('butter')!;

/** Grams in one stick of butter (half a cup). */
export const BUTTER_STICK_G = butter.per_cup_g / 2;

function toG(amount: number, unit: ButterUnit): number {
  return unit === 'stick' ? amount * BUTTER_STICK_G : toGrams(butter, amount, unit);
}

function fromG(grams: number, unit: ButterUnit): number {
  return unit === 'stick' ? grams / BUTTER_STICK_G : fromGrams(butter, grams, unit);
}

/** Convert butter between any units, including sticks. */
export function convertButter(amount: number, from: ButterUnit, to: ButterUnit): number {
  return fromG(toG(amount, from), to);
}
