// Starters tab. Live feed countdowns, with the first due starter promoted to the
// screen's one hero so the errand is obvious before you have read a word. Adding is
// on the corner FAB; feeding and deleting still happen inline on each card.
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { atLimit, FREE_STARTER_LIMIT } from '@/lib/limits';
import { feedStatus } from '@/lib/starter';
import { usePro } from '@/state/pro';
import { useSamMood } from '@/state/samMood';
import { useStarters } from '@/state/starters';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { StarterCard } from '@/ui/StarterCard';
import { Tip } from '@/ui/Tip';
import { useToast } from '@/ui/Toast';

const TICK_MS = 60_000;

export default function StartersScreen() {
  const { t } = useTranslation();
  const { starters, feedStarter, removeStarter, restoreStarter } = useStarters();
  const { celebrate } = useSamMood();
  const { isPro } = usePro();
  const { show } = useToast();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Gated at the entry point, so the paywall arrives before the form, not after it.
  const add = () =>
    router.push(atLimit(starters.length, FREE_STARTER_LIMIT, isPro) ? '/paywall' : '/starter-new');

  // Exactly one hero per screen: the first starter that is actually hungry.
  const dueIds = useMemo(
    () => starters.filter((s) => feedStatus(s, now).due).map((s) => s.id),
    [starters, now]
  );
  const heroId = dueIds[0];

  const feed = (id: string, name: string) => {
    feedStarter(id);
    celebrate();
    show({ message: t('starters.toast_fed', { name }), variant: 'confirmation' });
  };

  const remove = (id: string) => {
    const starter = starters.find((s) => s.id === id);
    if (!starter) {
      return;
    }
    removeStarter(id);
    show({
      message: t('starters.toast_deleted', { name: starter.name }),
      actionLabel: t('recipes.button_undo'),
      onAction: () => restoreStarter(starter),
    });
  };

  const eyebrow =
    dueIds.length === 0
      ? t('starters.eyebrow_all_fed')
      : t('starters.eyebrow_due', { count: dueIds.length });

  const fab = {
    iconName: 'add' as const,
    onPress: add,
    accessibilityLabel: t('starters.add_starter_action'),
  };

  if (starters.length === 0) {
    return (
      <Screen title={t('tabs.starters')} settingsLabel={t('common.open_settings')} fab={fab}>
        <EmptyState
          headline={t('starters.empty_title')}
          body={t('starters.empty_body')}
          primary={{ label: t('starters.add_starter_action'), onPress: add }}
          secondary={{ label: t('tabs.recipes'), onPress: () => router.push('/recipes') }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      title={t('tabs.starters')}
      eyebrow={eyebrow}
      settingsLabel={t('common.open_settings')}
      fab={fab}
    >
      <Tip id="starters.feed" text={t('tips.starters_feed')} />
      {starters.map((starter) => (
        <StarterCard
          key={starter.id}
          starter={starter}
          now={now}
          hero={starter.id === heroId}
          onFeed={() => feed(starter.id, starter.name)}
          onDelete={() => remove(starter.id)}
          onOpen={() => router.push(`/starter/${starter.id}`)}
        />
      ))}
    </Screen>
  );
}
