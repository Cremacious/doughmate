// Starters tab. A list of StarterCards with live feed countdowns, plus a bottom
// anchored Add a starter. Feeding and deleting happen inline on each card.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSamMood } from '@/state/samMood';
import { useStarters } from '@/state/starters';
import { spacing, typography } from '@/theme';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { StarterCard } from '@/ui/StarterCard';
import { Tip } from '@/ui/Tip';
import { useToast } from '@/ui/Toast';

const TICK_MS = 60_000;

export default function StartersScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { starters, feedStarter, removeStarter, restoreStarter } = useStarters();
  const { celebrate } = useSamMood();
  const { show } = useToast();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const add = () => router.push('/starter-new');

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

  if (starters.length === 0) {
    return (
      <Screen
        title={t('tabs.starters')}
        footer={<Button label={t('starters.add_title')} onPress={add} haptic="pop" />}
      >
        <View style={styles.empty}>
          <Sam size={132} />
          <Text style={[typography.display.md, styles.emptyTitle, { color: palette.textInk }]}>
            {t('starters.empty_title')}
          </Text>
          <Text style={[typography.body.md, styles.emptyBody, { color: palette.textSoft }]}>
            {t('starters.empty_body')}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title={t('tabs.starters')}
      footer={<Button label={t('starters.add_title')} onPress={add} haptic="pop" />}
    >
      <Tip id="starters.feed" text={t('tips.starters_feed')} />
      {starters.map((starter) => (
        <StarterCard
          key={starter.id}
          starter={starter}
          now={now}
          onFeed={() => feed(starter.id, starter.name)}
          onDelete={() => remove(starter.id)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingTop: spacing['3xl'], gap: spacing.sm },
  emptyTitle: { textAlign: 'center', marginTop: spacing.md },
  emptyBody: { textAlign: 'center', maxWidth: 280 },
});
