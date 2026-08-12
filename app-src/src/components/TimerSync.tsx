// Keeps scheduled timer completion notifications in sync with the live
// fermentation timers. Renders nothing. No-op on web (notifications are
// native only).
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import {
  cancelAllTimerNotifications,
  ensureNotificationPermission,
  scheduleTimerNotification,
} from '@/lib/notifications';
import { useTimers } from '@/state/timers';

export function TimerSync() {
  const { timers } = useTimers();
  const { t } = useTranslation();

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    let active = true;
    void (async () => {
      const granted = await ensureNotificationPermission();
      await cancelAllTimerNotifications();
      if (!granted || !active) {
        return;
      }
      const running = timers.filter(
        (timer) => timer.status === 'running' && (timer.endsAt ?? 0) > Date.now()
      );
      for (const timer of running) {
        await scheduleTimerNotification(
          timer.id,
          t('app.name'),
          t('timers.notification_body', { label: timer.label }),
          timer.endsAt ?? Date.now()
        );
      }
    })();
    return () => {
      active = false;
    };
  }, [timers, t]);

  return null;
}

export default TimerSync;
