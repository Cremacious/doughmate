// Scales a typography token's size and line height. Used by floured fingers mode
// to make text bigger without touching the locked design tokens.
import type { TextStyle } from 'react-native';

export function scaleType(
  token: { fontSize: number; lineHeight: number },
  scale: number
): TextStyle {
  return { fontSize: token.fontSize * scale, lineHeight: token.lineHeight * scale };
}

/**
 * A line height that will not crop a big numeral. `typography.numeric.hero` runs a
 * 76/72 ratio for optical tightness, but a line box shorter than the glyph clips the
 * tops of digits on iOS, so any oversized numeral sizes its own leading through here.
 * Digits carry no descenders, so the extra room falls below the baseline harmlessly.
 */
export function numeralLine(fontSize: number): { fontSize: number; lineHeight: number } {
  return { fontSize, lineHeight: Math.ceil(fontSize * 1.08) };
}
