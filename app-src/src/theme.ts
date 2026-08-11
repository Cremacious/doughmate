/**
 * Doughmate design tokens — "Proof" system, v2.
 * Consume tokens everywhere, never hardcode. Names are stable so a themes shop
 * can swap the values later.
 *
 * A small block of LEGACY aliases at the bottom keeps not-yet-migrated screens
 * compiling during the redesign. Remove them once every screen is on the new
 * system (redesign phase 6).
 */

export type ThemeMode = 'light' | 'dark';

export const palettes = {
  light: {
    bgCanvas: '#FFF7EF',
    bgSurface: '#FFFFFF',
    bgSunken: '#F6E9DC',
    border: '#EADBCB',
    textInk: '#2C1E17',
    textSoft: '#6F5A4C',
    textFaint: '#A08D7C',
    primary: '#F2603C',
    primaryPressed: '#D84D2C',
    primaryText: '#C24A26',
    primaryWash: '#FFF3E8',
    onPrimary: '#FFF9F4',
    accentButter: '#FFC24B',
    proofTeal: '#3E9C8F',
    proofTealWash: '#E3F1EE',
    proofTealText: '#2C7A70',
    success: '#3F8F5F',
    warning: '#E0A020',
    danger: '#D64545',
    dangerWash: '#FBE9E7',
    pro: '#8E4B7A',
    proWash: '#F6E8F2',
    grabber: '#D9C6B2',
    scrim: 'rgba(44,30,23,0.42)',
    toastBg: '#2C1E17',
    toastText: '#FFF7EF',
    samOutline: '#2C1E17',
    samCrust: '#E9B478',
    samCrustTop: '#E9B478',
  },
  dark: {
    bgCanvas: '#17120F',
    bgSurface: '#211A16',
    bgSunken: '#1B1512',
    border: '#342922',
    textInk: '#F7ECE2',
    textSoft: '#C0AA9B',
    textFaint: '#8E7A6C',
    primary: '#FF7A52',
    primaryPressed: '#E2643D',
    primaryText: '#FF9C7B',
    primaryWash: '#3B231A',
    onPrimary: '#2A1109',
    accentButter: '#FFCD6B',
    proofTeal: '#56B8A9',
    proofTealWash: '#20302D',
    proofTealText: '#7ED3C5',
    success: '#6FBF89',
    warning: '#F0B84A',
    danger: '#F16B6B',
    dangerWash: '#3A1F1E',
    pro: '#C87BB0',
    proWash: '#32202C',
    grabber: '#4B3B31',
    scrim: 'rgba(0,0,0,0.55)',
    toastBg: '#F7ECE2',
    toastText: '#211A16',
    samOutline: '#12100E',
    samCrust: '#E9B478',
    samCrustTop: '#E9B478',
  },
} as const;

/** Fonts to load with expo-font: Gabarito, Nunito Sans, Space Grotesk (Google, OFL). */
export const typography = {
  display: {
    xl: { fontFamily: 'Gabarito_600SemiBold', fontSize: 40, lineHeight: 44 },
    lg: { fontFamily: 'Gabarito_600SemiBold', fontSize: 32, lineHeight: 38 },
    md: { fontFamily: 'Gabarito_600SemiBold', fontSize: 26, lineHeight: 32 },
  },
  heading: { fontFamily: 'Gabarito_600SemiBold', fontSize: 20, lineHeight: 26 },
  title: { fontFamily: 'NunitoSans_700Bold', fontSize: 17, lineHeight: 22 },
  body: {
    lg: { fontFamily: 'NunitoSans_400Regular', fontSize: 17, lineHeight: 26 },
    md: { fontFamily: 'NunitoSans_400Regular', fontSize: 15, lineHeight: 22 },
    sm: { fontFamily: 'NunitoSans_400Regular', fontSize: 13, lineHeight: 19 },
  },
  label: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.96,
    textTransform: 'uppercase' as const,
  },
  numeric: {
    hero: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 64, lineHeight: 64 },
    lg: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 30, lineHeight: 34 },
    sm: { fontFamily: 'SpaceGrotesk_500Medium', fontSize: 15, lineHeight: 20 },
  },
} as const;

/** Floured fingers mode multiplies every font size and line height, and raises targets. */
export const fontScale = { normal: 1, flouredFingers: 1.25 } as const;
export const touchTarget = { normal: 44, flouredFingers: 56 } as const;

export const spacing = {
  '2xs': 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 56,
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, '2xl': 28, pill: 999 } as const;

export const shadow = {
  none: {},
  sm: {
    shadowColor: '#4A2A18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#4A2A18',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4A2A18',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 36,
    elevation: 8,
  },
  sheet: {
    shadowColor: '#261608',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 12,
  },
} as const;

/** Three springs only. Reduced motion swaps every one for a 120ms opacity fade. */
export const spring = {
  quick: { stiffness: 320, damping: 22, mass: 1 },
  medium: { stiffness: 210, damping: 18, mass: 1 },
  soft: { stiffness: 130, damping: 20, mass: 1.1 },
} as const;

export const duration = { instant: 120, fast: 200, normal: 320, slow: 480 } as const;

export const easing = {
  standard: [0.32, 0.72, 0, 1] as const,
  enter: [0, 0, 0.2, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
} as const;

/** Named haptics, unchanged from v1. */
export const haptic = {
  tap: 'Light',
  select: 'Selection',
  pop: 'Medium',
  success: 'NotificationSuccess',
  warning: 'NotificationWarning',
} as const;

export const sheet = {
  radius: radius['2xl'],
  grabber: { width: 40, height: 5, radius: radius.pill },
  heights: { half: 0.6, tall: 0.9, full: 1 },
  dismissThresholdPx: 120,
  dismissVelocity: 800,
} as const;

export const theme = {
  palettes,
  typography,
  fontScale,
  touchTarget,
  spacing,
  radius,
  shadow,
  spring,
  duration,
  easing,
  haptic,
  sheet,
} as const;

export type Theme = typeof theme;
export type Palette = typeof palettes.light;
