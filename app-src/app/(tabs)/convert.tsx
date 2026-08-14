// Convert: one shape shifting calculator holding all six converters. The result
// sits up top; the mode swaps the input card in place below it. No back buttons.
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  convert,
  formatQuantity,
  getIngredient,
  type Ingredient,
  round,
  searchIngredients,
  type Unit,
} from '@/lib/convert';
import { type ButterUnit, convertButter } from '@/lib/butter';
import { convertEggs, type EggId, getEggSize, listEggSizes } from '@/lib/egg';
import { cToF, fToC, nearestGasMark } from '@/lib/oven';
import { bakeTimeHint, getPan, listPans, type Pan, panScaleFactor } from '@/lib/pan';
import { convertYeast, getYeastType, listYeastTypes, type YeastId } from '@/lib/yeast';
import { useSettings } from '@/state/settings';
import { spacing, typography } from '@/theme';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { ModeChip } from '@/ui/ModeChip';
import { OptionSheet, type Option } from '@/ui/OptionSheet';
import { PickerField } from '@/ui/PickerField';
import { ResultDisplay } from '@/ui/ResultDisplay';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Stepper } from '@/ui/Stepper';
import { Tip } from '@/ui/Tip';

type Mode = 'ingredient' | 'pan' | 'oven' | 'yeast' | 'egg' | 'butter';
const MODES: Mode[] = ['ingredient', 'pan', 'oven', 'yeast', 'egg', 'butter'];
const MODE_ICON = {
  ingredient: 'convert',
  pan: 'pan',
  oven: 'oven',
  yeast: 'yeast',
  egg: 'egg',
  butter: 'butter',
} as const;

const INGREDIENT_FROM: Unit[] = ['cup', 'tbsp', 'tsp', 'ml', 'g', 'oz', 'lb'];
const INGREDIENT_TO: Unit[] = ['g', 'oz', 'lb', 'cup', 'tbsp', 'tsp', 'ml'];
const BUTTER_UNITS: ButterUnit[] = ['stick', 'cup', 'tbsp', 'tsp', 'g', 'oz'];

const DEFAULT_INGREDIENT: Ingredient = getIngredient('all_purpose_flour')!;

interface Result {
  label: string;
  value: string | null;
  unit?: string;
  note?: string;
  valid: boolean;
  emptyText: string;
}

