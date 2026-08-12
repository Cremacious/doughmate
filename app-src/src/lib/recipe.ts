// Recipe scaling. Pure text in, pure text out, so a whole recipe can be typed
// as free text and scaled line by line. Amounts may be whole, decimal, a simple
// fraction (3/4), or a mixed number (1 1/2). Lines without a number pass through.
import { formatQuantity } from './convert';

export interface ParsedQuantity {
  value: number;
  rest: string;
}

const MIXED = /^(\d+)\s+(\d+)\/(\d+)(?:\s+([\s\S]*))?$/;
const FRACTION = /^(\d+)\/(\d+)(?:\s+([\s\S]*))?$/;
const DECIMAL = /^(\d+(?:\.\d+)?)(?:\s+([\s\S]*))?$/;

/** Pull a leading amount off a line. Returns null if the line has no number. */
export function parseLeadingQuantity(text: string): ParsedQuantity | null {
  const trimmed = text.trim();

  const mixed = MIXED.exec(trimmed);
  if (mixed) {
    const value = Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
    return { value, rest: (mixed[4] ?? '').trim() };
  }

  const fraction = FRACTION.exec(trimmed);
  if (fraction) {
    const value = Number(fraction[1]) / Number(fraction[2]);
    return { value, rest: (fraction[3] ?? '').trim() };
  }

  const decimal = DECIMAL.exec(trimmed);
  if (decimal) {
    return { value: Number(decimal[1]), rest: (decimal[2] ?? '').trim() };
  }

  return null;
}

/** Scale one line by a factor. Lines without a leading amount are returned as is. */
export function scaleText(text: string, factor: number): string {
  const parsed = parseLeadingQuantity(text);
  if (!parsed) {
    return text;
  }
  const scaled = formatQuantity(parsed.value * factor);
  return parsed.rest ? `${scaled} ${parsed.rest}` : scaled;
}

/** Scale a whole recipe (newline separated), preserving blank lines. */
export function scaleRecipeText(recipe: string, factor: number): string {
  return recipe
    .split('\n')
    .map((line) => scaleText(line, factor))
    .join('\n');
}

/** Factor that turns an original amount into an available one. Null if original is 0. */
export function matchFactor(originalAmount: number, availableAmount: number): number | null {
  if (originalAmount === 0) {
    return null;
  }
  return availableAmount / originalAmount;
}

const UNIT_MAP: Record<string, string> = {
  cup: 'cup',
  cups: 'cup',
  tbsp: 'tbsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  tsp: 'tsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  ml: 'ml',
  g: 'g',
  gram: 'g',
  grams: 'g',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  lb: 'lb',
  lbs: 'lb',
  pound: 'lb',
  pounds: 'lb',
  stick: 'stick',
  sticks: 'stick',
};

export interface ParsedIngredient {
  /** Numeric amount, or '' when the line has no leading number. */
  amount: number | '';
  /** Canonical unit token, or '' when none was recognised. */
  unit: string;
  item: string;
}

export interface BakersRow {
  item: string;
  pct: number;
}

/**
 * Baker's percentages: every gram measured ingredient as a percentage of total
 * flour weight. Returns null when no flour weight is measured in grams.
 */
export function bakersPercentages(ingredients: ParsedIngredient[]): BakersRow[] | null {
  const grams = ingredients.filter(
    (i): i is { amount: number; unit: string; item: string } =>
      typeof i.amount === 'number' && i.unit === 'g'
  );
  const flour = grams.filter((i) => /flour/i.test(i.item)).reduce((sum, i) => sum + i.amount, 0);
  if (flour <= 0) {
    return null;
  }
  return grams.map((i) => ({ item: i.item, pct: Math.round((i.amount / flour) * 1000) / 10 }));
}

/** Structural ingredient shape for grouping. Matches state RecipeIngredient. */
export interface SectionedIngredient {
  amount: number | '';
  unit: string;
  item: string;
  section?: string;
}

export interface IngredientGroup {
  section?: string;
  items: SectionedIngredient[];
}

/** Group ingredients by section name, first appearance order, items in original order. */
export function groupBySection(ingredients: SectionedIngredient[]): IngredientGroup[] {
  const groups: IngredientGroup[] = [];
  const byKey = new Map<string, IngredientGroup>();
  for (const ing of ingredients) {
    const key = ing.section ?? '';
    let group = byKey.get(key);
    if (!group) {
      group = { section: key === '' ? undefined : key, items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.items.push(ing);
  }
  return groups;
}

/** Parse a free text ingredient line into amount, unit, and item. */
export function parseIngredientLine(line: string): ParsedIngredient {
  const parsed = parseLeadingQuantity(line);
  if (!parsed) {
    return { amount: '', unit: '', item: line.trim() };
  }
  const match = /^(\S+)\s*([\s\S]*)$/.exec(parsed.rest);
  if (match) {
    const unit = UNIT_MAP[match[1]!.toLowerCase()];
    if (unit) {
      return { amount: parsed.value, unit, item: match[2]!.trim() };
    }
  }
  return { amount: parsed.value, unit: '', item: parsed.rest.trim() };
}
