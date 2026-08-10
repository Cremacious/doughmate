// Resolves the active palette from theme.ts for the current color scheme and the
// theme preference. Every screen reads colors through this so dark mode and the
// manual theme override both work everywhere.
import { useColorScheme } from 'react-native';

import { useSettings } from '@/state/settings';
import { colors, type ThemeMode } from '@/theme';

/** Extra text scaling for floured fingers mode. */
const FLOURED_FINGERS_SCALE = 1.3;

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  /** Palette for the active mode (crust, choc, jam, and friends). */
  palette: typeof colors.light | typeof colors.dark;
  /** Background layers (primary screen bg, elevated cards, subtle fills). */
  bg: typeof colors.bg.light | typeof colors.bg.dark;
  /** Multiplier for font sizes, larger when floured fingers mode is on. */
  fontScale: number;
}

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  const { settings } = useSettings();

  const mode: ThemeMode =
    settings.theme === 'auto' ? (scheme === 'dark' ? 'dark' : 'light') : settings.theme;

  return {
    mode,
    isDark: mode === 'dark',
    palette: colors[mode],
    bg: colors.bg[mode],
    fontScale: settings.flouredFingers ? FLOURED_FINGERS_SCALE : 1,
  };
}
