import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { daysAgo } from '@/lib/bake';
import type { Bake } from '@/state/bakes';
import { spacing, typography } from '@/theme';
import { Card } from './Card';
import { StarRating } from './StarRating';

export interface BakeCardProps {
  bake: Bake;
  now: number;
  onPress: () => void;
}

export function BakeCard({ bake, now, onPress }: BakeCardProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const d = daysAgo(bake.bakedAt, now);
  const dateLabel =
    d === 0 ? t('bakes.today') : d === 1 ? t('bakes.yesterday') : t('bakes.days_ago', { count: d });

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.head}>
        <Text style={[typography.display.md, styles.name, { color: palette.textInk }]}>
          {bake.name}
        </Text>
        <Text style={[typography.numeric.sm, { color: palette.textFaint }]}>{dateLabel}</Text>
      </View>
      <StarRating value={bake.rating} size={16} />
      {bake.tags.length > 0 ? (
        <View style={styles.tags}>
          {bake.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: palette.bgSunken }]}>
              <Text style={[typography.label, { color: palette.textSoft }]}>
                {t(`bakes.tags.${tag}` as 'bakes.tags.gummy')}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {bake.recipeId || bake.starterName ? (
        <View style={styles.links}>
          {bake.recipeId ? (
            <View style={[styles.linkChip, { backgroundColor: palette.primaryWash }]}>
              <Text style={[typography.label, { color: palette.primaryText }]}>{bake.name}</Text>
            </View>
          ) : null}
          {bake.starterName ? (
            <View style={[styles.linkChip, { backgroundColor: palette.proofTealWash }]}>
              <Text style={[typography.label, { color: palette.proofTealText }]}>
                {bake.starterName}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: { flexShrink: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2xs'], marginTop: spacing['2xs'] },
  tag: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2xs'], marginTop: spacing['2xs'] },
  linkChip: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4 },
});

export default BakeCard;
