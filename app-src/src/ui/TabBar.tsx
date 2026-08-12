// Proof tab bar. Floating card with four items; the active item gets a primary
// wash pill behind its icon so state reads without relying on colour alone.
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { radius, shadow, spacing } from '@/theme';
import { Icon, type IconName } from './Icon';

const TAB_ICON: Record<string, IconName> = {
  convert: 'convert',
  recipes: 'recipes',
  starters: 'starters',
  swaps: 'swaps',
};

// Minimal shape of the props Expo Router passes to a custom tabBar. The real
// BottomTabBarProps is structurally compatible with this subset.
export interface AppTabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

export function AppTabBar({ state, navigation }: AppTabBarProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 14 }]}>
      <View
        style={[
          styles.bar,
          shadow.md,
          { backgroundColor: palette.bgSurface, borderColor: palette.border },
        ]}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const iconName = TAB_ICON[route.name] ?? 'convert';
          const color = focused ? palette.primary : palette.textFaint;
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
                style={[styles.pill, focused ? { backgroundColor: palette.primaryWash } : null]}
              >
                <Icon name={iconName} size={20} color={color} />
              </View>
              <Text style={{ fontFamily: 'NunitoSans_700Bold', fontSize: 11, color }}>
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
  wrap: { position: 'absolute', left: spacing.md, right: spacing.md },
  bar: {
    flexDirection: 'row',
    borderRadius: 26,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  pill: {
    width: 44,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppTabBar;
