// Fresh Bake onboarding scaffold. Full bleed butter, no card and no chrome: these
// screens are one idea each, and a card around a single idea is just a smaller screen.
// A hero slot, headline and body, optional middle content, progress dots, and a
// primary plus a quiet exit.
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { radius, shadow, spacing, typography } from '@/theme';

const PRIMARY_HEIGHT = 58;

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
  const { palette, fontScale } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.accentButter }]}>
      <View style={styles.content}>
        <View style={styles.hero}>{hero}</View>
        <View style={styles.textGroup}>
          <Text
            style={[
              typography.display.xl,
              scaleType(typography.display.xl, fontScale),
              styles.center,
              { color: palette.onButter },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              typography.body.lg,
              scaleType(typography.body.lg, fontScale),
              styles.center,
              { color: palette.onButterBody },
            ]}
          >
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
                i === step - 1
                  ? { width: 26, height: 9, backgroundColor: palette.outline }
                  : { width: 9, height: 9, backgroundColor: palette.heroDim },
              ]}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          onPress={() => {
            triggerHaptic('pop');
            onPrimary();
          }}
          style={[
            styles.primary,
            shadow.md,
            { backgroundColor: palette.outline, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text
            style={[
              typography.button,
              scaleType(typography.button, fontScale),
              { color: palette.accentButter },
            ]}
          >
            {primaryLabel}
          </Text>
        </Pressable>

        {secondaryLabel && onSecondary ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              triggerHaptic('tap');
              onSecondary();
            }}
            style={styles.skip}
          >
            <Text
              style={[
                typography.button,
                scaleType(typography.button, fontScale),
                { color: palette.onButterSoft },
              ]}
            >
              {secondaryLabel}
            </Text>
          </Pressable>
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
  dot: { borderRadius: radius.pill },
  primary: {
    height: PRIMARY_HEIGHT,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: { height: 48, alignItems: 'center', justifyContent: 'center' },
});

export default OnboardingScaffold;
