// Add a starter: a name and how often it needs feeding.
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { ModalHeader } from '@/components/ModalHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useStarters } from '@/state/starters';
import { radius, spacing, typography } from '@/theme';

const INTERVALS = [
  { key: '12', label: '12h' },
  { key: '24', label: '24h' },
  { key: '48', label: '48h' },
];

export default function NewStarterScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();
  const { starters, addStarter } = useStarters();

  const [name, setName] = useState('');
  const [interval, setInterval] = useState('24');

  const save = () => {
    const fallback = t('starters.new_name_placeholder_next', { number: starters.length + 1 });
    addStarter({ name: name.trim() || fallback, intervalHours: Number(interval) });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ModalHeader title={t('starters.new_title')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.stack}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('starters.new_name_placeholder')}
            placeholderTextColor={palette.chocSoft}
            style={[
              typography.body.lg,
              styles.nameInput,
              { backgroundColor: bg.subtle, color: palette.choc },
            ]}
          />

          <View>
            <Text style={[typography.caption, styles.label, { color: palette.chocSoft }]}>
              {t('starters.field_interval')}
            </Text>
            <Chips options={INTERVALS} value={interval} onChange={setInterval} />
          </View>
        </Card>

        <Button label={t('starters.button_save')} onPress={save} haptic="pop" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },
  stack: { gap: spacing.lg },
  nameInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  label: { marginBottom: spacing.xs },
});
