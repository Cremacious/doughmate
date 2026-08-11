// The main converter. Amount + ingredient + from/to units, with a big result.
// All math comes from src/lib/convert. All copy from t(). All colours from theme.
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/AdBanner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IngredientPicker } from '@/components/IngredientPicker';
import { PopIn } from '@/components/PopIn';
import { UnitField } from '@/components/UnitField';
import { useAppTheme } from '@/hooks/useAppTheme';
import { showInterstitialIfReady } from '@/lib/ads';
import { convert, formatQuantity, getIngredient, type Ingredient, type Unit } from '@/lib/convert';
import { storage } from '@/lib/storage';
import { scaleType } from '@/lib/typeScale';
import { usePro } from '@/state/pro';
import { useRecipes } from '@/state/recipes';
import { useSettings } from '@/state/settings';
import { spacing, typography } from '@/theme';

const CONVERSION_COUNT_KEY = 'doughmate.conversionCount';

const DEFAULT_INGREDIENT: Ingredient = getIngredient('all_purpose_flour')!;

export default function ConvertScreen() {
  const { t } = useTranslation();
  const { palette, bg, fontScale } = useAppTheme();
  const { settings } = useSettings();
  const { addRecipe } = useRecipes();
  const { isPro } = usePro();
  const [savedMsg, setSavedMsg] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ingredient, setIngredient] = useState<Ingredient>(DEFAULT_INGREDIENT);
  const [amountText, setAmountText] = useState('1');
  const [fromUnit, setFromUnit] = useState<Unit>(settings.units === 'metric' ? 'ml' : 'cup');
  const [toUnit, setToUnit] = useState<Unit>('g');

  const amount = Number(amountText);
  const amountValid = amountText.trim() !== '' && Number.isFinite(amount);

  const result = useMemo(() => {
    if (!amountValid) {
      return null;
    }
    return convert({
      amount,
      from: fromUnit,
      to: toUnit,
      ingredient,
      flourStandard: settings.flourStandard,
    });
  }, [amount, amountValid, fromUnit, toUnit, ingredient, settings.flourStandard]);

  const onSave = () => {
    if (result === null) {
      return;
    }
    addRecipe({
      name: ingredient.name,
      lines: [`${amountText} ${t(`units.${fromUnit}`)} ${ingredient.name}`],
    });
    setSavedMsg(true);
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => setSavedMsg(false), 2500);

    // Free bakers see an interstitial after every fifth saved conversion.
    const count = Number(storage.getItem(CONVERSION_COUNT_KEY) ?? '0') + 1;
    storage.setItem(CONVERSION_COUNT_KEY, String(count));
    if (!isPro && count % 5 === 0) {
      showInterstitialIfReady();
    }
  };

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
                  scaleType(typography.body.lg, fontScale),
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
              <PopIn trigger={result}>
                <Text
                  style={[
                    typography.number.hero,
                    scaleType(typography.number.hero, fontScale),
                    { color: palette.crust },
                  ]}
                >
                  {formatQuantity(result)}
                </Text>
              </PopIn>
            )}
            <View style={styles.toRow}>
              <Text style={[typography.caption, { color: palette.chocSoft }]}>
                {t('converter.label_to_unit')}
              </Text>
              <UnitField value={toUnit} onChange={setToUnit} />
            </View>
          </View>
        </Card>

        {savedMsg ? (
          <Text style={[typography.body.md, styles.savedMsg, { color: palette.leaf }]}>
            {t('recipes.toast_saved')}
          </Text>
        ) : null}

        <Button
          label={t('converter.button_save')}
          onPress={onSave}
          disabled={result === null}
          haptic="pop"
        />
        <Button
          label={t('converter.button_more_tools')}
          variant="secondary"
          onPress={() => router.push('/more-tools')}
        />

        <AdBanner />
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
  savedMsg: {
    textAlign: 'center',
  },
});
