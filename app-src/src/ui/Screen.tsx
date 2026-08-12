// Proof tab screen scaffold: canvas background, the screen header, and a scroll
// area with the 24 gutter and bottom room for the floating tab bar.
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme';
import { ScreenHeader } from './ScreenHeader';

const TAB_BAR_CLEARANCE = 108;

export interface ScreenProps {
  title: string;
  children: ReactNode;
  /** Extra node pinned above the tab bar (e.g. a bottom anchored primary action). */
  footer?: ReactNode;
}

export function Screen({ title, children, footer }: ScreenProps) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: palette.bgCanvas }]}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <View style={styles.gutter}>
          <ScreenHeader title={title} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  gutter: { paddingHorizontal: spacing.xl },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: spacing.md,
  },
  footer: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: TAB_BAR_CLEARANCE - 8,
  },
});

export default Screen;
