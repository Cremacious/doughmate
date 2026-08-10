// A soft, elevated surface. Backgrounds and shadow come from theme tokens.
import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, shadow, spacing } from '@/theme';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const { bg } = useAppTheme();
  return (
    <View style={[styles.card, shadow.md, { backgroundColor: bg.elevated }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius['2xl'],
    padding: spacing.lg,
  },
});

export default Card;
