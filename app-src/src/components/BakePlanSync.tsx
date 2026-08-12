// Keeps scheduled bake plan step reminders in sync with the active bake
// plan. Renders nothing. No-op on web (notifications are native only).
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { cancelAllBakePlanNotifications, scheduleBakePlanNotification } from '@/lib/notifications';
import { useBakePlan } from '@/state/bakePlan';

export function BakePlanSync() {
  const { plan } = useBakePlan();
  const { t } = useTranslation();

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    let cancelled = false;
    void (async () => {
      await cancelAllBakePlanNotifications();
      if (cancelled || !plan) {
        return;
      }
      const now = Date.now();
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        if (step && step.startAt > now) {
          await scheduleBakePlanNotification(
            `${plan.id}:${i}`,
            t('bakePlan.notif_title', { step: step.text }),
            t('bakePlan.notif_body', { recipe: plan.recipeName }),
            step.startAt
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plan, t]);

  return null;
}

export default BakePlanSync;
