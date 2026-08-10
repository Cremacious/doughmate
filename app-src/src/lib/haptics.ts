// The only place expo-haptics is called. Screens use the five named haptics
// from theme.ts (tap, select, pop, success, warning), never raw Haptics calls.
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { haptic } from '@/theme';

export type HapticName = keyof typeof haptic;

export function triggerHaptic(name: HapticName): void {
  // Haptics are a native affordance; skip them on web.
  if (Platform.OS === 'web') {
    return;
  }
  switch (haptic[name]) {
    case 'Light':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    case 'Medium':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    case 'Selection':
      void Haptics.selectionAsync();
      return;
    case 'NotificationSuccess':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    case 'NotificationWarning':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
  }
}
