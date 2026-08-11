// Keeps scheduled feed reminders in sync with the starters and the reminders
// setting. Renders nothing. No-op on web (notifications are native only).
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import {
  cancelAllFeedReminders,
  ensureNotificationPermission,
  reconcileFeedReminders,
} from '@/lib/notifications';
import { useSettings } from '@/state/settings';
import { useStarters } from '@/state/starters';

const HOUR_MS = 3600000;

export function ReminderSync() {
  const { starters } = useStarters();
  const { settings } = useSettings();
  const { t } = useTranslation();

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    let active = true;
    void (async () => {
      if (!settings.starterReminders) {
        await cancelAllFeedReminders();
        return;
      }
      const granted = await ensureNotificationPermission();
      if (!granted || !active) {
        return;
      }
      const reminders = starters.map((starter) => {
        const base = starter.lastFedAt ?? starter.createdAt;
        return {
          id: starter.id,
          title: t('app.name'),
          body: t('starters.notifications.ready_generic', { name: starter.name }),
          fireAtMs: base + starter.intervalHours * HOUR_MS,
        };
      });
      await reconcileFeedReminders(reminders);
    })();
    return () => {
      active = false;
    };
  }, [starters, settings.starterReminders, t]);

  return null;
}

export default ReminderSync;
