// Root layout. Sets up i18n, gesture handling, safe areas, and the status bar.
import '@/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';

export default function RootLayout() {
  const { bg, isDark } = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: bg.primary },
          }}
        >
          <Stack.Screen name="scaler" options={{ presentation: 'modal' }} />
          <Stack.Screen name="more-tools" options={{ presentation: 'modal' }} />
          <Stack.Screen name="pan" options={{ presentation: 'modal' }} />
          <Stack.Screen name="oven" options={{ presentation: 'modal' }} />
          <Stack.Screen name="yeast" options={{ presentation: 'modal' }} />
          <Stack.Screen name="egg" options={{ presentation: 'modal' }} />
          <Stack.Screen name="butter" options={{ presentation: 'modal' }} />
          <Stack.Screen name="substitutions" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
