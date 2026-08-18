// Convert: one shape shifting calculator holding all six converters. The answer is
// the hero, and the mode swaps the input card in place below it. No back buttons.
//
// Two Fresh Bake rules shape this screen. The mode row only spells out the selected
// converter and collapses the rest to icons plus a +N pill, so six converters fit in
// 390px without the row clipping. And only one unit chip row is ever on screen: the
// UnitPair states the conversion, and tapping a half reveals that side.
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TIMER_BANNER_SPACE, useTimerBannerVisible } from '@/hooks/useTimerBannerVisible';
import {
  convert,
  formatQuantity,
  getIngredient,
  type Ingredient,
  round,
  searchIngredients,
  type Unit,
} from '@/lib/convert';
import {
  combineAmount,
  FRACTION_CHOICES,
  isFractionInputUnit,
  splitAmount,
  WHOLE_MAX,
} from '@/lib/amountInput';
import { BUTTER_STICK_G, type ButterUnit, convertButter } from '@/lib/butter';
import { convertEggs, type EggId, getEggSize, listEggSizes } from '@/lib/egg';
import { cToF, fToC, nearestGasMark } from '@/lib/oven';
import { bakeTimeHint, getPan, listPans, type Pan, panScaleFactor } from '@/lib/pan';
import { scaleType } from '@/lib/typeScale';
import { convertYeast, getYeastType, listYeastTypes, type YeastId } from '@/lib/yeast';
import { useSettings } from '@/state/settings';
import { spacing, typography } from '@/theme';
import { AdSlot, AD_SLOT_SPACE, useAdSlotVisible } from '@/ui/AdSlot';
import { AmountField } from '@/ui/AmountField';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { ModeChip, ModeOverflowChip } from '@/ui/ModeChip';
import { ModeTray } from '@/ui/ModeTray';
import { OptionSheet, type Option } from '@/ui/OptionSheet';
import { PickerField } from '@/ui/PickerField';
import { ResultDisplay } from '@/ui/ResultDisplay';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Stepper } from '@/ui/Stepper';
import { UnitPair, type UnitSide } from '@/ui/UnitPair';

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

/** Collapsed icon chips beside the selected one. Floured fingers trades them for size. */
const VISIBLE_OTHERS = { normal: 3, floured: 1 } as const;

const INGREDIENT_FROM: Unit[] = ['cup', 'tbsp', 'tsp', 'ml', 'g', 'oz', 'lb'];
const INGREDIENT_TO: Unit[] = ['g', 'oz', 'lb', 'cup', 'tbsp', 'tsp', 'ml'];
const BUTTER_UNITS: ButterUnit[] = ['stick', 'cup', 'tbsp', 'tsp', 'g', 'oz'];
/** The temperatures bakers actually set, so the field is usually one tap. */
const COMMON_TEMPS = { f: [325, 350, 375, 400, 425, 450], c: [160, 180, 190, 200, 220, 230] };

const DEFAULT_INGREDIENT: Ingredient = getIngredient('all_purpose_flour')!;

interface Result {
  label: string;
  value: string | null;
  unit?: string;
  /** A qualifier, rendered as a butter pill. */
  contextPill?: string;
  /** A sentence, rendered as an ink inset. Only the pan hint uses this. */
  contextNote?: string;
  emptyText: string;
}

