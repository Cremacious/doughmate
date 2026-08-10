// Egg size converter. Recipe wants N of one size; how many of what you have?
// Math from src/lib/egg.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { ModalHeader } from '@/components/ModalHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { convertEggs, type EggId, listEggSizes } from '@/lib/egg';
import { formatQuantity } from '@/lib/convert';
import { radius, spacing, typography } from '@/theme';

const OPTIONS = listEggSizes().map((size) => ({ key: size.id, label: size.name }));

export default function EggScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();

  const [countText, setCountText] = useState('3');
  const [from, setFrom] = useState<EggId>('large');
  const [to, setTo] = useState<EggId>('medium');

  const count = Number(countText);
  const valid = countText.trim() !== '' && Number.isFinite(count);
  const result = useMemo(
    () => (valid ? convertEggs(count, from, to) : null),
    [valid, count, from, to]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ModalHeader title={t('egg.title')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('egg.count_label')}
          </Text>
          <TextInput
            value={countText}
            onChangeText={setCountText}
            keyboardType="decimal-pad"
            inputMode="decimal"
            selectTextOnFocus
            style={[
              typography.body.lg,
              styles.input,
              { backgroundColor: bg.subtle, color: palette.choc },
            ]}
          />

          <Text style={[typography.caption, styles.spaced, { color: palette.chocSoft }]}>
            {t('egg.from_label')}
          </Text>
          <Chips options={OPTIONS} value={from} onChange={setFrom} />

          <Text style={[typography.caption, styles.spaced, { color: palette.chocSoft }]}>
            {t('egg.to_label')}
          </Text>
          <Chips options={OPTIONS} value={to} onChange={setTo} />
        </Card>

        <Card>
          <Text style={[typography.number.hero, styles.result, { color: palette.crust }]}>
            {result === null ? '—' : formatQuantity(result)}
          </Text>
          <Text style={[typography.body.lg, styles.suffix, { color: palette.chocSoft }]}>
            {t('egg.result_suffix')}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },
  input: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  spaced: { marginTop: spacing.lg },
  result: { textAlign: 'center' },
  suffix: { textAlign: 'center', marginTop: spacing.xs },
});
