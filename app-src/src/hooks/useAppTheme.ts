// Resolves the active palette from theme.ts for the current color scheme and the
// theme preference. Every screen reads colors through this so dark mode and the
// manual theme override both work everywhere.
import { useColorScheme } from 'react-native';

import { useSettings } from '@/state/settings';
import { fontScale as fontScaleTokens, palettes, type ThemeMode, touchTarget } from '@/theme';

export type AppPalette = typeof palettes.light | typeof palettes.dark;

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  palette: AppPalette;
  /** Font size multiplier, 1.25 in floured fingers mode. */
  fontScale: number;
  /** Minimum touch target, larger in floured fingers mode. */
  touchTarget: number;
}

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  const { settings } = useSettings();

  const mode: ThemeMode =
    settings.theme === 'auto' ? (scheme === 'dark' ? 'dark' : 'light') : settings.theme;

  return {
    mode,
    isDark: mode === 'dark',
    palette: palettes[mode],
    fontScale: settings.flouredFingers ? fontScaleTokens.flouredFingers : fontScaleTokens.normal,
    touchTarget: settings.flouredFingers ? touchTarget.flouredFingers : touchTarget.normal,
  };
}
