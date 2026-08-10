// Pan geometry and recipe scaling. Areas are square inches. To move a recipe
// between pans, scale ingredients by the ratio of their areas.
import pansData from '../data/pans.json';

export interface Pan {
  id: string;
  name: string;
  shape: string;
  area_sqin: number;
}

const pans = (pansData as { common_pans: Pan[] }).common_pans;

export function roundArea(diameterIn: number): number {
  const radius = diameterIn / 2;
  return Math.PI * radius * radius;
}

export function squareArea(sideIn: number): number {
  return sideIn * sideIn;
}

export function rectangleArea(lengthIn: number, widthIn: number): number {
  return lengthIn * widthIn;
}

export function getPan(id: string): Pan | undefined {
  return pans.find((pan) => pan.id === id);
}

export function listPans(): Pan[] {
  return pans;
}

/** Ratio to scale a recipe from one pan area to another. Null if original is 0. */
export function panScaleFactor(fromArea: number, toArea: number): number | null {
  if (fromArea <= 0) {
    return null;
  }
  return toArea / fromArea;
}

export type BakeTimeHint = 'larger' | 'smaller' | 'same';

/**
 * Rough bake time guidance. A bigger pan spreads batter thinner (bake less);
 * a smaller pan piles it deeper (bake more). Within 5% is close enough to call same.
 */
export function bakeTimeHint(fromArea: number, toArea: number): BakeTimeHint {
  if (toArea > fromArea * 1.05) {
    return 'larger';
  }
  if (toArea < fromArea * 0.95) {
    return 'smaller';
  }
  return 'same';
}
