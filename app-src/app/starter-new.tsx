// Add a starter, a tall sheet. Name, hydration, feed ratio, feed interval and
// notes. The interval steps in 6 hour jumps. Footer adds the starter.
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useStarters } from '@/state/starters';
import { radius, spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { Stepper } from '@/ui/Stepper';
import { useToast } from '@/ui/Toast';

const HYDRATIONS = [80, 100, 125];
const RATIOS = ['1:1:1', '1:2:2', '1:5:5'];

export default function NewStarterSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { starters, addStarter } = useStarters();
  const { show } = useToast();

  const [name, setName] = useState('');
  const [hydration, setHydration] = useState(100);
  const [ratio, setRatio] = useState('1:2:2');
  const [intervalHours, setIntervalHours] = useState(24);
  const [notes, setNotes] = useState('');

  const save = () => {
    const fallback = t('starters.new_name_placeholder_next', { number: starters.length + 1 });
    const finalName = name.trim() || fallback;
    addStarter({ name: finalName, intervalHours, hydration, ratio, notes: notes.trim() });
    router.back();
    show({ message: t('starters.toast_added', { name: finalName }), variant: 'confirmation' });
  };

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <Text style={[typography.display.md, styles.title, { color: palette.textInk }]}>
          {t('starters.add_title')}
        </Text>
      }
      footer={<Button label={t('starters.button_save')} onPress={save} haptic="pop" />}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label={t('starters.new_name_field')}
          value={name}
          onChangeText={setName}
          placeholder={t('starters.new_name_placeholder')}
        />

        <View style={styles.field}>
          <Text style={[typography.label, { color: palette.textSoft }]}>
            {t('starters.new_hydration_label')}
          </Text>
          <View style={styles.chips}>
            {HYDRATIONS.map((h) => (
              <Chip
                key={h}
                label={t('starters.hydration_badge', { value: h })}
                selected={hydration === h}
                onPress={() => setHydration(h)}
              />
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[typography.label, { color: palette.textSoft }]}>
            {t('starters.new_ratio_label')}
          </Text>
          <View style={styles.chips}>
            {RATIOS.map((r) => (
              <Chip key={r} label={r} selected={ratio === r} onPress={() => setRatio(r)} />
            ))}
          </View>
        </View>

        <View style={styles.rowField}>
          <Text style={[typography.label, { color: palette.textSoft }]}>
            {t('starters.new_interval_label')}
          </Text>
          <View style={styles.intervalRow}>
            <Stepper value={intervalHours} onChange={setIntervalHours} min={6} step={6} />
            <Text style={[typography.numeric.sm, { color: palette.textSoft }]}>
              {t('starters.interval_value', { hours: intervalHours })}
            </Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[typography.label, { color: palette.textSoft }]}>
            {t('starters.new_notes_label')}
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('starters.new_notes_placeholder')}
            placeholderTextColor={palette.textFaint}
            multiline
            textAlignVertical="top"
            style={[
              typography.body.lg,
              styles.area,
              {
                height: fontScale > 1 ? 120 : 100,
                backgroundColor: palette.bgSunken,
                color: palette.textInk,
              },
            ]}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing['3xl'] },
  field: { gap: spacing.xs },
  rowField: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  intervalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  area: { borderRadius: radius.lg, padding: spacing.md },
});
