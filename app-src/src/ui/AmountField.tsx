// Amount entry for the Convert screen. In fraction mode it shows a whole and a
// fraction picker side by side (each opens a sheet, so nothing below shifts); in
// numeric mode it falls back to the plain number field.
//
// Floured fingers puts a stepper either side of the number field. Typing with dough
// on your hands is the thing that mode exists to avoid, so the keyboard becomes
// optional rather than required. Fraction mode already never needs one.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { fractionLabel, splitAmount } from '@/lib/amountInput';
import { triggerHaptic } from '@/lib/haptics';
import { radius, spacing, stroke } from '@/theme';
import { Input } from './Input';
import { PickerField } from './PickerField';

export interface AmountFieldProps {
  label: string;
  wholeLabel: string;
  fractionLabel: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Show the whole plus fraction pickers instead of the number field. */
  fraction: boolean;
  onOpenWhole: () => void;
  onOpenFraction: () => void;
  decrementLabel?: string;
  incrementLabel?: string;
}

const STEPPER_SIZE = 60;

export function AmountField({
  label,
  wholeLabel,
  fractionLabel: fractionLabelText,
  value,
  onChangeText,
  fraction,
  onOpenWhole,
  onOpenFraction,
  decrementLabel,
  incrementLabel,
}: AmountFieldProps) {
  const { palette, fontScale } = useAppTheme();
  const floured = fontScale > 1;

  if (fraction) {
    const { whole, fractionId } = splitAmount(Number(value));
    return (
      <View style={styles.row}>
        <View style={styles.col}>
          <PickerField label={wholeLabel} value={String(whole)} numeric onPress={onOpenWhole} />
        </View>
        <View style={styles.col}>
          <PickerField
            label={fractionLabelText}
            value={fractionLabel(fractionId)}
            numeric
            onPress={onOpenFraction}
          />
        </View>
      </View>
    );
  }

  const field = <Input label={label} value={value} onChangeText={onChangeText} numeric />;

  if (!floured) {
    return field;
  }

  const nudge = (delta: number) => {
    const current = Number(value);
    const next = Math.max(0, (Number.isFinite(current) ? current : 0) + delta);
    // Trim the float noise a repeated add leaves behind.
    onChangeText(String(Math.round(next * 10000) / 10000));
  };

  const stepper = (glyph: string, delta: number, a11y: string | undefined) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={() => {
        triggerHaptic('select');
        nudge(delta);
      }}
      style={[
        styles.stepper,
        {
          backgroundColor: palette.bgCanvas,
          borderColor: palette.outline,
          borderWidth: stroke.ink,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: 'NunitoSans_800ExtraBold',
          fontSize: 22 * fontScale,
          lineHeight: 26 * fontScale,
          color: palette.textInk,
        }}
      >
        {glyph}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.steppedRow}>
      {stepper('−', -1, decrementLabel)}
      <View style={styles.col}>{field}</View>
      {stepper('+', 1, incrementLabel)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-end' },
  col: { flex: 1 },
  steppedRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  stepper: {
    width: STEPPER_SIZE,
    height: STEPPER_SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AmountField;
