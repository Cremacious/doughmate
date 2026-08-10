// Egg size conversions. Swapping sizes keeps the total egg weight the same, so
// the count scales by the ratio of whole egg weights (data/eggs.json).
import eggData from '../data/eggs.json';

export type EggId = 'small' | 'medium' | 'large' | 'extra_large' | 'jumbo';

const sizes = eggData.sizes as Record<EggId, { name: string; whole_g: number }>;

export interface EggSize {
  id: EggId;
  name: string;
  whole_g: number;
}

export function listEggSizes(): EggSize[] {
  return (Object.keys(sizes) as EggId[]).map((id) => ({
    id,
    name: sizes[id].name,
    whole_g: sizes[id].whole_g,
  }));
}

export function getEggSize(id: string): EggSize | undefined {
  return listEggSizes().find((size) => size.id === id);
}

/** How many `to` eggs match a count of `from` eggs by total weight. */
export function convertEggs(count: number, from: EggId, to: EggId): number {
  return (count * sizes[from].whole_g) / sizes[to].whole_g;
}
