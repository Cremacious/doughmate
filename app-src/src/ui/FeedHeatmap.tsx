// A 28 day feeding heatmap. Cells tint up with more feeds that day; today is
// ringed. Theme aware: teal at increasing opacity over the sunken base.
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { dailyFeedCounts } from '@/lib/starterMood';
import { spacing, typography } from '@/theme';

export interface FeedHeatmapProps {
  feeds: number[];
  now: number;
  days?: number;
}

function levelOpacity(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 0.35;
  if (count === 2) return 0.65;
  return 1;
}

export function FeedHeatmap({ feeds, now, days = 28 }: FeedHeatmapProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const counts = dailyFeedCounts(feeds, now, days);

  const cell = (count: number, ring: boolean, key: number) => {
    const op = levelOpacity(count);
    return (
      <View
        key={key}
        style={[
          styles.cell,
          {
            backgroundColor: op === 0 ? palette.bgSunken : palette.proofTeal,
            opacity: op === 0 ? 1 : op,
          },
          ring ? { borderWidth: 2, borderColor: palette.primary } : null,
        ]}
      />
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>{counts.map((c, i) => cell(c, i === days - 1, i))}</View>
      <View style={styles.legend}>
        <Text style={[typography.body.sm, { color: palette.textFaint }]}>
          {t('starters.heatmap_less')}
        </Text>
        {[0, 0.35, 0.65, 1].map((op, i) => (
          <View
            key={i}
            style={[
              styles.legendCell,
              {
                backgroundColor: op === 0 ? palette.bgSunken : palette.proofTeal,
                opacity: op === 0 ? 1 : op,
              },
            ]}
          />
        ))}
        <Text style={[typography.body.sm, { color: palette.textFaint }]}>
          {t('starters.heatmap_more')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, borderRadius: 6, flexGrow: 0 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
});

export default FeedHeatmap;
