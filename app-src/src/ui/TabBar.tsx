// Fresh Bake tab bar. Not floating any more. A floating bar plus a floating full width
// button stacked two layers of chrome over the list, so the bar is now a flush ink
// shelf sitting on the bottom edge and the screen level create action is a corner FAB.
//
// The butter pill is one element that travels, not four fills that switch on and off.
// A pill that slides on spring.quick reads as the same object moving to the tab you
// picked; four conditional fills read as one thing vanishing and another appearing.
// It is the same idea as the onboarding dots, and they should feel like siblings.
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { triggerHaptic } from '@/lib/haptics';
import { radius, spacing, spring } from '@/theme';
import { Icon, type IconName } from './Icon';

const TAB_ICON: Record<string, IconName> = {
  convert: 'convert',
  recipes: 'recipes',
  starters: 'starters',
  swaps: 'swaps',
};

/** Active icon pill, normal and floured fingers. */
const PILL = { normal: { width: 46, height: 32 }, floured: { width: 56, height: 38 } } as const;

/** The shelf's horizontal padding. The travelling pill is positioned off it. */
const SHELF_GUTTER = spacing.md;
const LABEL = { normal: 11, floured: 13 } as const;

/**
 * Height of the shelf above the bottom safe inset: padding, the icon pill, the gap
 * and the label. Screen, Fab and AdSlot all anchor off this, so it lives here with
 * the metrics it is derived from.
 */
export function tabShelfHeight(fontScale: number): number {
  const floured = fontScale > 1;
  const pillHeight = floured ? PILL.floured.height : PILL.normal.height;
  const labelHeight = Math.round((floured ? LABEL.floured : LABEL.normal) * 1.36);
  return 10 + pillHeight + 3 + labelHeight + 10;
}

// Minimal shape of the props Expo Router passes to a custom tabBar. The real
// BottomTabBarProps is structurally compatible with this subset.
export interface AppTabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

export function AppTabBar({ state, navigation }: AppTabBarProps) {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const floured = fontScale > 1;
  const pill = floured ? PILL.floured : PILL.normal;
  const labelSize = floured ? LABEL.floured : LABEL.normal;

  // Derived, not measured. The shelf spans the full width and its padding is a token,
  // so the width of one tab is arithmetic — and arithmetic is available on the first
  // render, where an onLayout is not. A pill that has to wait for a measurement is a
  // pill that is missing on the frame the app opens.
  const { width: windowWidth } = useWindowDimensions();
  const itemWidth = (windowWidth - SHELF_GUTTER * 2) / Math.max(state.routes.length, 1);

  const restingX = itemWidth * state.index + (itemWidth - pill.width) / 2;

  // Seeded at rest rather than at zero, so the first frame already has the pill under
  // the tab you are on. The effect below is what makes every later index change a
  // journey; on mount it springs to where the pill already is, which is no motion.
  const x = useSharedValue(restingX);

  useEffect(() => {
    x.value = reduced ? restingX : withSpring(restingX, spring.quick);
  }, [restingX, reduced, x]);

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={[
        styles.shelf,
        { backgroundColor: palette.tabShelf, paddingBottom: insets.bottom + 10 },
      ]}
    >
      <View style={styles.row}>
        {/* Behind the items, so every icon draws on top of the fill as it passes. */}
        <Animated.View
          pointerEvents="none"
          style={[styles.movingPill, pill, { backgroundColor: palette.tabShelfActive }, pillStyle]}
        />

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const iconName = TAB_ICON[route.name] ?? 'convert';
          const color = focused ? palette.onButter : palette.tabShelfIdle;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              onPress={() => {
                triggerHaptic('select');
                if (!focused) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.item}
            >
              <View style={[styles.pillSlot, pill]}>
                <Icon name={iconName} size={floured ? 24 : 20} color={color} />
              </View>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: 'NunitoSans_800ExtraBold',
                  fontSize: labelSize,
                  color: focused ? palette.tabShelfActive : palette.tabShelfIdle,
                }}
              >
                {t(`tabs.${route.name}` as 'tabs.convert')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: {
    // Flush to the bottom edge, so only the top corners round.
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    paddingTop: 10,
    paddingHorizontal: spacing.md,
  },
  row: { flexDirection: 'row' },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  /** Holds the icon and reserves the pill's box. The fill itself is the travelling one. */
  pillSlot: { alignItems: 'center', justifyContent: 'center' },
  movingPill: { position: 'absolute', left: 0, top: 0, borderRadius: radius.pill },
});

export default AppTabBar;
