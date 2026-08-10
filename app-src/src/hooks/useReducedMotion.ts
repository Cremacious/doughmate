// True when animations should be minimized: either the OS setting or the app
// setting asks for it. Every animation should check this before bouncing.
import { useReducedMotion as useSystemReducedMotion } from 'react-native-reanimated';

import { useSettings } from '@/state/settings';

export function useReducedMotion(): boolean {
  const system = useSystemReducedMotion();
  const { settings } = useSettings();
  return system || settings.reducedMotion;
}
