// Resolves the active palette from theme.ts for the current color scheme and the
// theme preference. Every screen reads colors through this so dark mode and the
// manual theme override both work everywhere.
import { useColorScheme } from 'react-native';

import { useSettings } from '@/state/settings';
import { fontScale as fontScaleTokens, palettes, type ThemeMode, touchTarget } from '@/theme';

type BasePalette = typeof palettes.light | typeof palettes.dark;

// LEGACY aliases (remove after redesign migration): screens not yet on the new
// system still read palette.crust / choc / dough / jam / leaf / steam.
interface LegacyAliases {
  crust: string;
  choc: string;
  chocSoft: string;
  dough: string;
  jam: string;
  leaf: string;
  steam: string;
}

export type AppPalette = BasePalette & LegacyAliases;

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  /** Full Proof palette plus legacy aliases during migration. */
  palette: AppPalette;
  /** Legacy background layers (bgCanvas / bgSurface / bgSunken). */
  bg: { primary: string; elevated: string; subtle: string };
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
  const p = palettes[mode];

  const palette: AppPalette = {
    ...p,
    crust: p.primary,
    choc: p.textInk,
    chocSoft: p.textSoft,
    dough: p.bgSunken,
    jam: p.primary,
    leaf: p.success,
    steam: p.border,
  };

  return {
    mode,
    isDark: mode === 'dark',
    palette,
    bg: { primary: p.bgCanvas, elevated: p.bgSurface, subtle: p.bgSunken },
    fontScale: settings.flouredFingers ? fontScaleTokens.flouredFingers : fontScaleTokens.normal,
    touchTarget: settings.flouredFingers ? touchTarget.flouredFingers : touchTarget.normal,
  };
}