export default function ConvertScreen() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const reduced = useReducedMotion();
  const { settings } = useSettings();
  const adVisible = useAdSlotVisible();
  const bannerVisible = useTimerBannerVisible();

  const [mode, setMode] = useState<Mode>('ingredient');
  const [sheet, setSheet] = useState<
    'modes' | 'ingredient' | 'panFrom' | 'panTo' | 'amountWhole' | 'amountFraction' | null
  >(null);
  // Which side of the UnitPair has its chip row revealed. Never both.
  const [openSide, setOpenSide] = useState<UnitSide>('from');

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

  const floured = fontScale > 1;
  const gutter = floured ? 20 : spacing.xl;
  // The tab navigator reserves the shelf below this screen, so only the gap is ours.
  const bottomClearance = spacing['2xl'] + (adVisible ? AD_SLOT_SPACE : 0);

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
        contextPill:
          a === null
            ? undefined
            : t('converter.context_amount', {
                amount: formatQuantity(a, { format: settings.numberFormat, unit: iFrom }),
                unit: t(`units.${iFrom}` as 'units.g'),
                ingredient: ingredient.name,
              }),
        emptyText: amount.trim() === '' ? emptyText : invalidText,
      };
    }
    if (mode === 'pan') {
      const factor = panScaleFactor(fromPan.area_sqin, toPan.area_sqin);
      const hint = bakeTimeHint(fromPan.area_sqin, toPan.area_sqin);
      return {
        label: t('pan.scale_label'),
        value: factor === null ? null : formatQuantity(factor),
        unit: t('pan.scale_unit'),
        contextNote: t(`pan.bake_${hint}` as 'pan.bake_same'),
        emptyText,
      };
    }
    if (mode === 'oven') {
      const v = num(temp);
      if (v === null) {
        return {
          label: t('oven.reads_label'),
          value: null,
          emptyText: temp.trim() === '' ? emptyText : invalidText,
        };
      }
      const f = ovenUnit === 'f' ? v : cToF(v);
      const c = ovenUnit === 'c' ? v : fToC(v);
      const other = ovenUnit === 'f' ? round(c) : round(f);
      return {
        label: t('oven.reads_label'),
        value: String(other),
        unit: t(ovenUnit === 'f' ? 'oven.degrees_c' : 'oven.degrees_f'),
        contextPill: `${t('oven.gas_mark')} ${nearestGasMark(f)}`,
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
        contextPill: getYeastType(yTo)?.name,
        emptyText: yAmount.trim() === '' ? emptyText : invalidText,
      };
    }
    if (mode === 'egg') {
      const size = getEggSize(eTo);
      return {
        label: t('egg.to_label'),
        value: formatQuantity(convertEggs(eggCount, eFrom, eTo)),
        unit: t('egg.result_suffix'),
        contextPill: size
          ? t('egg.context_each', { size: size.name, grams: round(size.whole_g) })
          : undefined,
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
    const sticks = a === null ? null : convertButter(a, bFrom, 'stick');
    return {
      label: t('converter.result_equals'),
      value,
      unit: value === null ? undefined : t(`units.${bTo}` as 'units.g'),
      contextPill:
        sticks === null
          ? undefined
          : t('butter.context', {
              // count only picks the plural; amount is what the pill shows, and in
              // fraction mode that is "1 1/2", which is not a number.
              count: sticks === 1 ? 1 : 2,
              amount: formatQuantity(sticks, {
                format: settings.numberFormat,
                unit: 'stick',
              }),
              grams: round(sticks * BUTTER_STICK_G),
            }),
      emptyText: bAmount.trim() === '' ? emptyText : invalidText,
    };
  }

  /** A wrapping row of unit or type chips. Only one of these is ever on screen. */
  const chipRow = <T extends string>(
    options: { id: T; label: string }[],
    value: T,
    onChange: (v: T) => void,
    numeric = false
  ) => (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Chip
          key={o.id}
          label={o.label}
          numeric={numeric}
          selected={value === o.id}
          onPress={() => onChange(o.id)}
        />
      ))}
    </View>
  );

  const unitOptions = <T extends string>(units: T[]) =>
    units.map((u) => ({ id: u, label: t(`units.${u}` as 'units.g') }));

  // Fraction entry only makes sense in Fractions mode, and only for scooped
  // units (yeast is always in teaspoons, so it always qualifies).
  const asFraction = settings.numberFormat === 'fraction';
  const ingredientFraction = asFraction && isFractionInputUnit(iFrom);
  const butterFraction = asFraction && isFractionInputUnit(bFrom);
  const yeastFraction = asFraction;

  // The amount the whole/fraction sheets edit, bound to the active mode.
  const amountBinding =
    mode === 'yeast'
      ? { value: yAmount, set: setYAmount }
      : mode === 'butter'
        ? { value: bAmount, set: setBAmount }
        : { value: amount, set: setAmount };
  const activeSplit = splitAmount(Number(amountBinding.value));
  const setWhole = (w: number) =>
    amountBinding.set(String(combineAmount(w, activeSplit.fractionId)));
  const setFraction = (id: string) =>
    amountBinding.set(String(combineAmount(activeSplit.whole, id)));

  // Selected first, then as many collapsed icons as fit, then the tray.
  const others = MODES.filter((m) => m !== mode);
  const visibleOthers = others.slice(0, floured ? VISIBLE_OTHERS.floured : VISIBLE_OTHERS.normal);
  const hiddenCount = others.length - visibleOthers.length;

  const amountField = (
    value: string,
    onChangeText: (v: string) => void,
    label: string,
    fraction: boolean
  ) => (
    <AmountField
      label={label}
      wholeLabel={t('converter.amount_whole')}
      fractionLabel={t('converter.amount_fraction')}
      value={value}
      onChangeText={onChangeText}
      fraction={fraction}
      onOpenWhole={() => setSheet('amountWhole')}
      onOpenFraction={() => setSheet('amountFraction')}
    />
  );

  /**
   * Amount beside the unit pair when the amount is a single field, and stacked when
   * fraction entry splits it into a whole and a fraction. Three controls do not fit
   * on one 390px row: the labels wrap and the fields stop lining up.
   */
  const amountAndUnits = (
    value: string,
    onChangeText: (v: string) => void,
    amountLabel: string,
    fraction: boolean,
    fromLabel: string,
    toLabel: string
  ) =>
    fraction ? (
      <>
        {amountField(value, onChangeText, amountLabel, true)}
        {unitPair(fromLabel, toLabel)}
      </>
    ) : (
      <View style={styles.pairRow}>
        <View style={styles.amountCell}>
          {amountField(value, onChangeText, amountLabel, false)}
        </View>
        <View style={styles.unitCell}>{unitPair(fromLabel, toLabel)}</View>
      </View>
    );

  const unitPair = (fromLabel: string, toLabel: string) => (
    <View style={styles.pairColumn}>
      <Text
        style={[
          typography.label,
          scaleType(typography.label, fontScale),
          { color: palette.textFaint },
        ]}
      >
        {t('converter.label_equals')}
      </Text>
      <UnitPair
        fromLabel={fromLabel}
        toLabel={toLabel}
        openSide={openSide}
        onPressSide={setOpenSide}
        fromAccessibilityLabel={`${t('converter.label_from_unit')}. ${fromLabel}`}
        toAccessibilityLabel={`${t('converter.label_to_unit')}. ${toLabel}`}
      />
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bgCanvas }]}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        {/*
          The timers pill floats over the top edge, so the scroll viewport starts below
          it. That keeps the mode row from pinning underneath the pill.
        */}
        <View style={[styles.flex, bannerVisible && { paddingTop: TIMER_BANNER_SPACE }]}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={{ paddingBottom: bottomClearance }}
            stickyHeaderIndices={MODE_ROW_STICKY}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ paddingHorizontal: gutter }}>
              <ScreenHeader
                title={t('tabs.convert')}
                eyebrow={t(`converter.modes.${mode}` as 'converter.modes.ingredient')}
                eyebrowColor={palette.primaryText}
                settingsLabel={t('common.open_settings')}
              />
            </View>

            {/*
              The one pinned row on this screen. Opaque and full bleed, so the answer
              and the input card scroll under something the eye can see rather than
              being cut at a seam the colour of the canvas. paddingBottom keeps the
              selected chip's hard shadow inside the band.
            */}
            <View
              style={[
                styles.modeBand,
                { paddingHorizontal: gutter, backgroundColor: palette.bgCanvas },
              ]}
            >
              <View
                accessibilityRole="tablist"
                accessibilityLabel={t('converter.mode_row_label')}
                style={styles.modeRow}
              >
                <ModeChip
                  iconName={MODE_ICON[mode]}
                  label={t(`converter.modes.${mode}` as 'converter.modes.ingredient')}
                  selected
                  onPress={() => setSheet('modes')}
                />
                {visibleOthers.map((m) => (
                  <ModeChip
                    key={m}
                    iconName={MODE_ICON[m]}
                    label={t(`converter.modes.${m}` as 'converter.modes.ingredient')}
                    selected={false}
                    onPress={() => setMode(m)}
                  />
                ))}
                {hiddenCount > 0 ? (
                  <ModeOverflowChip
                    count={hiddenCount}
                    label={t('common.more_converters')}
                    onPress={() => setSheet('modes')}
                  />
                ) : null}
              </View>
            </View>

            {/* The answer and its inputs move together: one page, one scroll. */}
            <View style={[styles.body, { paddingHorizontal: gutter }]}>
              <ResultDisplay
                label={result.label}
                value={result.value}
                unit={result.unit}
                emptyText={result.emptyText}
                contextPill={result.contextPill}
                contextNote={result.contextNote}
              />
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
                      {amountAndUnits(
                        amount,
                        setAmount,
                        t('converter.label_amount'),
                        ingredientFraction,
                        t(`units.${iFrom}` as 'units.g'),
                        t(`units.${iTo}` as 'units.g')
                      )}
                      {openSide === 'from'
                        ? chipRow(unitOptions(INGREDIENT_FROM), iFrom, setIFrom)
                        : chipRow(unitOptions(INGREDIENT_TO), iTo, setITo)}
                    </>
                  ) : null}

                  {mode === 'pan' ? (
                    <>
                      <PanPicker
                        label={t('pan.from_label')}
                        pan={fromPan}
                        onPress={() => setSheet('panFrom')}
                      />
                      <Text style={[styles.panArrow, { color: palette.textInk }]}>↓</Text>
                      <PanPicker
                        label={t('pan.to_label')}
                        pan={toPan}
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
                        height={76}
                        numericSize={44}
                      />
                      <View style={styles.halfRow}>
                        {(['f', 'c'] as const).map((u) => (
                          <View key={u} style={styles.halfCell}>
                            <Chip
                              label={t(u === 'f' ? 'oven.unit_f' : 'oven.unit_c')}
                              size="md"
                              selected={ovenUnit === u}
                              onPress={() => setOvenUnit(u)}
                            />
                          </View>
                        ))}
                      </View>
                      {chipRow(
                        COMMON_TEMPS[ovenUnit].map((v) => ({ id: String(v), label: String(v) })),
                        temp,
                        setTemp,
                        true
                      )}
                    </>
                  ) : null}

                  {mode === 'yeast' ? (
                    <>
                      {amountAndUnits(
                        yAmount,
                        setYAmount,
                        t('yeast.amount_label'),
                        yeastFraction,
                        getYeastType(yFrom)?.name ?? '',
                        getYeastType(yTo)?.name ?? ''
                      )}
                      {openSide === 'from'
                        ? chipRow(
                            listYeastTypes().map((y) => ({ id: y.id, label: y.name })),
                            yFrom,
                            setYFrom
                          )
                        : chipRow(
                            listYeastTypes().map((y) => ({ id: y.id, label: y.name })),
                            yTo,
                            setYTo
                          )}
                    </>
                  ) : null}

                  {mode === 'egg' ? (
                    <>
                      <Labeled label={t('egg.count_label')}>
                        <Stepper
                          value={eggCount}
                          onChange={setEggCount}
                          min={1}
                          size={52}
                          spread
                          decrementLabel={t('egg.count_label')}
                          incrementLabel={t('egg.count_label')}
                        />
                      </Labeled>
                      <Labeled label={t('egg.from_label')}>
                        {chipRow(
                          listEggSizes().map((s) => ({ id: s.id, label: s.name })),
                          eFrom,
                          setEFrom
                        )}
                      </Labeled>
                      <Labeled label={t('egg.to_label')}>
                        {chipRow(
                          listEggSizes().map((s) => ({ id: s.id, label: s.name })),
                          eTo,
                          setETo
                        )}
                      </Labeled>
                    </>
                  ) : null}

                  {mode === 'butter' ? (
                    <>
                      {amountAndUnits(
                        bAmount,
                        setBAmount,
                        t('butter.amount_label'),
                        butterFraction,
                        t(`units.${bFrom}` as 'units.g'),
                        t(`units.${bTo}` as 'units.g')
                      )}
                      {openSide === 'from'
                        ? chipRow(unitOptions(BUTTER_UNITS), bFrom, setBFrom)
                        : chipRow(unitOptions(BUTTER_UNITS), bTo, setBTo)}
                    </>
                  ) : null}
                </Card>
              </Animated.View>

              {/* Sam's footnote lives on the canvas, not in a dismissible tip card. */}
              <View style={styles.footnote}>
                <Sam size={30} />
                <Text
                  style={[
                    typography.body.sm,
                    scaleType(typography.body.sm, fontScale),
                    styles.footnoteText,
                    { color: palette.textFaint },
                  ]}
                >
                  {t('tips.convert_modes')}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      <AdSlot />

      {sheet === 'modes' ? (
        <ModeTray
          title={t('converter.tray_title')}
          selectedId={mode}
          onClose={() => setSheet(null)}
          onSelect={(id) => setMode(id as Mode)}
          options={MODES.map((m) => ({
            id: m,
            label: t(`converter.modes.${m}` as 'converter.modes.ingredient'),
            hint: t(`converter.modes_hint.${m}` as 'converter.modes_hint.ingredient'),
            iconName: MODE_ICON[m],
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

      {sheet === 'amountWhole' ? (
        <OptionSheet
          title={t('converter.pick_whole')}
          selectedId={String(activeSplit.whole)}
          onClose={() => setSheet(null)}
          onSelect={(id) => setWhole(Number(id))}
          options={Array.from({ length: WHOLE_MAX + 1 }, (_, i) => ({
            id: String(i),
            label: String(i),
          }))}
        />
      ) : null}

      {sheet === 'amountFraction' ? (
        <OptionSheet
          title={t('converter.pick_fraction')}
          selectedId={activeSplit.fractionId}
          onClose={() => setSheet(null)}
          onSelect={setFraction}
          options={FRACTION_CHOICES.map((c) => ({ id: c.id, label: c.label }))}
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

/** A pan picker showing the pan's name over its area, which is what actually scales. */
function PanPicker({ label, pan, onPress }: { label: string; pan: Pan; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <PickerField
      label={`${label} · ${t('pan.area', { area: pan.area_sqin })}`}
      value={pan.name}
      onPress={onPress}
    />
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  const { palette, fontScale } = useAppTheme();
  return (
    <View style={styles.labeled}>
      <Text
        style={[
          typography.label,
          scaleType(typography.label, fontScale),
          { color: palette.textFaint },
        ]}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

/** The mode row is the second block in the scroll, after the header. */
const MODE_ROW_STICKY = [1];

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  // The band is the sticky child, so it carries only paint and padding. React Native
  // moves a sticky child's style onto its own wrapper and replaces it with flex: 1,
  // which would strip flexDirection and stack the chips. The row lives one level in,
  // where its layout survives. paddingBottom keeps the selected chip's shadow inside.
  modeBand: { paddingTop: spacing.xs, paddingBottom: spacing.sm },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  body: { paddingTop: spacing.sm, gap: spacing.md },
  inputCard: { gap: spacing.md },
  labeled: { gap: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pairRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-end' },
  amountCell: { flex: 1 },
  // The unit pair carries two words and an arrow, so it takes the wider share.
  unitCell: { flex: 1.25 },
  halfCell: { flex: 1 },
  pairColumn: { gap: spacing.xs },
  halfRow: { flexDirection: 'row', gap: spacing.sm },
  panArrow: { textAlign: 'center', fontSize: 22, lineHeight: 24 },
  footnote: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  footnoteText: { flex: 1 },
});
