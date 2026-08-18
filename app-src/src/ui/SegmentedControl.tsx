// Fresh Bake segmented control. No longer a track with a sliding thumb: two or three
// separate pills, so the unselected options read as things you can go to rather than
// as background.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, stroke, typography } from '@/theme';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (id: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { palette, fontScale } = useAppTheme();
  const height = fontScale > 1 ? 54 : 42;

  return (
    <View style={styles.row}>
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => {
              triggerHaptic('select');
              onChange(o.id);
            }}
            style={[
              styles.seg,
              {
                height,
                backgroundColor: selected ? palette.outline : 'transparent',
                borderWidth: selected ? 0 : stroke.soft,
                borderColor: palette.border,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                typography.chip,
                scaleType(typography.chip, fontScale),
                { color: selected ? palette.onPrimary : palette.textSoft },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
});

export default SegmentedControl;
