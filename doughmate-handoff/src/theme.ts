/**
 * Doughmate design tokens.
 * Every component consumes from here. Never hardcode raw values in components.
 *
 * Usage:
 *   import { colors, typography, spacing, radius, shadow, spring, haptic } from './theme';
 */

export const colors = {
  // Light mode (default)
  light: {
    crust: '#C9975B',        // Primary brown
    crustDark: '#8B5A2B',    // Deeper crust
    crustLight: '#D9A76B',   // Highlight crust
    cream: '#FBF5EA',        // Background
    dough: '#F0E4D0',        // Card / muted bg
    butter: '#FFD97D',       // Accent yellow
    jam: '#E36A6A',          // CTA red
    jamDark: '#C15656',      // CTA red pressed
    choc: '#4A3728',         // Text
    chocSoft: '#6B5340',     // Secondary text
    steam: '#F5EDE0',        // Softer bg
    leaf: '#8FA96B',         // Success green (rarely used)
  },
  // Dark mode
  dark: {
    crust: '#D9A76B',        // Warmer in dark
    crustDark: '#B58548',
    crustLight: '#E6BA7C',
    cream: '#F5E9D3',        // Text (inverted from bg role)
    dough: '#2A2118',        // Card bg
    butter: '#FFD97D',       // Accent stays warm
    jam: '#E36A6A',
    jamDark: '#F0857D',      // Lighter in dark
    choc: '#F5E9D3',         // Light text on dark
    chocSoft: '#C9B89A',
    steam: '#2A2118',
    leaf: '#A8C084',
  },
  // Background layers per mode
  bg: {
    light: {
      primary: '#FBF5EA',
      elevated: '#FFFFFF',
      subtle: '#F5EDE0',
    },
    dark: {
      primary: '#1F1810',
      elevated: '#2A2118',
      subtle: '#241C15',
    },
  },
} as const;

export const typography = {
  display: {
    xl: { fontFamily: 'Fredoka', fontSize: 48, lineHeight: 56, fontWeight: '600' as const },
    lg: { fontFamily: 'Fredoka', fontSize: 36, lineHeight: 44, fontWeight: '600' as const },
    md: { fontFamily: 'Fredoka', fontSize: 28, lineHeight: 36, fontWeight: '500' as const },
  },
  heading: { fontFamily: 'Fredoka', fontSize: 20, lineHeight: 28, fontWeight: '500' as const },
  body: {
    lg: { fontFamily: 'Nunito', fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
    md: { fontFamily: 'Nunito', fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    sm: { fontFamily: 'Nunito', fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  },
  caption: { fontFamily: 'Nunito', fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  micro: { fontFamily: 'Nunito', fontSize: 10, lineHeight: 14, fontWeight: '400' as const },
  number: {
    hero: { fontFamily: 'SF Mono', fontSize: 64, lineHeight: 72, fontWeight: '600' as const },
    lg: { fontFamily: 'SF Mono', fontSize: 32, lineHeight: 40, fontWeight: '500' as const },
  },
} as const;

export const spacing = {
  '2xs': 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  pill: 999,
} as const;

export const shadow = {
  none: {},
  sm: {
    shadowColor: '#8B5A2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,  // Android
  },
  md: {
    shadowColor: '#8B5A2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#8B5A2B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

/**
 * Spring physics configs for Reanimated 3.
 * Use these three, no others. Every animation in the app should feel like one system.
 *
 * Usage:
 *   import { withSpring } from 'react-native-reanimated';
 *   scale.value = withSpring(1, spring.quick);
 */
export const spring = {
  quick: { stiffness: 300, damping: 20, mass: 1 },     // ~200ms, button squish
  medium: { stiffness: 200, damping: 15, mass: 1 },    // ~300ms, Sam reactions, cards
  soft: { stiffness: 120, damping: 18, mass: 1.2 },    // ~400ms, screen transitions
} as const;

/**
 * Named haptic types. Import expo-haptics and map to these.
 *
 * Usage:
 *   import * as Haptics from 'expo-haptics';
 *   Haptics.impactAsync(haptic.tap);
 */
export const haptic = {
  tap: 'Light',                       // any button press
  select: 'Selection',                // unit picker, tab switch
  pop: 'Medium',                      // result lands, save success
  success: 'NotificationSuccess',     // purchase, milestone
  warning: 'NotificationWarning',     // destructive confirm
} as const;

/**
 * Animation durations for non-spring cases (fades, timing curves).
 */
export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

/**
 * Standard easing curves. Use sparingly — springs are preferred.
 */
export const easing = {
  standard: [0.4, 0, 0.2, 1] as const,
  enter: [0.0, 0, 0.2, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
} as const;

// Convenience export for consumers who want everything
export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadow,
  spring,
  haptic,
  duration,
  easing,
} as const;

export type Theme = typeof theme;
export type ThemeMode = 'light' | 'dark';
