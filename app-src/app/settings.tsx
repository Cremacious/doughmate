// Settings, opened from the gear as a bottom sheet. Grouped cards for appearance,
// sound and feel, preferences, notifications, Pro and about. Every control writes
// straight to the settings store.
//
// Two Fresh Bake calls here. Toggles live in one standard card divided by rules, not
// in a card each, so a group reads as a group. And the flour standard leads with the
// number in Space Grotesk, because 120 or 125 is the decision, not the sentence
// around it.
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { usePro } from '@/state/pro';
import {
  type FlourStandardPref,
  type NumberFormatPref,
  type ThemePref,
  type UnitsPref,
  useSettings,
} from '@/state/settings';
import { radius, spacing, stroke, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { useToast } from '@/ui/Toast';
import { Toggle } from '@/ui/Toggle';

const THEMES: ThemePref[] = ['light', 'dark', 'auto'];
const UNITS: UnitsPref[] = ['metric', 'imperial'];
const FLOURS: FlourStandardPref[] = [120, 125];
const NUMBER_FORMATS: NumberFormatPref[] = ['fraction', 'decimal'];

function SectionLabel({ children }: { children: string }) {
  const { palette, fontScale } = useAppTheme();
  return (
    <Text
      style={[
        typography.labelSm,
        scaleType(typography.labelSm, fontScale),
        styles.section,
        { color: palette.textFaint },
      ]}
    >
      {children}
    </Text>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onValueChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { palette, fontScale } = useAppTheme();
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text
          style={[
            typography.body.lg,
            scaleType(typography.body.lg, fontScale),
            { color: palette.textInk },
          ]}
        >
          {label}
        </Text>
        {desc ? (
          <Text
            style={[
              typography.body.sm,
              scaleType(typography.body.sm, fontScale),
              { color: palette.textFaint },
            ]}
          >
            {desc}
          </Text>
        ) : null}
      </View>
      <Toggle value={value} onValueChange={onValueChange} />
    </View>
  );
}

/** A standard card whose rows are separated by 1.5px rules rather than by gaps. */
function DividedCard({ children }: { children: React.ReactNode[] }) {
  const { palette } = useAppTheme();
  const rows = children.filter(Boolean);
  return (
    <Card style={styles.divided}>
      {rows.map((row, i) => (
        <View key={i}>
          {i > 0 ? <View style={[styles.divider, { backgroundColor: palette.divider }]} /> : null}
          <View style={styles.dividedRow}>{row}</View>
        </View>
      ))}
    </Card>
  );
}

function ChipRow<T extends string | number>({
  label,
  options,
  value,
  render,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  render: (option: T) => string;
  onChange: (value: T) => void;
}) {
  const { palette, fontScale } = useAppTheme();
  return (
    <Card>
      <Text
        style={[
          typography.body.lg,
          scaleType(typography.body.lg, fontScale),
          { color: palette.textInk },
        ]}
      >
        {label}
      </Text>
      <View style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={String(option)}
            label={render(option)}
            emphasis="butter"
            selected={value === option}
            onPress={() => onChange(option)}
          />
        ))}
      </View>
    </Card>
  );
}

