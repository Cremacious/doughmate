// Yeast conversions between active dry, instant, and fresh, using the practical
// ratios from data/yeast.json.
import yeastData from '../data/yeast.json';

export type YeastId = 'active_dry' | 'instant' | 'fresh';

const types = yeastData.types as Record<YeastId, { name: string }>;
const ratios = yeastData.conversions as Record<string, number>;

export interface YeastType {
  id: YeastId;
  name: string;
}

export function listYeastTypes(): YeastType[] {
  return (Object.keys(types) as YeastId[]).map((id) => ({ id, name: types[id].name }));
}

export function getYeastType(id: string): YeastType | undefined {
  return listYeastTypes().find((type) => type.id === id);
}

/** Convert an amount of one yeast type into another. Same type returns as is. */
export function convertYeast(amount: number, from: YeastId, to: YeastId): number {
  if (from === to) {
    return amount;
  }
  return amount * ratios[`${from}_to_${to}_ratio`]!;
}
