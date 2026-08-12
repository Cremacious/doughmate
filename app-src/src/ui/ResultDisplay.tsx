// Proof ResultDisplay. The answer, shown as a centered hero: a small lead in
// label, a big number in the brand orange with its unit word, and a note under
// it. Pops on change (fades under reduced motion).
import { StyleSheet, Text, View } from 'react-native';

import { PopIn } from '@/components/PopIn';
import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { spacing, typography } from '@/theme';

export interface ResultDisplayProps {
  label: string;
  /** Formatted value, or null for the empty state. */
  value: string | null;
  unit?: string;
  note?: string;
  emptyText: string;
}

export function ResultDisplay({ label, value, unit, note, emptyText }: ResultDisplayProps) {
  const { palette, fontScale } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[typography.label, styles.center, { color: palette.primaryText }]}>{label}</Text>
      {value === null ? (
        <Text style={[typography.body.lg, styles.center, { color: palette.textSoft }]}>
          {emptyText}
        </Text>
      ) : (
        <PopIn trigger={value}>
          <View style={styles.valueRow}>
            <Text
              style={[
                typography.numeric.hero,
                scaleType(typography.numeric.hero, fontScale),
                { color: palette.primary },
              ]}
            >
              {value}
            </Text>
            {unit ? (
              <Text style={[typography.heading, { color: palette.primaryText }]}>{unit}</Text>
            ) : null}
          </View>
        </PopIn>
      )}
      {note ? (
        <Text style={[typography.body.md, styles.center, { color: palette.textSoft }]}>{note}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing['2xs'] },
  center: { textAlign: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
});

export default ResultDisplay;
