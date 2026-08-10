// Four bottom tabs with Sam floating above the bar. Sam lives here, in the tab
// layout rather than any single screen, so he stays put as you move between tabs.
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';

const TAB_BAR_HEIGHT = 58;
const SAM_SIZE = 76;

type IoniconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<string, IoniconName> = {
  convert: 'calculator-outline',
  recipes: 'book-outline',
  starters: 'flask-outline',
  settings: 'settings-outline',
};

export default function TabsLayout() {
  const { t } = useTranslation();
  const { palette, bg, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: palette.crust,
          tabBarInactiveTintColor: palette.chocSoft,
          tabBarStyle: {
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 6,
            backgroundColor: bg.elevated,
            borderTopColor: isDark ? palette.dough : palette.steam,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={ICONS[route.name] ?? 'ellipse-outline'} size={size} color={color} />
          ),
        })}
      >
        <Tabs.Screen name="convert" options={{ title: t('tabs.convert') }} />
        <Tabs.Screen name="recipes" options={{ title: t('tabs.recipes') }} />
        <Tabs.Screen name="starters" options={{ title: t('tabs.starters') }} />
        <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
      </Tabs>

      {/* Sam peeks up over the middle of the tab bar. He never blocks taps. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: insets.bottom + TAB_BAR_HEIGHT - 12,
          alignItems: 'center',
        }}
      >
        <Sam size={SAM_SIZE} />
      </View>
    </View>
  );
}
