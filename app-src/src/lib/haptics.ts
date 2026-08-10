// The only place expo-haptics is called. Screens use the five named haptics
// from theme.ts (tap, select, pop, success, warning), never raw Haptics calls.
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { haptic } from '@/theme';

export type HapticName = keyof typeof haptic;

// Toggled by the settings store. Defaults on until told otherwise.
let hapticsEnabled = true;
export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

export function triggerHaptic(name: HapticName): void {
  // Haptics are a native affordance; skip on web or when the baker turned them off.
  if (Platform.OS === 'web' || !hapticsEnabled) {
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
