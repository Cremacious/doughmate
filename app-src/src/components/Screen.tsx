// Shared screen scaffold. Centers a title and a supporting line using theme
// tokens so every tab looks like one system while the real screens get built.
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography } from '@/theme';

export interface ScreenProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function Screen({ title, subtitle, children }: ScreenProps) {
  const { palette, bg } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: bg.primary }]}
    >
      <View style={styles.content}>
        <Text style={[typography.display.md, { color: palette.choc }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.body.md, styles.subtitle, { color: palette.chocSoft }]}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
});

export default Screen;
