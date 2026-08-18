// Four tabs on the flush Fresh Bake shelf. Sam no longer lives here; he shows up
// contextually instead. The active timers pill is mounted at the root so it floats
// over every screen, not just the tabs.
import { Tabs } from 'expo-router';

import { AppTabBar } from '@/ui/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="convert" />
      <Tabs.Screen name="recipes" />
      <Tabs.Screen name="starters" />
      <Tabs.Screen name="swaps" />
    </Tabs>
  );
}
