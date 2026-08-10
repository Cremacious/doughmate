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
