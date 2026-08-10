// Yeast converter. Amount plus a from/to type; math from src/lib/yeast.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { ModalHeader } from '@/components/ModalHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatQuantity } from '@/lib/convert';
import { convertYeast, listYeastTypes, type YeastId } from '@/lib/yeast';
import { radius, spacing, typography } from '@/theme';

const OPTIONS = listYeastTypes().map((type) => ({ key: type.id, label: type.name }));

export default function YeastScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();

  const [amountText, setAmountText] = useState('1');
  const [from, setFrom] = useState<YeastId>('active_dry');
  const [to, setTo] = useState<YeastId>('instant');

  const amount = Number(amountText);
  const valid = amountText.trim() !== '' && Number.isFinite(amount);
  const result = useMemo(
    () => (valid ? convertYeast(amount, from, to) : null),
    [valid, amount, from, to]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ModalHeader title={t('yeast.title')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('yeast.amount_label')}
          </Text>
          <TextInput
            value={amountText}
            onChangeText={setAmountText}
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
            {t('yeast.from_label')}
          </Text>
          <Chips options={OPTIONS} value={from} onChange={setFrom} />

          <Text style={[typography.body.md, styles.equals, { color: palette.chocSoft }]}>
            {t('yeast.equals')}
          </Text>

          <Text style={[typography.number.hero, styles.result, { color: palette.crust }]}>
            {result === null ? '—' : formatQuantity(result)}
          </Text>

          <Text style={[typography.caption, styles.spaced, { color: palette.chocSoft }]}>
            {t('yeast.to_label')}
          </Text>
          <Chips options={OPTIONS} value={to} onChange={setTo} />
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
  equals: { textAlign: 'center', marginTop: spacing.lg },
  result: { textAlign: 'center', marginTop: spacing.xs },
});
