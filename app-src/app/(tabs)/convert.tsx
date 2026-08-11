// Convert: one shape shifting calculator holding all six converters. The mode
// swaps the input card in place; the result and Save stay put. No back buttons.
import { type ReactNode, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { showInterstitialIfReady } from '@/lib/ads';
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
import { storage } from '@/lib/storage';
import { convertYeast, getYeastType, listYeastTypes, type YeastId } from '@/lib/yeast';
import { usePro } from '@/state/pro';
import { useRecipes } from '@/state/recipes';
import { useSamMood } from '@/state/samMood';
import { useSettings } from '@/state/settings';
import { spacing, typography } from '@/theme';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { ModeChip } from '@/ui/ModeChip';
import { OptionSheet, type Option } from '@/ui/OptionSheet';
import { PickerField } from '@/ui/PickerField';
import { ResultDisplay } from '@/ui/ResultDisplay';
import { Screen } from '@/ui/Screen';
import { Stepper } from '@/ui/Stepper';
import { useToast } from '@/ui/Toast';

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
const CONVERSION_COUNT_KEY = 'doughmate.conversionCount';

interface Result {
  label: string;
  value: string | null;
  unit?: string;
  note?: string;
  valid: boolean;
  emptyText: string;
  saveName: string;
  saveLine: string;
}

export default function ConvertScreen() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const { settings } = useSettings();
  const { addRecipe } = useRecipes();
  const { isPro } = usePro();
  const { celebrate } = useSamMood();
  const { show } = useToast();

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

  const [savedMsg, setSavedMsg] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
              })
            );
      return {
        label: t('converter.result_equals'),
        value,
        unit: value === null ? undefined : t(`units.${iTo}` as 'units.g'),
        note: ingredient.name,
        valid: a !== null,
        emptyText: amount.trim() === '' ? emptyText : invalidText,
        saveName: ingredient.name,
        saveLine: `${amount} ${t(`units.${iFrom}` as 'units.g')} ${ingredient.name}`,
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
        saveName: t('pan.title'),
        saveLine: `${fromPan.name} to ${toPan.name}: ${factor === null ? '' : formatQuantity(factor)}x`,
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
          saveName: t('oven.title'),
          saveLine: '',
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
        saveName: t('oven.title'),
        saveLine: `${temp} ${t(ovenUnit === 'f' ? 'oven.unit_f' : 'oven.unit_c')} to ${other} ${t(ovenUnit === 'f' ? 'oven.unit_c' : 'oven.unit_f')}`,
      };
    }
    if (mode === 'yeast') {
      const a = num(yAmount);
      const value = a === null ? null : formatQuantity(convertYeast(a, yFrom, yTo));
      return {
        label: t('yeast.to_label'),
        value,
        unit: value === null ? undefined : t('units.tsp'),
        note: getYeastType(yTo)?.name,
        valid: a !== null,
        emptyText: yAmount.trim() === '' ? emptyText : invalidText,
        saveName: t('yeast.title'),
        saveLine: `${yAmount} ${t('units.tsp')} ${getYeastType(yFrom)?.name} to ${value} ${t('units.tsp')} ${getYeastType(yTo)?.name}`,
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
        saveName: t('egg.title'),
        saveLine: `${eggCount} ${getEggSize(eFrom)?.name} to ${value} ${getEggSize(eTo)?.name}`,
      };
    }
    // butter
    const a = num(bAmount);
    const value = a === null ? null : formatQuantity(convertButter(a, bFrom, bTo));
    return {
      label: t('converter.result_equals'),
      value,
      unit: value === null ? undefined : t(`units.${bTo}` as 'units.g'),
      note: t('butter.title'),
      valid: a !== null,
      emptyText: bAmount.trim() === '' ? emptyText : invalidText,
      saveName: t('butter.title'),
      saveLine: `${bAmount} ${t(`units.${bFrom}` as 'units.g')} to ${value} ${t(`units.${bTo}` as 'units.g')} butter`,
    };
  }

  const onSave = () => {
    if (!result.valid) {
      return;
    }
    addRecipe({ name: result.saveName, lines: [result.saveLine] });
    celebrate();
    show({ message: t('recipes.toast_saved'), variant: 'confirmation' });
    setSavedMsg(true);
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => setSavedMsg(false), 2500);
    const count = Number(storage.getItem(CONVERSION_COUNT_KEY) ?? '0') + 1;
    storage.setItem(CONVERSION_COUNT_KEY, String(count));
    if (!isPro && count % 5 === 0) {
      showInterstitialIfReady();
    }
  };

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
    <Screen
      title={t('tabs.convert')}
      footer={
        <Card style={styles.resultCard}>
          <ResultDisplay
            label={result.label}
            value={result.value}
            unit={result.unit}
            note={savedMsg ? t('recipes.toast_saved') : result.note}
            emptyText={result.emptyText}
          />
          <Button
            label={t('converter.save_this')}
            haptic="pop"
            disabled={!result.valid}
            onPress={onSave}
          />
        </Card>
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modeRow}
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
              <Input label={t('oven.amount_label')} value={temp} onChangeText={setTemp} numeric />
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
              <Labeled label={t('butter.to_label')}>{unitRow(BUTTER_UNITS, bTo, setBTo)}</Labeled>
            </>
          ) : null}
        </Card>
      </Animated.View>

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
    </Screen>
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

const styles = StyleSheet.create({
  modeRow: { gap: spacing.sm, paddingVertical: spacing.xs, paddingRight: spacing.xl },
  inputCard: { gap: spacing.lg },
  labeled: { gap: spacing.xs },
  chipRow: { gap: spacing.sm, paddingRight: spacing.xl },
  resultCard: { gap: spacing.md },
});
