// Proof StarterCard. A feed countdown from lastFedAt + interval, a progress ring
// that fills as the interval elapses, and inline Feed now and delete. The border
// and ring turn primary the moment a feed is due.
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { feedStatus } from '@/lib/starter';
import type { Starter } from '@/state/starters';
import { radius, spacing, typography } from '@/theme';
import { Button } from './Button';
import { Icon } from './Icon';
import { ProgressRing } from './ProgressRing';

export interface StarterCardProps {
  starter: Starter;
  now: number;
  onFeed: () => void;
  onDelete: () => void;
}

export function StarterCard({ starter, now, onFeed, onDelete }: StarterCardProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const status = feedStatus(starter, now);

  const countdown = status.fresh
    ? t('starters.countdown_fresh')
    : status.due
      ? t('starters.countdown_ready')
      : status.hoursUntil >= 1
        ? t('starters.countdown_future', { hours: status.hoursUntil })
        : t('starters.countdown_soon', { minutes: status.minutesUntil });

  const sub = status.fresh
    ? t('starters.never_fed')
    : status.due
      ? t('starters.waiting', { hours: status.hoursWaited })
      : t('starters.fed_count', { count: starter.feedCount });

  const countdownColor = status.due ? palette.primary : palette.proofTeal;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.bgSurface,
          borderColor: status.due ? palette.primary : palette.border,
        },
      ]}
    >
      <View style={styles.top}>
        <ProgressRing progress={status.fresh ? 0 : status.progress} due={status.due} />
        <View style={styles.headText}>
          <Text style={[typography.display.md, { color: palette.textInk }]}>{starter.name}</Text>
          {starter.hydration ? (
            <View style={[styles.badge, { backgroundColor: palette.proofTealWash }]}>
              <Text style={[typography.label, { color: palette.proofTealText }]}>
                {t('starters.hydration_badge', { value: starter.hydration })}
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('starters.button_delete')}
          onPress={() => {
            triggerHaptic('tap');
            onDelete();
          }}
          style={[styles.delete, { backgroundColor: palette.bgSunken }]}
        >
          <Icon name="delete" size={20} color={palette.textFaint} />
        </Pressable>
      </View>

      <View style={styles.countdownRow}>
        <Text style={[typography.numeric.lg, { color: countdownColor }]}>{countdown}</Text>
        <Text style={[typography.body.sm, styles.sub, { color: palette.textSoft }]}>{sub}</Text>
      </View>

      <Button label={t('starters.button_feed_now')} onPress={onFeed} haptic="success" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headText: { flex: 1, gap: spacing['2xs'], alignItems: 'flex-start' },
  badge: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  delete: {
    width: 46,
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  sub: { flexShrink: 1 },
});

export default StarterCard;
