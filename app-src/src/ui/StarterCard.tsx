// Fresh Bake StarterCard. Only the first due starter is a hero, and the screen
// promotes it: tomato fill, Sam tight cropped into a butter circle, a full bar and a
// solid Feed now. Everything else is a standard card in teal, because a starter that
// is not hungry is information, not an errand.
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { emotionForMood } from '@/lib/samEmotion';
import { feedStatus } from '@/lib/starter';
import { starterMood } from '@/lib/starterMood';
import { scaleType } from '@/lib/typeScale';
import type { Starter } from '@/state/starters';
import { radius, spacing, stroke, typography } from '@/theme';
import { Button } from './Button';
import { Card } from './Card';
import { IconButton } from './IconButton';
import { ProgressBar } from './ProgressBar';

export interface StarterCardProps {
  starter: Starter;
  now: number;
  /** The one due starter the screen promotes. At most one per screen. */
  hero?: boolean;
  onFeed: () => void;
  onDelete: () => void;
  onOpen: () => void;
}

const AVATAR = 56;
const HERO_COUNTDOWN = 34;

export function StarterCard({
  starter,
  now,
  hero = false,
  onFeed,
  onDelete,
  onOpen,
}: StarterCardProps) {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const status = feedStatus(starter, now);
  const mood = starterMood(starter, now);

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

  const moodName = t(`starters_mood.${mood}_name` as 'starters_mood.new_name');
  const eyebrow = starter.hydration
    ? `${moodName} · ${t('starters.hydration_badge', { value: starter.hydration })}`
    : moodName;

  // On a tomato hero everything sits on ink coloured type; off it, the usual ramp.
  const titleColor = hero ? palette.onPrimary : palette.textInk;
  const eyebrowColor = hero ? palette.onPrimarySoft : palette.proofTealText;
  const subColor = hero ? palette.onPrimarySoft : palette.textSoft;

  return (
    <Card tier={hero ? 'hero' : 'standard'} heroColor={palette.primary}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" onPress={onOpen} style={styles.openArea}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: hero ? palette.accentButter : palette.proofTealWash,
                borderColor: palette.outline,
                borderWidth: hero ? stroke.ink : 0,
              },
            ]}
          >
            <Sam
              size={AVATAR}
              tightCrop
              emotion={emotionForMood(mood)}
              crust={hero ? palette.samCrustPale : undefined}
            />
          </View>
          <View style={styles.headText}>
            <Text
              style={[
                typography.label,
                scaleType(typography.label, fontScale),
                { color: eyebrowColor },
              ]}
              numberOfLines={1}
            >
              {eyebrow}
            </Text>
            <Text
              style={[
                typography.heading,
                scaleType(typography.heading, fontScale),
                { color: titleColor },
              ]}
              numberOfLines={1}
            >
              {starter.name}
            </Text>
          </View>
        </Pressable>
        <IconButton
          iconName="delete"
          variant="quiet"
          accessibilityLabel={t('starters.button_delete')}
          onPress={onDelete}
          color={hero ? palette.onPrimarySoft : palette.textFaint}
        />
      </View>

      <View style={styles.countdownRow}>
        <Text
          style={
            hero
              ? [
                  typography.numeric.lg,
                  {
                    fontSize: HERO_COUNTDOWN * fontScale,
                    lineHeight: Math.round(HERO_COUNTDOWN * 1.15 * fontScale),
                    color: palette.onPrimary,
                  },
                ]
              : [
                  typography.numeric.lg,
                  scaleType(typography.numeric.lg, fontScale),
                  { color: palette.proofTeal },
                ]
          }
        >
          {countdown}
        </Text>
        {!hero ? (
          <Text
            style={[
              typography.body.sm,
              scaleType(typography.body.sm, fontScale),
              styles.sub,
              { color: subColor },
            ]}
          >
            {sub}
          </Text>
        ) : null}
      </View>

      {hero ? (
        <Text
          style={[
            typography.body.sm,
            scaleType(typography.body.sm, fontScale),
            { color: subColor },
          ]}
        >
          {sub}
        </Text>
      ) : null}

      <ProgressBar
        progress={hero ? 1 : status.fresh ? 0 : status.progress}
        onHero={hero}
        height={hero ? 10 : 8}
      />

      <Button
        label={t('starters.button_feed_now')}
        onPress={onFeed}
        haptic="success"
        variant={hero ? 'secondary' : 'quiet'}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  openArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headText: { flex: 1, gap: 1 },
  countdownRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  sub: { flexShrink: 1 },
});

export default StarterCard;
