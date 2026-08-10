// Resolves the active palette from theme.ts for the current color scheme.
// Every screen reads colors through this so dark mode works from day one.
import { useColorScheme } from 'react-native';

import { colors, type ThemeMode } from '@/theme';

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  /** Palette for the active mode (crust, choc, jam, and friends). */
  palette: typeof colors.light | typeof colors.dark;
  /** Background layers (primary screen bg, elevated cards, subtle fills). */
  bg: typeof colors.bg.light | typeof colors.bg.dark;
}

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  const mode: ThemeMode = scheme === 'dark' ? 'dark' : 'light';
  return {
    mode,
    isDark: mode === 'dark',
    palette: colors[mode],
    bg: colors.bg[mode],
  };
}
