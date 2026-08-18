/**
 * Doughmate design tokens — "Fresh Bake", v3.
 * Drop-in replacement for app-src/src/theme.ts.
 *
 * Every key that existed in the Proof v2 file still exists, so no screen breaks
 * on paste. New keys are grouped at the end of each palette. Consume tokens
 * everywhere, never hardcode. Names are stable so a themes shop can swap values.
 *
 * Fonts to load with expo-font before first paint:
 *   BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold
 *   NunitoSans_400Regular, NunitoSans_700Bold, NunitoSans_800ExtraBold
 *   SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold
 */

export type ThemeMode = 'light' | 'dark';

export const palettes = {
  light: {
    // Surfaces
    bgCanvas: '#F7EFE1',
    bgSurface: '#FFFDF8',
    bgSunken: '#EFE2CE',
    bgRaised: '#FFFDF8',

    // Lines. `outline` is the 2px ink stroke that defines Fresh Bake; `border`
    // is the soft 1.5px line used on quiet surfaces and dividers.
    outline: '#241611',
    border: '#DCC9B2',
    borderField: '#E4D3BC',
    divider: '#EFE2CE',

    // Text
    textInk: '#241611',
    textSoft: '#6B5344',
    textFaint: '#9C8776',
    textDisabled: '#B5A08C',

    // Primary (tomato)
    primary: '#F2603C',
    primaryPressed: '#D84D2C',
    primaryText: '#C24A26',
    primaryWash: '#FFF3E8',
    onPrimary: '#FFF9F4',
    onPrimarySoft: '#FFD9C8',

    // Butter
    accentButter: '#FFC24B',
    butterWash: '#FFF1D6',
    butterText: '#8A6414',
    onButter: '#241611',
    onButterSoft: '#7A5A12',
    onButterBody: '#5E4526',

    // Proof teal
    proofTeal: '#3E9C8F',
    proofTealWash: '#E3F1EE',
    proofTealText: '#2C7A70',
    onTeal: '#FFF9F4',
    onTealSoft: '#CDEBE5',

    // Pro plum
    pro: '#8E4B7A',
    proWash: '#F6E8F2',
    onPro: '#FFF9F4',
    onProSoft: '#F0C8E4',

    // Status
    success: '#3F8F5F',
    warning: '#E0A020',
    danger: '#D64545',
    dangerWash: '#FBE9E7',

    // Chrome
    grabber: '#C9B49A',
    scrim: 'rgba(36,22,17,0.50)',
    tabShelf: '#241611',
    tabShelfIdle: '#A8917C',
    tabShelfActive: '#FFC24B',
    toastBg: '#241611',
    toastText: '#FFF9F4',
    toastAction: '#FFC24B',

    // Cook mode inverts on both themes.
    cookCanvas: '#241611',
    cookFooter: '#1B120E',
    cookGhost: '#3D2C22',
    cookDim: '#5A4436',

    // Sam
    samOutline: '#241611',
    samCrust: '#E9B478',
    samCrustTop: '#E9B478',
    samCrustPale: '#FFF3DC',
  },
  dark: {
    bgCanvas: '#17120F',
    bgSurface: '#211A16',
    bgSunken: '#1B1512',
    bgRaised: '#2A2018',

    // On dark there is no ink stroke: `outline` collapses to the soft border and
    // hard shadows are omitted. Hierarchy comes from fill weight instead.
    outline: '#342922',
    border: '#342922',
    borderField: '#342922',
    divider: '#2A2018',
    borderStrong: '#4B3B31',

    textInk: '#F7ECE2',
    textSoft: '#C0AA9B',
    textFaint: '#8E7A6C',
    textDisabled: '#6A5A4E',

    primary: '#FF7A52',
    primaryPressed: '#E2643D',
    primaryText: '#FF9C7B',
    primaryWash: '#3B231A',
    onPrimary: '#2A1109',
    onPrimarySoft: '#3B1810',

    accentButter: '#FFCD6B',
    butterWash: '#3A2C10',
    butterText: '#FFCD6B',
    onButter: '#2A1109',
    onButterSoft: '#6B4A0A',
    onButterBody: '#3A2A08',

    proofTeal: '#56B8A9',
    proofTealWash: '#20302D',
    proofTealText: '#7ED3C5',
    onTeal: '#0E2C28',
    onTealSoft: '#123B36',

    pro: '#C87BB0',
    proWash: '#32202C',
    onPro: '#2A1109',
    onProSoft: '#3D1932',

    success: '#6FBF89',
    warning: '#F0B84A',
    danger: '#F16B6B',
    dangerWash: '#3A1F1E',

    grabber: '#4B3B31',
    scrim: 'rgba(0,0,0,0.55)',
    tabShelf: '#211A16',
    tabShelfIdle: '#8E7A6C',
    tabShelfActive: '#FFCD6B',
    toastBg: '#F7ECE2',
    toastText: '#211A16',
    toastAction: '#D2622F',

    cookCanvas: '#241611',
    cookFooter: '#1B120E',
    cookGhost: '#3D2C22',
    cookDim: '#5A4436',

    samOutline: '#12100E',
    samCrust: '#E9B478',
    samCrustTop: '#E9B478',
    samCrustPale: '#FFE3B0',
  },
} as const;

