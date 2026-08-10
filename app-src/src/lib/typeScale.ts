// Scales a typography token's size and line height. Used by floured fingers mode
// to make text bigger without touching the locked design tokens.
import type { TextStyle } from 'react-native';

export function scaleType(
  token: { fontSize: number; lineHeight: number },
  scale: number
): TextStyle {
  return { fontSize: token.fontSize * scale, lineHeight: token.lineHeight * scale };
}
