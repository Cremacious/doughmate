// The main converter. Amount + ingredient + from/to units, with a big result.
// All math comes from src/lib/convert. All copy from t(). All colours from theme.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { IngredientPicker } from '@/components/IngredientPicker';
import { UnitField } from '@/components/UnitField';
import { useAppTheme } from '@/hooks/useAppTheme';
import { convert, formatQuantity, getIngredient, type Ingredient, type Unit } from '@/lib/convert';
import { spacing, typography } from '@/theme';

const DEFAULT_INGREDIENT: Ingredient = getIngredient('all_purpose_flour')!;

export default function ConvertScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();

  const [ingredient, setIngredient] = useState<Ingredient>(DEFAULT_INGREDIENT);
  const [amountText, setAmountText] = useState('1');
  const [fromUnit, setFromUnit] = useState<Unit>('cup');
  const [toUnit, setToUnit] = useState<Unit>('g');

  const amount = Number(amountText);
  const amountValid = amountText.trim() !== '' && Number.isFinite(amount);

  const result = useMemo(() => {
    if (!amountValid) {
      return null;
    }
    return convert({ amount, from: fromUnit, to: toUnit, ingredient });
  }, [amount, amountValid, fromUnit, toUnit, ingredient]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[typography.heading, styles.greeting, { color: palette.chocSoft }]}>
          {t('converter.sam_greeting_default')}
        </Text>

        <Card>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('converter.label_ingredient')}
          </Text>
          <View style={styles.gapSm}>
            <IngredientPicker value={ingredient} onChange={setIngredient} />
          </View>

          <View style={styles.amountRow}>
            <View style={styles.amountField}>
              <Text style={[typography.caption, { color: palette.chocSoft }]}>
                {t('converter.label_amount')}
              </Text>
              <TextInput
                value={amountText}
                onChangeText={setAmountText}
                keyboardType="decimal-pad"
                inputMode="decimal"
                selectTextOnFocus
                style={[
                  typography.body.lg,
                  styles.amountInput,
                  { backgroundColor: bg.subtle, color: palette.choc },
                ]}
              />
            </View>
            <View>
              <Text style={[typography.caption, { color: palette.chocSoft }]}>
                {t('converter.label_from_unit')}
              </Text>
              <UnitField value={fromUnit} onChange={setFromUnit} />
            </View>
          </View>

          <Text style={[typography.body.md, styles.equals, { color: palette.chocSoft }]}>
            {t('converter.label_equals')}
          </Text>

          <View style={styles.resultBlock}>
            {result === null ? (
              <Text style={[typography.body.lg, styles.placeholder, { color: palette.chocSoft }]}>
                {t('converter.result_placeholder')}
              </Text>
            ) : (
              <Text style={[typography.number.hero, { color: palette.crust }]}>
                {formatQuantity(result)}
              </Text>
            )}
            <View style={styles.toRow}>
              <Text style={[typography.caption, { color: palette.chocSoft }]}>
                {t('converter.label_to_unit')}
              </Text>
              <UnitField value={toUnit} onChange={setToUnit} />
            </View>
          </View>
        </Card>
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
    paddingBottom: spacing['3xl'] * 2,
    gap: spacing.lg,
  },
  greeting: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  gapSm: {
    marginTop: spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  amountField: {
    flex: 1,
  },
  amountInput: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  equals: {
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  resultBlock: {
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  placeholder: {
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  toRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
