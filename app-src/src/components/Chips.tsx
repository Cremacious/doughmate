// A wrapping row of single-select chips. Used for small option sets like yeast
// types, egg sizes, and butter units.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { radius, spacing, typography } from '@/theme';

export interface ChipOption<T extends string> {
  key: T;
  label: string;
}

export interface ChipsProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Chips<T extends string>({ options, value, onChange }: ChipsProps<T>) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            onPress={() => {
              triggerHaptic('select');
              onChange(option.key);
            }}
            style={[styles.chip, { backgroundColor: active ? palette.crust : palette.dough }]}
          >
            <Text style={[typography.body.md, { color: active ? '#FFFFFF' : palette.choc }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
});

export default Chips;
