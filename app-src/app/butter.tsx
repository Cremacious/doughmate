// Butter converter, including sticks. Math from src/lib/butter.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { ModalHeader } from '@/components/ModalHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type ButterUnit, convertButter } from '@/lib/butter';
import { formatQuantity } from '@/lib/convert';
import { radius, spacing, typography } from '@/theme';

const BUTTER_UNITS: ButterUnit[] = ['stick', 'cup', 'tbsp', 'tsp', 'g', 'oz'];

export default function ButterScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();

  const options = BUTTER_UNITS.map((unit) => ({ key: unit, label: t(`units.${unit}`) }));

  const [amountText, setAmountText] = useState('1');
  const [from, setFrom] = useState<ButterUnit>('stick');
  const [to, setTo] = useState<ButterUnit>('tbsp');

  const amount = Number(amountText);
  const valid = amountText.trim() !== '' && Number.isFinite(amount);
  const result = useMemo(
    () => (valid ? convertButter(amount, from, to) : null),
    [valid, amount, from, to]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ModalHeader title={t('butter.title')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('butter.amount_label')}
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
            {t('butter.from_label')}
          </Text>
          <Chips options={options} value={from} onChange={setFrom} />

          <Text style={[typography.caption, styles.spaced, { color: palette.chocSoft }]}>
            {t('butter.to_label')}
          </Text>
          <Chips options={options} value={to} onChange={setTo} />
        </Card>

        <View style={styles.resultBlock}>
          <Text style={[typography.number.hero, { color: palette.crust }]}>
            {result === null ? '—' : formatQuantity(result)}
          </Text>
          <Text style={[typography.body.lg, { color: palette.chocSoft }]}>{t(`units.${to}`)}</Text>
        </View>
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
  resultBlock: { alignItems: 'center', gap: spacing.xs },
});
