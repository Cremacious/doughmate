import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { feedStatus } from '@/lib/starter';
import { starterMood } from '@/lib/starterMood';
import { useSamMood } from '@/state/samMood';
import { useStarters } from '@/state/starters';
import { radius, spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { FeedHeatmap } from '@/ui/FeedHeatmap';
import { StarterSam } from '@/ui/StarterSam';
import { useToast } from '@/ui/Toast';

const TICK_MS = 60_000;

export default function StarterDetailSheet() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getStarter, feedStarter, removeStarter, restoreStarter } = useStarters();
  const { celebrate } = useSamMood();
  const { show } = useToast();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const h = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(h);
  }, []);

  const starter = getStarter(id);
  if (!starter) {
    return (
      <BottomSheet size="tall" onClose={() => router.back()}>
        <View />
      </BottomSheet>
    );
  }

  const mood = starterMood(starter, now);
  const status = feedStatus(starter, now);
  const feeds = starter.feeds ?? [];

  const countdown = status.fresh
    ? t('starters.countdown_fresh')
    : status.due
      ? t('starters.countdown_ready')
      : status.hoursUntil >= 1
        ? t('starters.countdown_future', { hours: status.hoursUntil })
        : t('starters.countdown_soon', { minutes: status.minutesUntil });

  const feed = () => {
    feedStarter(starter.id);
    setNow(Date.now());
    celebrate();
    show({ message: t('starters.toast_fed', { name: starter.name }), variant: 'confirmation' });
  };

  const del = () => {
    removeStarter(starter.id);
    router.back();
    show({
      message: t('starters.toast_deleted', { name: starter.name }),
      actionLabel: t('recipes.button_undo'),
      onAction: () => restoreStarter(starter),
    });
  };

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <View style={styles.headerRow}>
          <Text style={[typography.display.lg, { color: palette.textInk }]}>{starter.name}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('starters.edit')}
            onPress={() => router.push(`/starter-new?id=${starter.id}`)}
            style={[styles.editBtn, { backgroundColor: palette.bgSunken }]}
          >
            <Text style={[typography.title, { color: palette.textInk }]}>
              {`✎ ${t('starters.edit')}`}
            </Text>
          </Pressable>
        </View>
      }
      footer={<Button label={t('starters.button_feed_now')} onPress={feed} haptic="success" />}
    >
      <View style={styles.body}>
        <View style={styles.hero}>
          <StarterSam mood={mood} size={150} />
          <Text style={[typography.heading, { color: palette.proofTeal }]}>
            {t(`starters_mood.${mood}_name` as 'starters_mood.new_name')}
          </Text>
          <Text style={[typography.body.md, styles.center, { color: palette.textSoft }]}>
            {t(`starters_mood.${mood}_sub` as 'starters_mood.new_sub')}
          </Text>
          <Text style={[typography.numeric.sm, { color: palette.textSoft }]}>{countdown}</Text>
        </View>

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('starters.heatmap_label')}
        </Text>
        <Card>
          <FeedHeatmap feeds={feeds} now={now} />
        </Card>

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('starters.detail_stats')}
        </Text>
        <Card style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[typography.numeric.lg, { color: palette.textInk }]}>
              {starter.feedCount}
            </Text>
            <Text style={[typography.body.sm, { color: palette.textSoft }]}>
              {t('starters.detail_total_feeds')}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[typography.numeric.lg, { color: palette.textInk }]}>
              {`${starter.intervalHours}h`}
            </Text>
            <Text style={[typography.body.sm, { color: palette.textSoft }]}>
              {t('starters.detail_every')}
            </Text>
          </View>
        </Card>

        {starter.hydration || starter.ratio || starter.notes ? (
          <>
            <Text style={[typography.label, { color: palette.textSoft }]}>
              {t('starters.detail_details')}
            </Text>
            <Card style={styles.details}>
              {starter.hydration ? (
                <Row k={t('starters.detail_hydration')} v={`${starter.hydration}%`} />
              ) : null}
              {starter.ratio ? <Row k={t('starters.detail_ratio')} v={starter.ratio} /> : null}
              {starter.notes ? <Row k={t('starters.detail_notes')} v={starter.notes} /> : null}
            </Card>
          </>
        ) : null}

        <Button
          label={t('starters.button_delete')}
          onPress={del}
          variant="destructive"
          haptic="tap"
        />
      </View>
    </BottomSheet>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[typography.body.md, { color: palette.textSoft }]}>{k}</Text>
      <Text style={[typography.body.lg, styles.rowV, { color: palette.textInk }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
  },
  editBtn: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.xl, gap: spacing.sm },
  hero: { alignItems: 'center', gap: spacing['2xs'], paddingBottom: spacing.sm },
  center: { textAlign: 'center' },
  statRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', gap: spacing['2xs'] },
  details: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowV: { flexShrink: 1, textAlign: 'right' },
});
