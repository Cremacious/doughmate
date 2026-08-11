// Settings, opened from the gear as a bottom sheet. Appearance and sound/feel
// are wired now; the remaining sections land in phase 5.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { usePro } from '@/state/pro';
import { type ThemePref, useSettings } from '@/state/settings';
import { spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Toggle } from '@/ui/Toggle';

const THEMES: ThemePref[] = ['auto', 'light', 'dark'];

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[typography.body.lg, { color: palette.textInk }]}>{label}</Text>
      <Toggle value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function SettingsSheet() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { settings, update } = useSettings();
  const { isPro } = usePro();

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
      <View style={styles.body}>
        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('settings.section_appearance')}
        </Text>
        <Card>
          <Text style={[typography.body.lg, { color: palette.textInk }]}>
            {t('settings.theme_label')}
          </Text>
          <View style={styles.chips}>
            {THEMES.map((m) => (
              <Chip
                key={m}
                label={t(`settings.theme_${m}` as 'settings.theme_auto')}
                selected={settings.theme === m}
                onPress={() => update('theme', m)}
              />
            ))}
          </View>
        </Card>

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('settings.section_sound')}
        </Text>
        <Card style={styles.stack}>
          <ToggleRow
            label={t('settings.reduced_motion')}
            value={settings.reducedMotion}
            onValueChange={(v) => update('reducedMotion', v)}
          />
          <ToggleRow
            label={t('settings.haptics')}
            value={settings.haptics}
            onValueChange={(v) => update('haptics', v)}
          />
          <ToggleRow
            label={t('settings.floured_fingers')}
            value={settings.flouredFingers}
            onValueChange={(v) => update('flouredFingers', v)}
          />
        </Card>

        <Text style={[typography.label, { color: palette.textSoft }]}>
          {t('settings.section_pro')}
        </Text>
        <Card onPress={() => router.push('/paywall')} style={styles.proRow}>
          <Text style={[typography.body.lg, { color: palette.pro }]}>
            {isPro ? t('toasts.pro_unlocked') : t('settings.buy_pro')}
          </Text>
          <Text style={[typography.body.lg, { color: palette.pro }]}>›</Text>
        </Card>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.sm },
  chips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, flexWrap: 'wrap' },
  stack: { gap: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  proRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
