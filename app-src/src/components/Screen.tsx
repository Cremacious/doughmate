// Shared screen scaffold. Centers a title and a supporting line using theme
// tokens so every tab looks like one system while the real screens get built.
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { spacing, typography } from '@/theme';

export interface ScreenProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function Screen({ title, subtitle, children }: ScreenProps) {
  const { palette, bg, fontScale } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: bg.primary }]}
    >
      <View style={styles.content}>
        <Text
          style={[
            typography.display.md,
            scaleType(typography.display.md, fontScale),
            { color: palette.choc },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              typography.body.md,
              scaleType(typography.body.md, fontScale),
              styles.subtitle,
              { color: palette.chocSoft },
            ]}
          >
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
