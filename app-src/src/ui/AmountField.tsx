// Amount entry for the Convert screen. In fraction mode it shows a whole and a
// fraction picker side by side (each opens a sheet, so nothing below shifts); in
// numeric mode it falls back to the plain number field.
import { StyleSheet, View } from 'react-native';

import { fractionLabel, splitAmount } from '@/lib/amountInput';
import { spacing } from '@/theme';
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
}

export function AmountField({
  label,
  wholeLabel,
  fractionLabel: fractionLabelText,
  value,
  onChangeText,
  fraction,
  onOpenWhole,
  onOpenFraction,
}: AmountFieldProps) {
  if (!fraction) {
    return <Input label={label} value={value} onChangeText={onChangeText} numeric />;
  }

  const { whole, fractionId } = splitAmount(Number(value));
  return (
    <View style={styles.row}>
      <View style={styles.col}>
        <PickerField label={wholeLabel} value={String(whole)} onPress={onOpenWhole} />
      </View>
      <View style={styles.col}>
        <PickerField
          label={fractionLabelText}
          value={fractionLabel(fractionId)}
          onPress={onOpenFraction}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
});

export default AmountField;
