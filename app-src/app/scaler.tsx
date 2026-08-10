// Recipe scaler. Type a recipe, pick a multiplier (or scale to what you have),
// and see the scaled version. All scaling math lives in src/lib/recipe.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { matchFactor, scaleRecipeText } from '@/lib/recipe';
import { formatQuantity } from '@/lib/convert';
import { radius, spacing, typography } from '@/theme';

const MULTIPLIERS = [0.5, 2, 3];

function toNumber(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') {
    return null;
  }
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export default function ScalerScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();
  const params = useLocalSearchParams<{ recipe?: string }>();

  const [recipe, setRecipe] = useState(typeof params.recipe === 'string' ? params.recipe : '');
  const [factor, setFactor] = useState(1);
  const [customText, setCustomText] = useState('');
  const [needsText, setNeedsText] = useState('');
  const [haveText, setHaveText] = useState('');

  const scaled = useMemo(() => scaleRecipeText(recipe, factor), [recipe, factor]);

  const applyFactor = (next: number) => {
    triggerHaptic('select');
    setFactor(next);
  };

  const applyCustom = (text: string) => {
    setCustomText(text);
    const value = toNumber(text);
    if (value !== null && value > 0) {
      setFactor(value);
    }
  };

  const applyMatch = () => {
    const needs = toNumber(needsText);
    const have = toNumber(haveText);
    if (needs === null || have === null) {
      return;
    }
    const next = matchFactor(needs, have);
    if (next !== null) {
      triggerHaptic('pop');
      setFactor(next);
    }
  };

  const reset = () => {
    triggerHaptic('tap');
    setFactor(1);
    setCustomText('');
    setNeedsText('');
    setHaveText('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typography.display.md, { color: palette.choc }]}>{t('scaler.title')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('scaler.close')}
          onPress={() => router.back()}
          style={styles.close}
        >
          <Text style={[typography.body.lg, { color: palette.crust }]}>✕</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('scaler.input_label')}
          </Text>
          <TextInput
            value={recipe}
            onChangeText={setRecipe}
            placeholder={t('scaler.input_placeholder')}
            placeholderTextColor={palette.chocSoft}
            multiline
            textAlignVertical="top"
            style={[
              typography.body.md,
              styles.recipeInput,
              { backgroundColor: bg.subtle, color: palette.choc },
            ]}
          />

          <Text style={[typography.caption, styles.sectionLabel, { color: palette.chocSoft }]}>
            {t('scaler.multiply_by')}
          </Text>
          <View style={styles.chipRow}>
            {MULTIPLIERS.map((m) => {
              const active = factor === m && customText.trim() === '';
              return (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  onPress={() => {
                    setCustomText('');
                    applyFactor(m);
                  }}
                  style={[styles.chip, { backgroundColor: active ? palette.crust : palette.dough }]}
                >
                  <Text style={[typography.body.lg, { color: active ? '#FFFFFF' : palette.choc }]}>
                    {formatQuantity(m)}x
                  </Text>
                </Pressable>
              );
            })}
            <TextInput
              value={customText}
              onChangeText={applyCustom}
              placeholder={t('scaler.custom')}
              placeholderTextColor={palette.chocSoft}
              keyboardType="decimal-pad"
              inputMode="decimal"
              style={[
                typography.body.lg,
                styles.customInput,
                { backgroundColor: bg.subtle, color: palette.choc },
              ]}
            />
          </View>
        </Card>

        <Card>
          <Text style={[typography.heading, { color: palette.choc }]}>
            {t('scaler.to_ingredient_title')}
          </Text>
          <View style={styles.matchRow}>
            <View style={styles.matchField}>
              <Text style={[typography.caption, { color: palette.chocSoft }]}>
                {t('scaler.to_ingredient_needs')}
              </Text>
              <TextInput
                value={needsText}
                onChangeText={setNeedsText}
                keyboardType="decimal-pad"
                inputMode="decimal"
                style={[
                  typography.body.lg,
                  styles.matchInput,
                  { backgroundColor: bg.subtle, color: palette.choc },
                ]}
              />
            </View>
            <View style={styles.matchField}>
              <Text style={[typography.caption, { color: palette.chocSoft }]}>
                {t('scaler.to_ingredient_have')}
              </Text>
              <TextInput
                value={haveText}
                onChangeText={setHaveText}
                keyboardType="decimal-pad"
                inputMode="decimal"
                style={[
                  typography.body.lg,
                  styles.matchInput,
                  { backgroundColor: bg.subtle, color: palette.choc },
                ]}
              />
            </View>
          </View>
          <View style={styles.applyRow}>
            <Button
              label={t('scaler.to_ingredient_apply')}
              variant="secondary"
              onPress={applyMatch}
            />
          </View>
        </Card>

        <View style={styles.factorRow}>
          <Text style={[typography.body.md, { color: palette.chocSoft }]}>
            {t('scaler.active_factor', { factor: formatQuantity(factor) })}
          </Text>
          <Pressable accessibilityRole="button" onPress={reset}>
            <Text style={[typography.body.md, { color: palette.crust }]}>{t('scaler.reset')}</Text>
          </Pressable>
        </View>

        <Card>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('scaler.result_label')}
          </Text>
          <Text style={[typography.body.lg, styles.result, { color: palette.choc }]}>
            {recipe.trim() === '' ? t('scaler.result_empty') : scaled}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  close: {
    padding: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  recipeInput: {
    marginTop: spacing.xs,
    minHeight: 140,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  sectionLabel: {
    marginTop: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    minWidth: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  customInput: {
    minWidth: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  matchRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  matchField: {
    flex: 1,
  },
  matchInput: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  applyRow: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  result: {
    marginTop: spacing.xs,
    lineHeight: 28,
  },
});
