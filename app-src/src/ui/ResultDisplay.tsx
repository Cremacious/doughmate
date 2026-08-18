// Fresh Bake ResultDisplay. This is the hero: the answer is the thing you look at
// first on Convert, so it owns the tomato fill and nothing else on the screen may.
// Left aligned, not a centred block, so the eyebrow, the number and its context all
// hang off one edge and read as one sentence.
//
// Exactly one context element. A qualifier is a butter pill; a sentence is an ink
// inset with a teal timer. Two would put the answer back in a tie with its footnotes.
import { StyleSheet, Text, View } from 'react-native';

import { PopIn } from '@/components/PopIn';
import { useAppTheme } from '@/hooks/useAppTheme';
import { numeralLine, scaleType } from '@/lib/typeScale';
import { radius, spacing, stroke, typography } from '@/theme';
import { Card } from './Card';
import { Icon } from './Icon';

/** The hero numeral does not take the flat 1.25: 76 goes to 88, not to 95. */
const HERO_NUMERAL = { normal: 76, floured: 88 } as const;

export interface ResultDisplayProps {
  label: string;
  /** Formatted value, or null for the empty state. */
  value: string | null;
  unit?: string;
  emptyText: string;
  /** A qualifier, shown as a butter pill. */
  contextPill?: string;
  /** A sentence, shown as an ink inset with a teal timer. Wins over the pill. */
  contextNote?: string;
}

export function ResultDisplay({
  label,
  value,
  unit,
  emptyText,
  contextPill,
  contextNote,
}: ResultDisplayProps) {
  const { palette, fontScale } = useAppTheme();

  const floured = fontScale > 1;
  const numeralSize = floured ? HERO_NUMERAL.floured : HERO_NUMERAL.normal;

  return (
    <Card tier="hero" heroColor={palette.primary} style={styles.card}>
      <Text
        style={[
          typography.label,
          scaleType(typography.label, fontScale),
          { color: palette.onPrimarySoft },
        ]}
      >
        {label}
      </Text>

      {value === null ? (
        <Text
          style={[
            typography.body.lg,
            scaleType(typography.body.lg, fontScale),
            { color: palette.onPrimarySoft },
          ]}
        >
          {emptyText}
        </Text>
      ) : (
        <PopIn trigger={value}>
          <View style={styles.valueRow}>
            <Text
              style={[
                typography.numeric.hero,
                numeralLine(numeralSize),
                { color: palette.onPrimary },
              ]}
            >
              {value}
            </Text>
            {unit ? (
              <Text
                style={[
                  typography.subheading,
                  scaleType(typography.subheading, fontScale),
                  { color: palette.onPrimarySoft },
                ]}
              >
                {unit}
              </Text>
            ) : null}
          </View>
        </PopIn>
      )}

      {contextNote ? (
        <View style={[styles.inset, { backgroundColor: palette.outline }]}>
          <Icon name="timer" size={18} color={palette.proofTeal} />
          <Text
            style={[
              typography.body.sm,
              scaleType(typography.body.sm, fontScale),
              styles.insetText,
              { color: palette.onPrimary },
            ]}
          >
            {contextNote}
          </Text>
        </View>
      ) : contextPill ? (
        <View
          style={[
            styles.pill,
            { backgroundColor: palette.accentButter, borderColor: palette.outline },
          ]}
        >
          <Text
            style={[
              typography.chip,
              scaleType(typography.chip, fontScale),
              { color: palette.onButter },
            ]}
          >
            {contextPill}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'flex-start', gap: spacing.xs },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: stroke.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    marginTop: spacing['2xs'],
  },
  inset: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing['2xs'],
  },
  insetText: { flex: 1 },
});

export default ResultDisplay;
