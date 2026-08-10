// Oven temperature conversions: Fahrenheit, Celsius, and UK gas marks.
export function fToC(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function cToF(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export interface GasMark {
  mark: string;
  f: number;
  c: number;
}

// Standard baking chart. Celsius values are the conventional rounded ones.
const GAS_MARKS: GasMark[] = [
  { mark: '1/4', f: 225, c: 110 },
  { mark: '1/2', f: 250, c: 130 },
  { mark: '1', f: 275, c: 140 },
  { mark: '2', f: 300, c: 150 },
  { mark: '3', f: 325, c: 170 },
  { mark: '4', f: 350, c: 180 },
  { mark: '5', f: 375, c: 190 },
  { mark: '6', f: 400, c: 200 },
  { mark: '7', f: 425, c: 220 },
  { mark: '8', f: 450, c: 230 },
  { mark: '9', f: 475, c: 240 },
];

export function listGasMarks(): GasMark[] {
  return GAS_MARKS;
}

/** Temperature for a gas mark, or undefined if the mark is unknown. */
export function gasMarkTemp(mark: string): { f: number; c: number } | undefined {
  const found = GAS_MARKS.find((entry) => entry.mark === mark);
  return found ? { f: found.f, c: found.c } : undefined;
}

/** The gas mark whose Fahrenheit value is closest to the given temperature. */
export function nearestGasMark(fahrenheit: number): string {
  let closest = GAS_MARKS[0]!;
  for (const entry of GAS_MARKS) {
    if (Math.abs(entry.f - fahrenheit) < Math.abs(closest.f - fahrenheit)) {
      closest = entry;
    }
  }
  return closest.mark;
}
