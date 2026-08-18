// Fresh Bake tab bar. Not floating any more. A floating bar plus a floating full width
// button stacked two layers of chrome over the list, so the bar is now a flush ink
// shelf sitting on the bottom edge and the screen level create action is a corner FAB.
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { radius, spacing } from '@/theme';
import { Icon, type IconName } from './Icon';

const TAB_ICON: Record<string, IconName> = {
  convert: 'convert',
  recipes: 'recipes',
  starters: 'starters',
  swaps: 'swaps',
};

/** Active icon pill, normal and floured fingers. */
const PILL = { normal: { width: 46, height: 32 }, floured: { width: 56, height: 38 } } as const;
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

  const floured = fontScale > 1;
  const pill = floured ? PILL.floured : PILL.normal;
  const labelSize = floured ? LABEL.floured : LABEL.normal;

  return (
    <View
      style={[
        styles.shelf,
        { backgroundColor: palette.tabShelf, paddingBottom: insets.bottom + 10 },
      ]}
    >
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
            <View
              style={[
                styles.pill,
                pill,
                focused ? { backgroundColor: palette.tabShelfActive } : null,
              ]}
            >
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
  );
}

const styles = StyleSheet.create({
  shelf: {
    flexDirection: 'row',
    // Flush to the bottom edge, so only the top corners round.
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    paddingTop: 10,
    paddingHorizontal: spacing.md,
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  pill: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});

export default AppTabBar;
