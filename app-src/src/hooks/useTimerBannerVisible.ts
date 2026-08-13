// Whether the floating timers pill is currently on screen, and how much top
// room it needs. Shared by the pill itself, the toast (so it stacks below the
// pill), and the tab Screen scaffold (so its title drops below the pill).
import { usePathname } from 'expo-router';

import { planProgress } from '@/lib/schedule';
import { useBakePlan } from '@/state/bakePlan';
import { useTimers } from '@/state/timers';

import { useNow } from './useNow';

/** Vertical space the pill occupies below the safe area top, in points. */
export const TIMER_BANNER_SPACE = 66;

/** True when the timers pill is showing: a timer is running or a plan is armed
 *  and not done, and we are not on a screen that shows the timer in context. */
export function useTimerBannerVisible(): boolean {
  const now = useNow();
  const { timers } = useTimers();
  const { plan } = useBakePlan();
  const pathname = usePathname();

  if (pathname === '/timers' || pathname === '/bake-plan' || pathname.endsWith('/cook')) {
    return false;
  }
  if (timers.length > 0) {
    return true;
  }
  return plan != null && !planProgress(plan.steps, plan.finishAt, now).done;
}