export default function ConvertScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const reduced = useReducedMotion();
  const { settings } = useSettings();

  const [mode, setMode] = useState<Mode>('ingredient');
  const [sheet, setSheet] = useState<'modes' | 'ingredient' | 'panFrom' | 'panTo' | null>(null);

  // Per mode inputs.
  const [ingredient, setIngredient] = useState<Ingredient>(DEFAULT_INGREDIENT);
  const [amount, setAmount] = useState('1');
  const [iFrom, setIFrom] = useState<Unit>('cup');
  const [iTo, setITo] = useState<Unit>('g');
  const [fromPan, setFromPan] = useState<Pan>(getPan('round_9')!);
  const [toPan, setToPan] = useState<Pan>(getPan('round_8')!);
  const [temp, setTemp] = useState('350');
  const [ovenUnit, setOvenUnit] = useState<'f' | 'c'>('f');
  const [yAmount, setYAmount] = useState('1');
  const [yFrom, setYFrom] = useState<YeastId>('active_dry');
  const [yTo, setYTo] = useState<YeastId>('instant');
  const [eggCount, setEggCount] = useState(3);
  const [eFrom, setEFrom] = useState<EggId>('large');
  const [eTo, setETo] = useState<EggId>('medium');
  const [bAmount, setBAmount] = useState('1');
  const [bFrom, setBFrom] = useState<ButterUnit>('stick');
  const [bTo, setBTo] = useState<ButterUnit>('tbsp');

  const result = useMemo<Result>(
    () => computeResult(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      mode,
      ingredient,
      amount,
      iFrom,
      iTo,
      fromPan,
      toPan,
      temp,
      ovenUnit,
      yAmount,
      yFrom,
      yTo,
      eggCount,
      eFrom,
      eTo,
      bAmount,
      bFrom,
      bTo,
      settings.flourStandard,
      settings.numberFormat,
    ]
  );

  function num(text: string): number | null {
    const v = Number(text.trim());
    return text.trim() !== '' && Number.isFinite(v) ? v : null;
  }

  function computeResult(): Result {
    const emptyText = t('converter.result_placeholder');
    const invalidText = t('errors.invalid_input');

    if (mode === 'ingredient') {
      const a = num(amount);
      const value =
        a === null
          ? null
          : formatQuantity(
              convert({
                amount: a,
                from: iFrom,
                to: iTo,
                ingredient,
                flourStandard: settings.flourStandard,
              }),
              { format: settings.numberFormat, unit: iTo }
            );
      return {
        label: t('converter.result_equals'),
        value,
        unit: value === null ? undefined : t(`units.${iTo}` as 'units.g'),
        note: ingredient.name,
        valid: a !== null,
        emptyText: amount.trim() === '' ? emptyText : invalidText,
      };
    }
    if (mode === 'pan') {
      const factor = panScaleFactor(fromPan.area_sqin, toPan.area_sqin);
      const hint = bakeTimeHint(fromPan.area_sqin, toPan.area_sqin);
      return {
        label: t('pan.scale_label'),
        value: factor === null ? null : formatQuantity(factor),
        unit: 'x',
        note: t(`pan.bake_${hint}` as 'pan.bake_same'),
        valid: factor !== null,
        emptyText,
      };
    }
    if (mode === 'oven') {
      const v = num(temp);
      if (v === null) {
        return {
          label: t('oven.reads_label'),
          value: null,
          valid: false,
          emptyText: temp.trim() === '' ? emptyText : invalidText,
        };
      }
      const f = ovenUnit === 'f' ? v : cToF(v);
      const c = ovenUnit === 'c' ? v : fToC(v);
      const other = ovenUnit === 'f' ? round(c) : round(f);
      return {
        label: t('oven.reads_label'),
        value: String(other),
        unit: t(ovenUnit === 'f' ? 'oven.unit_c' : 'oven.unit_f'),
        note: `${t('oven.gas_mark')} ${nearestGasMark(f)}`,
        valid: true,
        emptyText,
      };
    }
    if (mode === 'yeast') {
      const a = num(yAmount);
      const value =
        a === null
          ? null
          : formatQuantity(convertYeast(a, yFrom, yTo), {
              format: settings.numberFormat,
              unit: 'tsp',
            });
      return {
        label: t('yeast.to_label'),
        value,
        unit: value === null ? undefined : t('units.tsp'),
        note: getYeastType(yTo)?.name,
        valid: a !== null,
        emptyText: yAmount.trim() === '' ? emptyText : invalidText,
      };
    }
    if (mode === 'egg') {
      const value = formatQuantity(convertEggs(eggCount, eFrom, eTo));
      return {
        label: t('egg.to_label'),
        value,
        unit: t('egg.result_suffix'),
        note: getEggSize(eTo)?.name,
        valid: true,
        emptyText,
      };
    }
    // butter
    const a = num(bAmount);
    const value =
      a === null
        ? null
        : formatQuantity(convertButter(a, bFrom, bTo), {
            format: settings.numberFormat,
            unit: bTo,
          });
    return {
      label: t('converter.result_equals'),
      value,
      unit: value === null ? undefined : t(`units.${bTo}` as 'units.g'),
      note: t('butter.title'),
      valid: a !== null,
      emptyText: bAmount.trim() === '' ? emptyText : invalidText,
    };
  }

  const unitRow = <T extends string>(options: T[], value: T, onChange: (v: T) => void) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.chipRow}
    >
      {options.map((u) => (
        <Chip
          key={u}
          label={t(`units.${u}` as 'units.g')}
          selected={value === u}
          onPress={() => onChange(u)}
        />
      ))}
    </ScrollView>
  );

  const typeRow = <T extends string>(
    options: { id: T; name: string }[],
    value: T,
    onChange: (v: T) => void
  ) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.chipRow}
    >
      {options.map((o) => (
        <Chip key={o.id} label={o.name} selected={value === o.id} onPress={() => onChange(o.id)} />
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bgCanvas }]}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <View style={styles.gutter}>
          <ScreenHeader title={t('tabs.convert')} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modeRow}
          style={styles.modeScroll}
        >
          {MODES.map((m) => (
            <ModeChip
              key={m}
              iconName={MODE_ICON[m]}
              label={t(`converter.modes.${m}` as 'converter.modes.ingredient')}
              selected={mode === m}
              onPress={() => setMode(m)}
            />
          ))}
          <ModeChip
            iconName="search"
            label={t('converter.modes.all')}
            selected={false}
            outlined
            onPress={() => setSheet('modes')}
          />
        </ScrollView>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Tip id="convert.modes" text={t('tips.convert_modes')} />
          <Card style={styles.resultCard}>
            <ResultDisplay
              label={result.label}
              value={result.value}
              unit={result.unit}
              note={result.note}
              emptyText={result.emptyText}
            />
          </Card>

          <Animated.View
            key={mode}
            entering={
              reduced ? FadeIn.duration(120) : FadeInDown.springify().stiffness(130).damping(20)
            }
          >
            <Card style={styles.inputCard}>
              {mode === 'ingredient' ? (
                <>
                  <PickerField
                    label={t('converter.pick_ingredient')}
                    value={ingredient.name}
                    onPress={() => setSheet('ingredient')}
                  />
                  <Input
                    label={t('converter.label_amount')}
                    value={amount}
                    onChangeText={setAmount}
                    numeric
                  />
                  <Labeled label={t('converter.label_from_unit')}>
                    {unitRow(INGREDIENT_FROM, iFrom, setIFrom)}
                  </Labeled>
                  <Labeled label={t('converter.label_to_unit')}>
                    {unitRow(INGREDIENT_TO, iTo, setITo)}
                  </Labeled>
                </>
              ) : null}

              {mode === 'pan' ? (
                <>
                  <PickerField
                    label={t('pan.from_label')}
                    value={fromPan.name}
                    onPress={() => setSheet('panFrom')}
                  />
                  <PickerField
                    label={t('pan.to_label')}
                    value={toPan.name}
                    onPress={() => setSheet('panTo')}
                  />
                </>
              ) : null}

              {mode === 'oven' ? (
                <>
                  <Input
                    label={t('oven.amount_label')}
                    value={temp}
                    onChangeText={setTemp}
                    numeric
                  />
                  <Labeled label={t('oven.amount_label')}>
                    {unitRow2(
                      [
                        { id: 'f' as const, label: t('oven.unit_f') },
                        { id: 'c' as const, label: t('oven.unit_c') },
                      ],
                      ovenUnit,
                      setOvenUnit
                    )}
                  </Labeled>
                </>
              ) : null}

              {mode === 'yeast' ? (
                <>
                  <Input
                    label={t('yeast.amount_label')}
                    value={yAmount}
                    onChangeText={setYAmount}
                    numeric
                  />
                  <Labeled label={t('yeast.from_label')}>
                    {typeRow(listYeastTypes(), yFrom, setYFrom)}
                  </Labeled>
                  <Labeled label={t('yeast.to_label')}>
                    {typeRow(listYeastTypes(), yTo, setYTo)}
                  </Labeled>
                </>
              ) : null}

              {mode === 'egg' ? (
                <>
                  <Labeled label={t('egg.count_label')}>
                    <Stepper value={eggCount} onChange={setEggCount} min={1} />
                  </Labeled>
                  <Labeled label={t('egg.from_label')}>
                    {typeRow(
                      listEggSizes().map((s) => ({ id: s.id, name: s.name })),
                      eFrom,
                      setEFrom
                    )}
                  </Labeled>
                  <Labeled label={t('egg.to_label')}>
                    {typeRow(
                      listEggSizes().map((s) => ({ id: s.id, name: s.name })),
                      eTo,
                      setETo
                    )}
                  </Labeled>
                </>
              ) : null}

              {mode === 'butter' ? (
                <>
                  <Input
                    label={t('butter.amount_label')}
                    value={bAmount}
                    onChangeText={setBAmount}
                    numeric
                  />
                  <Labeled label={t('butter.from_label')}>
                    {unitRow(BUTTER_UNITS, bFrom, setBFrom)}
                  </Labeled>
                  <Labeled label={t('butter.to_label')}>
                    {unitRow(BUTTER_UNITS, bTo, setBTo)}
                  </Labeled>
                </>
              ) : null}
            </Card>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {sheet === 'modes' ? (
        <OptionSheet
          title={t('converter.tray_title')}
          selectedId={mode}
          onClose={() => setSheet(null)}
          onSelect={(id) => setMode(id as Mode)}
          options={MODES.map((m) => ({
            id: m,
            label: t(`converter.modes.${m}` as 'converter.modes.ingredient'),
            hint: t(`converter.modes_hint.${m}` as 'converter.modes_hint.ingredient'),
          }))}
        />
      ) : null}

      {sheet === 'ingredient' ? (
        <OptionSheet
          title={t('converter.pick_ingredient')}
          searchable
          searchPlaceholder={t('converter.picker_search_placeholder')}
          selectedId={ingredient.id}
          onClose={() => setSheet(null)}
          onSelect={(id) => {
            const found = getIngredient(id);
            if (found) {
              setIngredient(found);
            }
          }}
          options={ingredientOptions()}
        />
      ) : null}

      {sheet === 'panFrom' || sheet === 'panTo' ? (
        <OptionSheet
          title={sheet === 'panFrom' ? t('pan.from_label') : t('pan.to_label')}
          selectedId={sheet === 'panFrom' ? fromPan.id : toPan.id}
          onClose={() => setSheet(null)}
          onSelect={(id) => {
            const pan = getPan(id);
            if (pan) {
              if (sheet === 'panFrom') {
                setFromPan(pan);
              } else {
                setToPan(pan);
              }
            }
          }}
          options={listPans().map((p) => ({ id: p.id, label: p.name }))}
        />
      ) : null}
    </View>
  );
}

function ingredientOptions(): Option[] {
  return searchIngredients('').map((i) => ({
    id: i.id,
    label: i.name,
    hint: `${i.per_cup_g} g per cup`,
  }));
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.labeled}>
      <Text style={[typography.label, { color: palette.textSoft }]}>{label}</Text>
      {children}
    </View>
  );
}

function unitRow2<T extends string>(
  options: { id: T; label: string }[],
  value: T,
  onChange: (v: T) => void
) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {options.map((o) => (
        <Chip key={o.id} label={o.label} selected={value === o.id} onPress={() => onChange(o.id)} />
      ))}
    </ScrollView>
  );
}

const TAB_BAR_CLEARANCE = 100;

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  gutter: { paddingHorizontal: spacing.xl },
  modeScroll: { flexGrow: 0 },
  modeRow: { gap: spacing.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.xl },
  body: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: spacing.md,
  },
  inputCard: { gap: spacing.lg },
  labeled: { gap: spacing.xs },
  chipRow: { gap: spacing.sm, paddingRight: spacing.xl },
  resultCard: { alignItems: 'center', paddingVertical: spacing.lg },
});
