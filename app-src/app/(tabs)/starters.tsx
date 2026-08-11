// Starters tab. Each starter shows a countdown to its next feed and a Feed now
// button. Add, feed, and delete (with undo); everything persists.
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/AdBanner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { FREE_STARTER_LIMIT } from '@/lib/limits';
import { usePro } from '@/state/pro';
import { type Starter, useStarters } from '@/state/starters';
import { shadow, spacing, typography } from '@/theme';

const HOUR_MS = 3600000;

interface FeedStatus {
  ready: boolean;
  label: string;
}

function useFeedStatus() {
  const { t } = useTranslation();
  return (starter: Starter, now: number): FeedStatus => {
    if (starter.lastFedAt === null) {
      return { ready: true, label: t('starters.never_fed') };
    }
    const msLeft = starter.lastFedAt + starter.intervalHours * HOUR_MS - now;
    if (msLeft <= 0) {
      return { ready: true, label: t('starters.countdown_ready') };
    }
    const minutes = Math.ceil(msLeft / 60000);
    if (minutes < 60) {
      return { ready: false, label: t('starters.countdown_soon', { minutes }) };
    }
    return {
      ready: false,
      label: t('starters.countdown_future', { hours: Math.round(msLeft / HOUR_MS) }),
    };
  };
}

export default function StartersScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { starters, feedStarter, removeStarter, restoreStarter } = useStarters();
  const { isPro } = usePro();
  const statusFor = useFeedStatus();

  const addStarter = () => {
    if (!isPro && starters.length >= FREE_STARTER_LIMIT) {
      router.push('/paywall');
    } else {
      router.push('/starter-new');
    }
  };

  const [now, setNow] = useState(() => Date.now());
  const [deleted, setDeleted] = useState<Starter | null>(null);
  const [fedMsg, setFedMsg] = useState<string | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the countdowns roughly current.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const onFeed = (starter: Starter) => {
    // The Feed button already fires the success haptic. feedStarter stamps the time.
    feedStarter(starter.id);
    setFedMsg(t('starters.toast_fed', { name: starter.name }));
    if (fedTimer.current) {
      clearTimeout(fedTimer.current);
    }
    fedTimer.current = setTimeout(() => setFedMsg(null), 2500);
  };

  const onDelete = (starter: Starter) => {
    triggerHaptic('warning');
    setDeleted(starter);
    removeStarter(starter.id);
    if (deleteTimer.current) {
      clearTimeout(deleteTimer.current);
    }
    deleteTimer.current = setTimeout(() => setDeleted(null), 4000);
  };

  const onUndo = () => {
    if (deleted) {
      restoreStarter(deleted);
    }
    setDeleted(null);
    if (deleteTimer.current) {
      clearTimeout(deleteTimer.current);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[typography.display.md, { color: palette.choc }]}>
            {t('starters.title')}
          </Text>
          <Button label={t('starters.button_add')} variant="secondary" onPress={addStarter} />
        </View>

        {starters.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[typography.body.lg, styles.center, { color: palette.chocSoft }]}>
              {t('starters.empty_title')}
            </Text>
            <Text style={[typography.body.md, styles.center, { color: palette.chocSoft }]}>
              {t('starters.empty_body')}
            </Text>
          </View>
        ) : (
          starters.map((starter) => {
            const status = statusFor(starter, now);
            return (
              <Card key={starter.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={[typography.heading, { color: palette.choc }]}>{starter.name}</Text>
                  <Text
                    style={[
                      typography.body.lg,
                      { color: status.ready ? palette.crust : palette.chocSoft },
                    ]}
                  >
                    {status.label}
                  </Text>
                </View>
                {starter.feedCount > 0 ? (
                  <Text style={[typography.body.sm, { color: palette.chocSoft }]}>
                    {t('starters.fed_count', { count: starter.feedCount })}
                  </Text>
                ) : null}
                <View style={styles.cardActions}>
                  <Button
                    label={t('starters.button_feed_now')}
                    variant="primary"
                    haptic="success"
                    onPress={() => onFeed(starter)}
                  />
                  <Pressable accessibilityRole="button" onPress={() => onDelete(starter)}>
                    <Text style={[typography.body.md, { color: palette.jam }]}>
                      {t('recipes.button_delete')}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            );
          })
        )}

        <AdBanner />
      </ScrollView>

      {deleted ? (
        <View
          style={[
            styles.banner,
            shadow.lg,
            { backgroundColor: bg.elevated, bottom: insets.bottom + 78 },
          ]}
        >
          <Text style={[typography.body.md, { color: palette.choc }]}>
            {t('recipes.toast_deleted')}
          </Text>
          <Pressable accessibilityRole="button" onPress={onUndo}>
            <Text style={[typography.body.lg, { color: palette.crust }]}>
              {t('recipes.button_undo')}
            </Text>
          </Pressable>
        </View>
      ) : fedMsg ? (
        <View
          style={[
            styles.banner,
            shadow.lg,
            { backgroundColor: bg.elevated, bottom: insets.bottom + 78 },
          ]}
        >
          <Text style={[typography.body.md, { color: palette.choc }]}>{fedMsg}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['3xl'] * 2, gap: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  empty: { alignItems: 'center', gap: spacing.sm, marginTop: spacing['3xl'] },
  center: { textAlign: 'center' },
  card: { gap: spacing.sm },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  banner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
  },
});
