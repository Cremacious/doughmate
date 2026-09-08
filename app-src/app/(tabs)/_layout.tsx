// Four tabs on the flush Fresh Bake shelf. Sam no longer lives here; he shows up
// contextually instead. The active timers pill is mounted at the root so it floats
// over every screen, not just the tabs.
//
// Tab travel is 220ms on easing.standard. The outgoing screen fades and slides
// against the direction of travel while the incoming one arrives from ahead, so the
// two are never both sitting still. The shelf itself does not move: it is chrome.
import { Tabs } from 'expo-router';
import { Animated, Easing } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { easing, transition } from '@/theme';
import { AppTabBar } from '@/ui/TabBar';

/**
 * React Navigation hands each scene one signed progress — negative to the left of
 * the active tab, positive to the right — rather than an in/out flag, so the
 * asymmetry the spec asks for falls out of the sign: moving forward, the screen
 * being left travels 26px while the one arriving comes from 34px ahead. Moving back
 * swaps the two, which is eight points nobody has ever noticed.
 */
function forShelfShift({ current }: { current: { progress: Animated.Value } }) {
  return {
    sceneStyle: {
      opacity: current.progress.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 1, 0],
      }),
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-transition.tabOutPx, 0, transition.tabInPx],
          }),
        },
      ],
    },
  };
}

/** Reduced motion keeps the cross fade and drops the travel. */
function forShelfFade({ current }: { current: { progress: Animated.Value } }) {
  return {
    sceneStyle: {
      opacity: current.progress.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 1, 0],
      }),
    },
  };
}

export default function TabsLayout() {
  const reduced = useReducedMotion();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: reduced ? 'fade' : 'shift',
        sceneStyleInterpolator: reduced ? forShelfFade : forShelfShift,
        transitionSpec: {
          animation: 'timing',
          config: {
            duration: reduced ? transition.reducedMs : transition.tabMs,
            easing: Easing.bezier(...easing.standard),
          },
        },
      }}
    >
      <Tabs.Screen name="convert" />
      <Tabs.Screen name="recipes" />
      <Tabs.Screen name="starters" />
      <Tabs.Screen name="swaps" />
    </Tabs>
  );
}
