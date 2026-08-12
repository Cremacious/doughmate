// Settings, opened from the gear as a bottom sheet. Grouped cards for appearance,
// sound and feel, preferences, notifications, Pro and about. Every control writes
// straight to the settings store.
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { usePro } from '@/state/pro';
import {
  type FlourStandardPref,
  type ThemePref,
  type UnitsPref,
  useSettings,
} from '@/state/settings';
import { spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { useToast } from '@/ui/Toast';
import { Toggle } from '@/ui/Toggle';

const THEMES: ThemePref[] = ['light', 'dark', 'auto'];
const UNITS: UnitsPref[] = ['metric', 'imperial'];
const FLOURS: FlourStandardPref[] = [120, 125];

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
  const { palette } = useAppTheme();
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={[typography.body.lg, { color: palette.textInk }]}>{label}</Text>
        {desc ? (
          <Text style={[typography.body.sm, { color: palette.textFaint }]}>{desc}</Text>
        ) : null}
      </View>
      <Toggle value={value} onValueChange={onValueChange} />
    </View>
  );
}

function SegmentRow<T extends string | number>({
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
  const { palette } = useAppTheme();
  return (
    <Card>
      <Text style={[typography.body.lg, { color: palette.textInk }]}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={String(option)}
            label={render(option)}
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
  const { palette } = useAppTheme();
  const { settings, update } = useSettings();
  const { isPro } = usePro();
  const { show } = useToast();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const showTipsAgain = () => {
    update('dismissedTips', []);
    show({ message: t('settings.tips_reset_toast'), variant: 'confirmation' });
  };

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <Text style={[typography.display.md, styles.title, { color: palette.textInk }]}>
          {t('settings.title')}
        </Text>
      }
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('settings.section_appearance')}
        </Text>
        <SegmentRow
          label={t('settings.theme_label')}
          options={THEMES}
          value={settings.theme}
          render={(m) => t(`settings.theme_${m}` as 'settings.theme_auto')}
          onChange={(m) => update('theme', m)}
        />

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('settings.section_sound')}
        </Text>
        <Card style={styles.stack}>
          <ToggleRow
            label={t('settings.reduced_motion')}
            desc={t('settings.reduced_motion_desc')}
            value={settings.reducedMotion}
            onValueChange={(v) => update('reducedMotion', v)}
          />
          <ToggleRow
            label={t('settings.sound_effects')}
            value={settings.soundEffects}
            onValueChange={(v) => update('soundEffects', v)}
          />
          <ToggleRow
            label={t('settings.haptics')}
            value={settings.haptics}
            onValueChange={(v) => update('haptics', v)}
          />
        </Card>

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('settings.section_preferences')}
        </Text>
        <SegmentRow
          label={t('settings.default_units')}
          options={UNITS}
          value={settings.units}
          render={(u) => t(`settings.unit_${u}` as 'settings.unit_metric')}
          onChange={(u) => update('units', u)}
        />
        <SegmentRow
          label={t('settings.flour_standard')}
          options={FLOURS}
          value={settings.flourStandard}
          render={(f) => t(`settings.flour_${f}` as 'settings.flour_120')}
          onChange={(f) => update('flourStandard', f)}
        />
        <Card>
          <ToggleRow
            label={t('settings.floured_fingers')}
            desc={t('settings.floured_fingers_desc')}
            value={settings.flouredFingers}
            onValueChange={(v) => update('flouredFingers', v)}
          />
        </Card>

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('settings.section_notifications')}
        </Text>
        <Card style={styles.stack}>
          <ToggleRow
            label={t('settings.starter_reminders')}
            value={settings.starterReminders}
            onValueChange={(v) => update('starterReminders', v)}
          />
          <ToggleRow
            label={t('settings.weekly_tip')}
            value={settings.weeklyTip}
            onValueChange={(v) => update('weeklyTip', v)}
          />
        </Card>
        <Card onPress={showTipsAgain} style={styles.proRow}>
          <Text style={[typography.body.lg, { color: palette.textInk }]}>
            {t('settings.show_tips_again')}
          </Text>
          <Text style={[typography.body.lg, { color: palette.textFaint }]}>↺</Text>
        </Card>

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('settings.section_pro')}
        </Text>
        <Card onPress={() => router.push('/paywall')} style={styles.proRow}>
          <Text style={[typography.body.lg, { color: palette.pro }]}>
            {isPro ? t('settings.pro_unlocked_row') : t('settings.buy_pro')}
          </Text>
          <Text style={[typography.body.lg, { color: palette.pro }]}>›</Text>
        </Card>

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('settings.section_about')}
        </Text>
        <Card style={styles.stack}>
          <View style={styles.row}>
            <Text style={[typography.body.lg, { color: palette.textInk }]}>
              {t('settings.ingredient_sources')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[typography.body.lg, { color: palette.textInk }]}>
              {t('settings.version')}
            </Text>
            <Text style={[typography.numeric.sm, { color: palette.textFaint }]}>{version}</Text>
          </View>
        </Card>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.sm, paddingBottom: spacing['3xl'] },
  chips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, flexWrap: 'wrap' },
  stack: { gap: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowText: { flex: 1, gap: 2 },
  proRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
