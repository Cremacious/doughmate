// Root layout. Sets up fonts, i18n, settings, gesture handling, safe areas, status bar.
import '@/i18n';

import { Gabarito_600SemiBold } from '@expo-google-fonts/gabarito';
import { NunitoSans_400Regular, NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans';
import { SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ReminderSync } from '@/components/ReminderSync';
import { TimerSync } from '@/components/TimerSync';
import { useAppTheme } from '@/hooks/useAppTheme';
import { initAds } from '@/lib/ads';
import { BakesProvider } from '@/state/bakes';
import { ProProvider } from '@/state/pro';
import { RecipesProvider } from '@/state/recipes';
import { SamMoodProvider } from '@/state/samMood';
import { SettingsProvider } from '@/state/settings';
import { StartersProvider } from '@/state/starters';
import { TimersProvider } from '@/state/timers';
import { ToastProvider } from '@/ui/Toast';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Gabarito_600SemiBold,
    NunitoSans_400Regular,
    NunitoSans_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ProProvider>
            <RecipesProvider>
              <BakesProvider>
                <TimersProvider>
                  <StartersProvider>
                    <SamMoodProvider>
                      <ToastProvider>
                        <ThemedApp />
                      </ToastProvider>
                    </SamMoodProvider>
                  </StartersProvider>
                </TimersProvider>
              </BakesProvider>
            </RecipesProvider>
          </ProProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedApp() {
  const { palette, isDark } = useAppTheme();

  useEffect(() => {
    initAds();
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.bgCanvas },
        }}
      >
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="recipe-new"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="recipe/[id]/cook"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="bake-new"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="starter-new"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="starter/[id]"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="timers"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
      <ReminderSync />
      <TimerSync />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
