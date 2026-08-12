import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { spacing } from '@/theme';

export interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 22 }: StarRatingProps) {
  const { palette } = useAppTheme();
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.row}>
      {stars.map((n) => {
        const filled = n <= value;
        const glyph = (
          <Text style={{ fontSize: size, color: filled ? palette.accentButter : palette.border }}>
            {'★'}
          </Text>
        );
        if (!onChange) {
          return <View key={n}>{glyph}</View>;
        }
        return (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={String(n)}
            onPress={() => {
              triggerHaptic('select');
              onChange(n);
            }}
            hitSlop={6}
          >
            {glyph}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
});

export default StarRating;
