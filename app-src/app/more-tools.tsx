// The "More tools" hub. Every secondary converter lives here.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { ModalHeader } from '@/components/ModalHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { spacing, typography } from '@/theme';

const TOOLS = [
  { key: 'pan', go: () => router.push('/pan') },
  { key: 'oven', go: () => router.push('/oven') },
  { key: 'yeast', go: () => router.push('/yeast') },
  { key: 'egg', go: () => router.push('/egg') },
  { key: 'butter', go: () => router.push('/butter') },
  { key: 'substitutions', go: () => router.push('/substitutions') },
] as const;

export default function MoreToolsScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ModalHeader title={t('more_tools.title')} />

      <ScrollView contentContainerStyle={styles.content}>
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.key}
            accessibilityRole="button"
            onPress={() => {
              triggerHaptic('tap');
              tool.go();
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <Card style={styles.row}>
              <Text style={[typography.body.lg, { color: palette.choc }]}>
                {t(`more_tools.${tool.key}`)}
              </Text>
              <Text style={[typography.body.lg, { color: palette.crust }]}>›</Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
});
