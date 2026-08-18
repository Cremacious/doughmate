import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { feedStatus } from '@/lib/starter';
import { starterMood } from '@/lib/starterMood';
import { scaleType } from '@/lib/typeScale';
import { useSamMood } from '@/state/samMood';
import { useStarters } from '@/state/starters';
import { radius, spacing, stroke, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { HardShadow } from '@/ui/HardShadow';
import { FeedHeatmap } from '@/ui/FeedHeatmap';
import { StarterSam } from '@/ui/StarterSam';
import { useToast } from '@/ui/Toast';

const TICK_MS = 60_000;

export default function StarterDetailSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getStarter, feedStarter } = useStarters();
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

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <View style={styles.headerRow}>
          <Text
            style={[
              typography.display.lg,
              scaleType(typography.display.lg, fontScale),
              styles.headerTitle,
              { color: palette.textInk },
            ]}
            numberOfLines={2}
          >
            {starter.name}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('starters.edit')}
            onPress={() => router.push(`/starter-new?id=${starter.id}`)}
          >
            <HardShadow radius={radius.pill}>
              <View
                style={[
                  styles.editBtn,
                  { backgroundColor: palette.bgSurface, borderColor: palette.outline },
                ]}
              >
                <Text
                  style={[
                    typography.chip,
                    scaleType(typography.chip, fontScale),
                    { color: palette.textInk },
                  ]}
                >
                  {t('starters.edit')}
                </Text>
              </View>
            </HardShadow>
          </Pressable>
        </View>
      }
      footer={<Button label={t('starters.button_feed_now')} onPress={feed} haptic="success" />}
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Card tier="hero" heroColor={palette.primary} style={styles.hero}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: palette.accentButter, borderColor: palette.outline },
            ]}
          >
            <StarterSam mood={mood} size={66} tightCrop crust={palette.samCrustPale} />
          </View>
          <View style={styles.heroText}>
            <Text
              style={[
                typography.heading,
                scaleType(typography.heading, fontScale),
                { color: palette.onPrimary },
              ]}
            >
              {t(`starters_mood.${mood}_name` as 'starters_mood.new_name')}
            </Text>
            <Text
              style={[
                typography.body.md,
                scaleType(typography.body.md, fontScale),
                { color: palette.onPrimarySoft },
              ]}
            >
              {t(`starters_mood.${mood}_sub` as 'starters_mood.new_sub')}
            </Text>
            <View style={[styles.countdownPill, { backgroundColor: palette.outline }]}>
              <Text
                style={[
                  typography.numeric.sm,
                  scaleType(typography.numeric.sm, fontScale),
                  { color: palette.onPrimary },
                ]}
              >
                {countdown}
              </Text>
            </View>
          </View>
        </Card>

        <Text style={[typography.labelSm, styles.sectionLabel, { color: palette.textFaint }]}>
          {t('starters.heatmap_label')}
        </Text>
        <Card>
          <FeedHeatmap feeds={feeds} now={now} />
        </Card>

        <Text style={[typography.labelSm, styles.sectionLabel, { color: palette.textFaint }]}>
          {t('starters.detail_stats')}
        </Text>
        <View style={styles.statRow}>
          <StatTile value={String(starter.feedCount)} label={t('starters.detail_total_feeds')} />
          <StatTile
            value={t('starters.interval_value', { hours: starter.intervalHours })}
            label={t('starters.detail_every')}
          />
          {/* The third tile is teal filled, so the row does not read as three of a kind. */}
          <StatTile
            value={
              starter.hydration ? t('starters.hydration_badge', { value: starter.hydration }) : '—'
            }
            label={t('starters.detail_hydration')}
            teal
          />
        </View>

        {starter.ratio || starter.notes ? (
          <>
            <Text style={[typography.labelSm, styles.sectionLabel, { color: palette.textFaint }]}>
              {t('starters.detail_details')}
            </Text>
            <Card tier="quiet" style={styles.details}>
              {starter.ratio ? <Row k={t('starters.detail_ratio')} v={starter.ratio} /> : null}
              {starter.notes ? <Row k={t('starters.detail_notes')} v={starter.notes} /> : null}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

function StatTile({
  value,
  label,
  teal = false,
}: {
  value: string;
  label: string;
  teal?: boolean;
}) {
  const { palette, fontScale } = useAppTheme();
  return (
    <View
      style={[
        styles.statTile,
        {
          backgroundColor: teal ? palette.proofTeal : palette.bgSurface,
          borderColor: palette.outline,
        },
      ]}
    >
      <Text
        style={[
          typography.numeric.lg,
          scaleType(typography.numeric.lg, fontScale),
          { color: teal ? palette.onTeal : palette.textInk },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={[
          typography.body.sm,
          scaleType(typography.body.sm, fontScale),
          styles.statLabel,
          { color: teal ? palette.onTealSoft : palette.textSoft },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignSelf: 'stretch',
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
  },
  headerTitle: { flexShrink: 1 },
  editBtn: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: stroke.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.xl, gap: spacing.sm },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    borderWidth: stroke.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroText: { flex: 1, gap: spacing['2xs'], alignItems: 'flex-start' },
  countdownPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginTop: spacing['2xs'],
  },
  sectionLabel: { marginTop: spacing.sm },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing['2xs'],
    borderRadius: radius['2xl'],
    borderWidth: stroke.ink,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  statLabel: { textAlign: 'center' },
  details: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowV: { flexShrink: 1, textAlign: 'right' },
});
