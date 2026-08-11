// Proof ResultDisplay. One per screen, bottom anchored. Label, a big number with
// its unit word, and a note. Pops on change (fades under reduced motion).
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
      <Text style={[typography.label, { color: palette.primaryText }]}>{label}</Text>
      {value === null ? (
        <Text style={[typography.body.lg, { color: palette.textSoft }]}>{emptyText}</Text>
      ) : (
        <PopIn trigger={value}>
          <View style={styles.valueRow}>
            <Text
              style={[
                typography.numeric.hero,
                scaleType(typography.numeric.hero, fontScale),
                { color: palette.textInk },
              ]}
            >
              {value}
            </Text>
            {unit ? (
              <Text style={[typography.heading, { color: palette.textSoft }]}>{unit}</Text>
            ) : null}
          </View>
        </PopIn>
      )}
      {note ? <Text style={[typography.body.sm, { color: palette.textSoft }]}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing['2xs'] },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
});

export default ResultDisplay;
