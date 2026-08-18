// Shared field geometry, so Input, PickerField and UnitPair stay on one baseline.
// 52 at fontScale.normal, 66 in floured fingers.
export const FIELD_HEIGHT = { normal: 52, floured: 66 } as const;

export function fieldHeight(fontScale: number): number {
  return fontScale > 1 ? FIELD_HEIGHT.floured : FIELD_HEIGHT.normal;
}
