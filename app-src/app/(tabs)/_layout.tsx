// Four tabs with the floating Proof tab bar. Sam no longer lives here; he shows
// up contextually instead.
import { Tabs } from 'expo-router';

import { AppTabBar } from '@/ui/TabBar';
import { TimerPill } from '@/ui/TimerPill';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <>
          <TimerPill />
          <AppTabBar {...props} />
        </>
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="convert" />
      <Tabs.Screen name="recipes" />
      <Tabs.Screen name="starters" />
      <Tabs.Screen name="swaps" />
    </Tabs>
  );
}
