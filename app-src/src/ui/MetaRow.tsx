// A meta line built from counts, not from a joined string. Each count renders in
// Space Grotesk beside its label in body, and the items are separated by a 1px rule.
// The old `12 ingredients · 4 steps` read as one grey sentence; this reads as facts.
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { spacing, typography } from '@/theme';

export interface MetaItem {
  /** Omitted for items that are just a label, like a yield. */
  value?: string | number;
  label: string;
}

export interface MetaRowProps {
  items: MetaItem[];
}

export function MetaRow({ items }: MetaRowProps) {
  const { palette, fontScale } = useAppTheme();

  return (
    <View style={styles.row}>
      {items.map((item, i) => (
        <View key={`${item.label}-${i}`} style={styles.item}>
          {i > 0 ? <View style={[styles.rule, { backgroundColor: palette.divider }]} /> : null}
          {item.value !== undefined ? (
            <Text
              style={[
                typography.numeric.sm,
                scaleType(typography.numeric.sm, fontScale),
                { color: palette.textInk },
              ]}
            >
              {item.value}
            </Text>
          ) : null}
          <Text
            style={[
              typography.body.sm,
              scaleType(typography.body.sm, fontScale),
              { color: palette.textSoft },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing['2xs'] },
  rule: { width: 1, height: 13, marginHorizontal: spacing.sm },
});

export default MetaRow;
