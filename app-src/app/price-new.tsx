// Add or edit one ingredient price, a bottom sheet. The baker enters a price the way
// it is printed on the bag ("$4.99 for 5 lb") and the app normalises it to dollars
// per gram, which is what every recipe unit can actually be costed against.
//
// Package sizes are weight only. Dry goods are sold by weight, and accepting a volume
// here would need a density at entry time as well as at costing time.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { WeightUnit } from '@/lib/convert';
import { formatUsd, type IngredientPrice, pricePerGram } from '@/lib/cost';
import { scaleType } from '@/lib/typeScale';
import { useIngredientPrices } from '@/state/ingredientPrices';
import { spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { useToast } from '@/ui/Toast';

const PACKAGE_UNITS: WeightUnit[] = ['g', 'oz', 'lb'];

/** Accept a comma decimal ("4,99") so a locale typical entry still parses. */
function parseAmount(text: string): number {
  return Number(text.replace(',', '.'));
}

export default function PriceEditorSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { show } = useToast();
  const { name: nameParam } = useLocalSearchParams<{ name?: string }>();
  const { getPrice, setPrice, removePrice } = useIngredientPrices();

  const existing = nameParam ? getPrice(nameParam) : undefined;

  const [name, setName] = useState(existing?.ingredientName ?? nameParam ?? '');
  const [price, setPriceText] = useState(
    existing?.price !== undefined ? String(existing.price) : ''
  );
  const [packageAmount, setPackageAmount] = useState(
    existing?.packageAmount !== undefined ? String(existing.packageAmount) : ''
  );
  const [packageUnit, setPackageUnit] = useState<WeightUnit>(existing?.packageUnit ?? 'lb');

  const priceValue = parseAmount(price);
  const packageValue = parseAmount(packageAmount);
  const valid =
    name.trim().length > 0 &&
    Number.isFinite(priceValue) &&
    priceValue >= 0 &&
    Number.isFinite(packageValue) &&
    packageValue > 0;

  const preview = valid
    ? formatUsd(pricePerGram(priceValue, packageValue, packageUnit) * 100)
    : null;

  const save = () => {
    if (!name.trim()) {
      show({ message: t('prices.needs_name') });
      return;
    }
    if (!valid) {
      show({ message: t('prices.needs_amount') });
      return;
    }
    const entry: IngredientPrice = {
      ingredientName: name.trim(),
      pricePerGram: pricePerGram(priceValue, packageValue, packageUnit),
      updatedAt: Date.now(),
      price: priceValue,
      packageAmount: packageValue,
      packageUnit,
    };
    setPrice(entry);
    router.back();
    show({
      message: t('prices.toast_saved', { name: entry.ingredientName }),
      variant: 'confirmation',
    });
  };

  const remove = () => {
    if (!existing) {
      return;
    }
    removePrice(existing.ingredientName);
    router.back();
    show({ message: t('prices.toast_deleted', { name: existing.ingredientName }) });
  };

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <Text
          style={[
            typography.display.md,
            scaleType(typography.display.md, fontScale),
            styles.title,
            { color: palette.textInk },
          ]}
        >
          {existing ? t('prices.edit_title') : t('prices.add_title')}
        </Text>
      }
      footer={<Button label={t('prices.save')} onPress={save} haptic="pop" />}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Input
            label={t('prices.name_label')}
            value={name}
            onChangeText={setName}
            placeholder={t('prices.name_placeholder')}
            required
          />
        </Card>

        <Card>
          <Input
            label={t('prices.price_label')}
            value={price}
            onChangeText={setPriceText}
            placeholder={t('prices.price_placeholder')}
            numeric
          />
          <Input
            label={t('prices.package_label')}
            value={packageAmount}
            onChangeText={setPackageAmount}
            placeholder={t('prices.package_placeholder')}
            numeric
          />
          <Text
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              { color: palette.textFaint },
            ]}
          >
            {t('prices.unit_label')}
          </Text>
          <View style={styles.threeUp}>
            {PACKAGE_UNITS.map((u) => (
              <View key={u} style={styles.cell}>
                <Chip
                  label={t(`units.${u}` as 'units.g')}
                  size="md"
                  numeric
                  selected={packageUnit === u}
                  onPress={() => setPackageUnit(u)}
                />
              </View>
            ))}
          </View>
          {preview ? (
            <Text
              style={[
                typography.numeric.sm,
                scaleType(typography.numeric.sm, fontScale),
                { color: palette.proofTeal },
              ]}
            >
              {t('prices.per_100g', { price: preview })}
            </Text>
          ) : null}
        </Card>

        {existing ? (
          <Button
            label={t('prices.delete')}
            variant="destructive"
            onPress={remove}
            haptic="warning"
          />
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing['3xl'] },
  threeUp: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
});