export default function SettingsSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { settings, update } = useSettings();
  const { isPro, restore, debugProOverride, setDebugProOverride } = usePro();
  const { show } = useToast();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const [restoring, setRestoring] = useState(false);

  const showTipsAgain = () => {
    update('dismissedTips', []);
    show({ message: t('settings.tips_reset_toast'), variant: 'confirmation' });
  };

  const onRestore = async () => {
    setRestoring(true);
    const restored = await restore();
    setRestoring(false);
    show({
      message: restored ? t('toasts.restore_success') : t('errors.restore_empty'),
      variant: restored ? 'confirmation' : 'neutral',
    });
  };

  const bodyText = [typography.body.lg, scaleType(typography.body.lg, fontScale)];

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
          {t('settings.title')}
        </Text>
      }
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <SectionLabel>{t('settings.section_appearance')}</SectionLabel>
        {/* Three equal pills, and the active one lifts onto its shadow. */}
        <View style={styles.equalRow}>
          {THEMES.map((m) => (
            <View key={m} style={styles.equalCell}>
              <Chip
                label={t(`settings.theme_${m}` as 'settings.theme_auto')}
                emphasis="butter"
                size="md"
                raised
                selected={settings.theme === m}
                onPress={() => update('theme', m)}
              />
            </View>
          ))}
        </View>

        <SectionLabel>{t('settings.section_sound')}</SectionLabel>
        <DividedCard>
          {[
            <ToggleRow
              key="motion"
              label={t('settings.reduced_motion')}
              desc={t('settings.reduced_motion_desc')}
              value={settings.reducedMotion}
              onValueChange={(v) => update('reducedMotion', v)}
            />,
            <ToggleRow
              key="sound"
              label={t('settings.sound_effects')}
              value={settings.soundEffects}
              onValueChange={(v) => update('soundEffects', v)}
            />,
            <ToggleRow
              key="haptics"
              label={t('settings.haptics')}
              value={settings.haptics}
              onValueChange={(v) => update('haptics', v)}
            />,
          ]}
        </DividedCard>

        <SectionLabel>{t('settings.section_preferences')}</SectionLabel>
        <ChipRow
          label={t('settings.default_units')}
          options={UNITS}
          value={settings.units}
          render={(u) => t(`settings.unit_${u}` as 'settings.unit_metric')}
          onChange={(u) => update('units', u)}
        />

        <Card>
          <Text style={[...bodyText, { color: palette.textInk }]}>
            {t('settings.flour_standard')}
          </Text>
          <View style={styles.equalRow}>
            {FLOURS.map((f) => {
              const selected = settings.flourStandard === f;
              return (
                <Pressable
                  key={f}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => update('flourStandard', f)}
                  style={[
                    styles.flourTile,
                    {
                      backgroundColor: selected ? palette.accentButter : palette.bgCanvas,
                      borderColor: selected ? palette.outline : palette.borderField,
                      borderWidth: selected ? stroke.ink : stroke.soft,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.numeric.md,
                      scaleType(typography.numeric.md, fontScale),
                      { color: selected ? palette.onButter : palette.textInk },
                    ]}
                  >
                    {f}
                  </Text>
                  <Text
                    style={[
                      typography.body.sm,
                      scaleType(typography.body.sm, fontScale),
                      { color: selected ? palette.onButterBody : palette.textFaint },
                    ]}
                  >
                    {t(`settings.flour_caption_${f}` as 'settings.flour_caption_120')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <ChipRow
          label={t('settings.number_format')}
          options={NUMBER_FORMATS}
          value={settings.numberFormat}
          render={(n) => t(`settings.number_format_${n}` as 'settings.number_format_fraction')}
          onChange={(n) => update('numberFormat', n)}
        />
        <Card>
          <ToggleRow
            label={t('settings.floured_fingers')}
            desc={t('settings.floured_fingers_desc')}
            value={settings.flouredFingers}
            onValueChange={(v) => update('flouredFingers', v)}
          />
        </Card>

        <SectionLabel>{t('settings.section_notifications')}</SectionLabel>
        <DividedCard>
          {[
            <ToggleRow
              key="reminders"
              label={t('settings.starter_reminders')}
              value={settings.starterReminders}
              onValueChange={(v) => update('starterReminders', v)}
            />,
            <ToggleRow
              key="tip"
              label={t('settings.weekly_tip')}
              value={settings.weeklyTip}
              onValueChange={(v) => update('weeklyTip', v)}
            />,
          ]}
        </DividedCard>
        <Card onPress={showTipsAgain} style={styles.linkRow}>
          <Text style={[...bodyText, { color: palette.textInk }]}>
            {t('settings.show_tips_again')}
          </Text>
          <Text style={[...bodyText, { color: palette.textFaint }]}>↺</Text>
        </Card>

        <SectionLabel>{t('settings.section_pro')}</SectionLabel>
        <Card
          tier="hero"
          heroColor={palette.pro}
          onPress={() => router.push('/paywall')}
          style={styles.linkRow}
        >
          <Text
            style={[
              typography.subheading,
              scaleType(typography.subheading, fontScale),
              styles.linkText,
              { color: palette.onPro },
            ]}
          >
            {isPro ? t('settings.pro_unlocked_row') : t('settings.buy_pro')}
          </Text>
          <Text style={[typography.subheading, { color: palette.onProSoft }]}>›</Text>
        </Card>
        {!isPro ? (
          <Card onPress={onRestore} style={styles.linkRow}>
            <Text style={[...bodyText, { color: palette.textInk }]}>
              {restoring ? t('settings.restoring') : t('settings.restore_purchases')}
            </Text>
          </Card>
        ) : null}
        {__DEV__ ? (
          <Card>
            <ToggleRow
              label={t('settings.debug_pro_override')}
              desc={t('settings.debug_pro_override_desc')}
              value={debugProOverride}
              onValueChange={setDebugProOverride}
            />
          </Card>
        ) : null}

        <SectionLabel>{t('settings.section_about')}</SectionLabel>
        <DividedCard>
          {[
            <View key="sources" style={styles.row}>
              <Text style={[...bodyText, { color: palette.textInk }]}>
                {t('settings.ingredient_sources')}
              </Text>
            </View>,
            <View key="version" style={styles.row}>
              <Text style={[...bodyText, { color: palette.textInk }]}>{t('settings.version')}</Text>
              <Text
                style={[
                  typography.numeric.sm,
                  scaleType(typography.numeric.sm, fontScale),
                  { color: palette.textFaint },
                ]}
              >
                {version}
              </Text>
            </View>,
          ]}
        </DividedCard>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.sm, paddingBottom: spacing['3xl'] },
  section: { marginTop: spacing.md },
  chips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, flexWrap: 'wrap' },
  equalRow: { flexDirection: 'row', gap: spacing.sm },
  equalCell: { flex: 1 },
  divided: { gap: 0 },
  dividedRow: { paddingVertical: spacing.sm },
  divider: { height: stroke.soft },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowText: { flex: 1, gap: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkText: { flexShrink: 1 },
  flourTile: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
});
