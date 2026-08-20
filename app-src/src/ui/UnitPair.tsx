// Fresh Bake unit pair. Replaces the two stacked from/to chip rows on Convert with a
// single ink filled row that states the conversion as a sentence. Tapping a half asks
// the parent to reveal that side's chip row, and only one row is ever on screen.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, typography } from '@/theme';
import { fieldHeight } from './fieldMetrics';

export type UnitSide = 'from' | 'to';

export interface UnitPairProps {
  fromLabel: string;
  toLabel: string;
  /** Which side's chip row the parent is currently showing, if any. */
  openSide: UnitSide | null;
  onPressSide: (side: UnitSide) => void;
  fromAccessibilityLabel: string;
  toAccessibilityLabel: string;
}

export function UnitPair({
  fromLabel,
  toLabel,
  openSide,
  onPressSide,
  fromAccessibilityLabel,
  toAccessibilityLabel,
}: UnitPairProps) {
  const { palette, fontScale } = useAppTheme();

  const half = (side: UnitSide, label: string, a11y: string, color: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ expanded: openSide === side }}
      onPress={() => {
        triggerHaptic('select');
        onPressSide(side);
      }}
      style={styles.half}
    >
      <View style={styles.halfInner}>
        <Text
          numberOfLines={1}
          style={[
            typography.title,
            scaleType(typography.title, fontScale),
            styles.label,
            { color },
            // The open side underlines, so the revealed chip row has a visible owner.
            openSide === side ? { textDecorationLine: 'underline' } : null,
          ]}
        >
          {label}
        </Text>
        {/* Same caret PickerField uses, so both halves read as tappable like every
            other picker on this screen. */}
        <Text style={[typography.label, scaleType(typography.label, fontScale), { color }]}>▾</Text>
      </View>
    </Pressable>
  );

  return (
    <View
      style={[styles.row, { height: fieldHeight(fontScale), backgroundColor: palette.primary }]}
    >
      {half('from', fromLabel, fromAccessibilityLabel, palette.onPrimary)}
      <Text
        style={[
          typography.title,
          scaleType(typography.title, fontScale),
          { color: palette.accentButter },
        ]}
      >
        →
      </Text>
      {half('to', toLabel, toAccessibilityLabel, palette.accentButter)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  half: { flex: 1, justifyContent: 'center' },
  halfInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { textAlign: 'center' },
});

export default UnitPair;
