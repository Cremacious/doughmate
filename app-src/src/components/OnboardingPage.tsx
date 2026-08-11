// Shared layout for an onboarding step: Sam, a line or two, and the actions.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { spacing, typography } from '@/theme';

export interface OnboardingPageProps {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}

export function OnboardingPage({
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: OnboardingPageProps) {
  const { palette, bg, fontScale } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]}>
      <View style={styles.hero}>
        <Sam size={180} />
        <Text
          style={[
            typography.display.lg,
            scaleType(typography.display.lg, fontScale),
            styles.title,
            { color: palette.choc },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            typography.body.lg,
            scaleType(typography.body.lg, fontScale),
            styles.body,
            { color: palette.chocSoft },
          ]}
        >
          {body}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label={primaryLabel} onPress={onPrimary} haptic="tap" />
        <Pressable accessibilityRole="button" onPress={onSecondary} style={styles.secondary}>
          <Text style={[typography.body.lg, { color: palette.chocSoft }]}>{secondaryLabel}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: spacing.xl },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 340 },
  actions: { gap: spacing.md },
  secondary: { alignItems: 'center', paddingVertical: spacing.sm },
});

export default OnboardingPage;
