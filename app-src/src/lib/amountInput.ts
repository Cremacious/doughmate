// Helpers for the fraction amount input on the Convert screen. Pure functions
// so the whole/fraction split and recombine can be tested without any UI.

/** Largest whole number the whole picker offers. */
export const WHOLE_MAX = 24;

export interface FractionChoice {
  /** Stable id used as the picker option key and stored split marker. */
  id: string;
  /** What the picker and pill show. */
  label: string;
  /** Numeric value added to the whole part. */
  value: number;
}

// The fractions a cook can actually measure. '0' is the "no fraction" choice.
export const FRACTION_CHOICES: FractionChoice[] = [
  { id: '0', label: '—', value: 0 },
  { id: '1/8', label: '1/8', value: 1 / 8 },
  { id: '1/4', label: '1/4', value: 1 / 4 },
  { id: '1/3', label: '1/3', value: 1 / 3 },
  { id: '3/8', label: '3/8', value: 3 / 8 },
  { id: '1/2', label: '1/2', value: 1 / 2 },
  { id: '5/8', label: '5/8', value: 5 / 8 },
  { id: '2/3', label: '2/3', value: 2 / 3 },
  { id: '3/4', label: '3/4', value: 3 / 4 },
  { id: '7/8', label: '7/8', value: 7 / 8 },
];

// Units bakers scoop, where entering a fraction beats typing a decimal. Butter
// sticks belong here too (half and quarter sticks are everyday amounts).
const FRACTION_INPUT_UNITS = new Set(['cup', 'tbsp', 'tsp', 'stick']);

/** Whether an amount in this unit should be entered with the fraction pickers. */
export function isFractionInputUnit(unit: string | undefined): boolean {
  return unit !== undefined && FRACTION_INPUT_UNITS.has(unit.trim().toLowerCase());
}

/** Label for a fraction id, falling back to the "no fraction" dash. */
export function fractionLabel(id: string): string {
  return (FRACTION_CHOICES.find((c) => c.id === id) ?? FRACTION_CHOICES[0]!).label;
}

/**
 * Split a numeric amount into a whole part and the nearest kitchen fraction,
 * carrying up when the fraction rounds to a whole. Non finite or negative
 * values collapse to zero.
 */
export function splitAmount(value: number): { whole: number; fractionId: string } {
  const safe = Number.isFinite(value) && value > 0 ? value : 0;
  let whole = Math.floor(safe);
  const frac = safe - whole;

  let bestId = '0';
  let bestDist = Math.abs(frac);
  for (const choice of FRACTION_CHOICES) {
    const dist = Math.abs(frac - choice.value);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = choice.id;
    }
  }
  // Closer to the next whole than to any fraction: carry it up.
  if (Math.abs(frac - 1) < bestDist) {
    whole += 1;
    bestId = '0';
  }
  return { whole, fractionId: bestId };
}

/** Recombine a whole part and a fraction id into a single amount. */
export function combineAmount(whole: number, fractionId: string): number {
  const choice = FRACTION_CHOICES.find((c) => c.id === fractionId);
  const value = whole + (choice ? choice.value : 0);
  return Math.round(value * 10000) / 10000;
}
