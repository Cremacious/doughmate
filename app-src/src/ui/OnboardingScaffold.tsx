// Proof onboarding scaffold. Full canvas, no chrome. A hero slot, headline and
// body, optional middle content, progress dots, and a primary plus a quiet exit.
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, typography } from '@/theme';
import { Button } from './Button';

export interface OnboardingScaffoldProps {
  step: number;
  total: number;
  hero: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  /** Optional quiet exit; omitted on the final step. */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function OnboardingScaffold({
  step,
  total,
  hero,
  title,
  body,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: OnboardingScaffoldProps) {
  const { palette } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bgCanvas }]}>
      <View style={styles.content}>
        <View style={styles.hero}>{hero}</View>
        <View style={styles.textGroup}>
          <Text style={[typography.display.lg, styles.center, { color: palette.textInk }]}>
            {title}
          </Text>
          <Text style={[typography.body.lg, styles.center, { color: palette.textSoft }]}>
            {body}
          </Text>
        </View>
        {children ? <View style={styles.middle}>{children}</View> : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === step - 1 ? 22 : 8,
                  backgroundColor: i === step - 1 ? palette.primary : palette.grabber,
                },
              ]}
            />
          ))}
        </View>
        <Button label={primaryLabel} onPress={onPrimary} haptic="pop" />
        {secondaryLabel && onSecondary ? (
          <Button label={secondaryLabel} onPress={onSecondary} variant="quiet" />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  hero: { marginBottom: spacing['2xl'] },
  textGroup: { gap: spacing.sm, alignItems: 'center', maxWidth: 320 },
  center: { textAlign: 'center' },
  middle: { alignItems: 'center', marginTop: spacing['2xl'] },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignSelf: 'center',
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  dot: { height: 8, borderRadius: 999 },
});

export default OnboardingScaffold;
