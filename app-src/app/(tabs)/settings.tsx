// Settings: appearance, sound and feel, preferences, notifications, about.
// Every control reads and writes the persisted settings store.
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePro } from '@/state/pro';
import {
  type FlourStandardPref,
  type ThemePref,
  type UnitsPref,
  useSettings,
} from '@/state/settings';
import { spacing, typography } from '@/theme';

function SectionTitle({ children }: { children: string }) {
  const { palette } = useAppTheme();
  return (
    <Text style={[typography.caption, styles.sectionTitle, { color: palette.chocSoft }]}>
      {children}
    </Text>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={[typography.body.lg, { color: palette.choc }]}>{label}</Text>
        {description ? (
          <Text style={[typography.body.sm, { color: palette.chocSoft }]}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.dough, true: palette.crust }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();
  const { settings, update } = useSettings();
  const { isPro } = usePro();

  const themeOptions = [
    { key: 'auto' as ThemePref, label: t('settings.theme_auto') },
    { key: 'light' as ThemePref, label: t('settings.theme_light') },
    { key: 'dark' as ThemePref, label: t('settings.theme_dark') },
  ];
  const unitOptions = [
    { key: 'metric' as UnitsPref, label: t('settings.unit_metric') },
    { key: 'imperial' as UnitsPref, label: t('settings.unit_imperial') },
  ];
  const flourOptions = [
    { key: '120', label: t('settings.flour_120') },
    { key: '125', label: t('settings.flour_125') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.display.md, styles.title, { color: palette.choc }]}>
          {t('settings.title')}
        </Text>

        <SectionTitle>{t('settings.section_appearance')}</SectionTitle>
        <Card>
          <Text style={[typography.body.lg, styles.label, { color: palette.choc }]}>
            {t('settings.theme_label')}
          </Text>
          <Chips
            options={themeOptions}
            value={settings.theme}
            onChange={(v) => update('theme', v)}
          />
        </Card>

        <SectionTitle>{t('settings.section_sound')}</SectionTitle>
        <Card style={styles.stack}>
          <ToggleRow
            label={t('settings.reduced_motion')}
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

        <SectionTitle>{t('settings.section_preferences')}</SectionTitle>
        <Card style={styles.stack}>
          <View>
            <Text style={[typography.body.lg, styles.label, { color: palette.choc }]}>
              {t('settings.default_units')}
            </Text>
            <Chips
              options={unitOptions}
              value={settings.units}
              onChange={(v) => update('units', v)}
            />
          </View>
          <View>
            <Text style={[typography.body.lg, styles.label, { color: palette.choc }]}>
              {t('settings.flour_standard')}
            </Text>
            <Chips
              options={flourOptions}
              value={String(settings.flourStandard)}
              onChange={(v) => update('flourStandard', Number(v) as FlourStandardPref)}
            />
          </View>
          <ToggleRow
            label={t('settings.floured_fingers')}
            description={t('settings.floured_fingers_desc')}
            value={settings.flouredFingers}
            onValueChange={(v) => update('flouredFingers', v)}
          />
        </Card>

        <SectionTitle>{t('settings.section_pro')}</SectionTitle>
        <Pressable accessibilityRole="button" onPress={() => router.push('/paywall')}>
          <Card style={styles.proRow}>
            <Text style={[typography.body.lg, { color: palette.choc }]}>
              {isPro ? t('toasts.pro_unlocked') : t('settings.buy_pro')}
            </Text>
            <Text style={[typography.body.lg, { color: palette.crust }]}>›</Text>
          </Card>
        </Pressable>

        <SectionTitle>{t('settings.section_notifications')}</SectionTitle>
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

        <SectionTitle>{t('settings.section_about')}</SectionTitle>
        <Card>
          <View style={styles.row}>
            <Text style={[typography.body.lg, { color: palette.choc }]}>
              {t('settings.version')}
            </Text>
            <Text style={[typography.body.md, { color: palette.chocSoft }]}>
              {Constants.expoConfig?.version ?? '1.0.0'}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['3xl'] * 2, gap: spacing.sm },
  title: { marginBottom: spacing.sm },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.xs, textTransform: 'uppercase' },
  stack: { gap: spacing.lg },
  label: { marginBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowText: { flexShrink: 1, gap: spacing['2xs'] },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
