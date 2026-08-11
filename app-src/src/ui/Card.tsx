// Proof Card. Surface with a hairline border. Optional press.
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, spacing } from '@/theme';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  const { palette } = useAppTheme();
  const content = (
    <View
      style={[styles.card, { backgroundColor: palette.bgSurface, borderColor: palette.border }, style]}
    >
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    gap: 10,
  },
});

export default Card;
