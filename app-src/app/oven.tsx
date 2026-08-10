// Oven temperature. Enter a temperature in F or C; see the other scale and the
// nearest gas mark. Conversions live in src/lib/oven.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { ModalHeader } from '@/components/ModalHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { round } from '@/lib/convert';
import { cToF, fToC, nearestGasMark } from '@/lib/oven';
import { triggerHaptic } from '@/lib/haptics';
import { radius, spacing, typography } from '@/theme';

type TempUnit = 'f' | 'c';

export default function OvenScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();

  const [amountText, setAmountText] = useState('350');
  const [unit, setUnit] = useState<TempUnit>('f');

  const value = Number(amountText);
  const valid = amountText.trim() !== '' && Number.isFinite(value);

  const reading = useMemo(() => {
    if (!valid) {
      return null;
    }
    const f = unit === 'f' ? value : cToF(value);
    const c = unit === 'c' ? value : fToC(value);
    return { f: round(f), c: round(c), gas: nearestGasMark(f) };
  }, [valid, value, unit]);

  const units: { key: TempUnit; label: string }[] = [
    { key: 'f', label: t('oven.unit_f') },
    { key: 'c', label: t('oven.unit_c') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ModalHeader title={t('oven.title')} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('oven.amount_label')}
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

          <View style={styles.unitRow}>
            {units.map((u) => {
              const active = u.key === unit;
              return (
                <Pressable
                  key={u.key}
                  accessibilityRole="button"
                  onPress={() => {
                    triggerHaptic('select');
                    setUnit(u.key);
                  }}
                  style={[
                    styles.unitChip,
                    { backgroundColor: active ? palette.crust : palette.dough },
                  ]}
                >
                  <Text style={[typography.body.lg, { color: active ? '#FFFFFF' : palette.choc }]}>
                    {u.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('oven.reads_label')}
          </Text>
          {reading === null ? (
            <Text style={[typography.display.md, styles.reading, { color: palette.chocSoft }]}>
              —
            </Text>
          ) : (
            <View style={styles.readingRow}>
              <Text style={[typography.number.lg, { color: palette.crust }]}>
                {`${reading.f}°F`}
              </Text>
              <Text style={[typography.number.lg, { color: palette.crust }]}>
                {`${reading.c}°C`}
              </Text>
            </View>
          )}
          {reading !== null ? (
            <Text style={[typography.body.lg, styles.gas, { color: palette.chocSoft }]}>
              {`${t('oven.gas_mark')} ${reading.gas}`}
            </Text>
          ) : null}
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
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  input: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  unitRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  unitChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  reading: {
    marginTop: spacing.xs,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  gas: {
    marginTop: spacing.md,
  },
});