/**
 * Display and heading use Bricolage Grotesque with negative tracking.
 * Every number the baker reads is Space Grotesk. Body and labels are Nunito Sans.
 */
export const typography = {
  display: {
    xl: {
      fontFamily: 'BricolageGrotesque_700Bold',
      fontSize: 42,
      lineHeight: 44,
      letterSpacing: -0.84,
    },
    lg: {
      fontFamily: 'BricolageGrotesque_700Bold',
      fontSize: 36,
      lineHeight: 38,
      letterSpacing: -0.72,
    },
    md: {
      fontFamily: 'BricolageGrotesque_700Bold',
      fontSize: 32,
      lineHeight: 34,
      letterSpacing: -0.64,
    },
  },
  heading: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 25,
    lineHeight: 28,
    letterSpacing: -0.38,
  },
  subheading: { fontFamily: 'BricolageGrotesque_700Bold', fontSize: 20, lineHeight: 24 },
  title: { fontFamily: 'NunitoSans_700Bold', fontSize: 17, lineHeight: 22 },
  body: {
    lg: { fontFamily: 'NunitoSans_400Regular', fontSize: 17, lineHeight: 26 },
    md: { fontFamily: 'NunitoSans_400Regular', fontSize: 15, lineHeight: 22 },
    sm: { fontFamily: 'NunitoSans_400Regular', fontSize: 13, lineHeight: 19 },
  },
  /** Uppercase eyebrow. Always paired with a colour that carries meaning. */
  label: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  labelSm: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
  /** Button and chip faces are heavier than body. */
  button: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 17, lineHeight: 22 },
  chip: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 14, lineHeight: 18 },
  numeric: {
    hero: {
      fontFamily: 'SpaceGrotesk_700Bold',
      fontSize: 76,
      lineHeight: 72,
      letterSpacing: -2.28,
    },
    lg: {
      fontFamily: 'SpaceGrotesk_700Bold',
      fontSize: 30,
      lineHeight: 34,
      letterSpacing: -0.6,
    },
    md: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, lineHeight: 26 },
    sm: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, lineHeight: 20 },
  },
} as const;

/** Floured fingers multiplies every font size and line height, and raises targets. */
export const fontScale = { normal: 1, flouredFingers: 1.25 } as const;
export const touchTarget = { normal: 44, flouredFingers: 56 } as const;

/** Fresh Bake runs tighter than Proof v2. Same keys, new values. */
export const spacing = {
  '2xs': 4,
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  '2xl': 30,
  '3xl': 40,
  '4xl': 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  hero: 26,
  sheet: 30,
  pill: 999,
} as const;

/** Stroke weights. `ink` is the defining 2px outline, light mode only. */
export const stroke = { hairline: 1, soft: 1.5, ink: 2, inkHeavy: 2.5, rule: 3 } as const;

/**
 * Hard offset shadows, no blur. iOS honours shadowRadius 0; Android elevation
 * cannot draw an offset hard shadow, so render these with the <HardShadow>
 * wrapper (an absolutely positioned sibling View offset behind the content) so
 * both platforms match. See the handoff doc.
 */
export const hardShadow = {
  none: { x: 0, y: 0, color: 'transparent' },
  control: { x: 3, y: 3, color: '#241611' },
  hero: { x: 5, y: 5, color: '#241611' },
  card: { x: 4, y: 4, color: 'rgba(36,22,17,0.14)' },
  pressed: { x: 1, y: 1, color: '#241611' },
} as const;

/** Blurred shadows survive only where Fresh Bake has no ink outline: dark mode FABs and toasts. */
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#241611',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#241611',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  lg: {
    shadowColor: '#241611',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 36,
    elevation: 8,
  },
  sheet: {
    shadowColor: '#160D08',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.24,
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

/**
 * Press behaviour for anything with a hard shadow: translate down and right by
 * `press.travel` while the shadow shrinks to hardShadow.pressed, so the control
 * appears to sit down into its own shadow. Reduced motion skips the translate
 * and drops opacity to 0.9 instead.
 */
export const press = { travel: 3, duration: duration.instant, reducedOpacity: 0.9 } as const;

/** Named haptics, unchanged. */
export const haptic = {
  tap: 'Light',
  select: 'Selection',
  pop: 'Medium',
  success: 'NotificationSuccess',
  warning: 'NotificationWarning',
} as const;

export const sheet = {
  radius: radius.sheet,
  grabber: { width: 46, height: 6, radius: radius.pill },
  heights: { half: 0.6, tall: 0.9, full: 1 },
  dismissThresholdPx: 120,
  dismissVelocity: 800,
} as const;

/** Free tier ad slot. Sits on the canvas between content and the tab shelf. */
export const adSlot = { height: 66, gutter: 14, gapToShelf: 12 } as const;

export const theme = {
  palettes,
  typography,
  fontScale,
  touchTarget,
  spacing,
  radius,
  stroke,
  hardShadow,
  shadow,
  spring,
  duration,
  easing,
  press,
  haptic,
  sheet,
  adSlot,
} as const;

export type Theme = typeof theme;
export type Palette = typeof palettes.light;
