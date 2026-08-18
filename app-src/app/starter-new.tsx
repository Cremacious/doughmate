// Add a starter, a tall sheet. Name, hydration, feed ratio, feed interval and
// notes. The interval steps in 6 hour jumps. Footer adds the starter.
//
// Hydration and ratio are the same control with two emphases on purpose: hydration
// is the one people actually change, so its selection is butter and lifts onto a hard
// shadow, while the ratio settles for an ink fill.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { useStarters } from '@/state/starters';
import { radius, spacing, stroke, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { Stepper } from '@/ui/Stepper';
import { useToast } from '@/ui/Toast';

const HYDRATIONS = [80, 100, 125];
const RATIOS = ['1:1:1', '1:2:2', '1:5:5'];

export default function NewStarterSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { starters, addStarter, updateStarter, getStarter } = useStarters();
  const { show } = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = id ? getStarter(id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [hydration, setHydration] = useState(existing?.hydration ?? 100);
  const [ratio, setRatio] = useState(existing?.ratio ?? '1:2:2');
  const [intervalHours, setIntervalHours] = useState(existing?.intervalHours ?? 24);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const save = () => {
    const fallback = t('starters.new_name_placeholder_next', { number: starters.length + 1 });
    const finalName = name.trim() || fallback;
    const input = { name: finalName, intervalHours, hydration, ratio, notes: notes.trim() };
    if (existing) {
      updateStarter(existing.id, input);
      router.back();
      show({ message: t('starters.toast_updated', { name: finalName }), variant: 'confirmation' });
    } else {
      addStarter(input);
      router.back();
      show({ message: t('starters.toast_added', { name: finalName }), variant: 'confirmation' });
    }
  };

  const fieldLabel = (text: string) => (
    <Text
      style={[
        typography.label,
        scaleType(typography.label, fontScale),
        { color: palette.textFaint },
      ]}
    >
      {text}
    </Text>
  );

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <View style={styles.header}>
          <Sam size={52} emotion="curious" />
          <Text
            style={[
              typography.display.md,
              scaleType(typography.display.md, fontScale),
              styles.title,
              { color: palette.textInk },
            ]}
          >
            {existing ? t('starters.edit_title') : t('starters.add_title')}
          </Text>
        </View>
      }
      footer={
        <Button
          label={existing ? t('starters.save_changes') : t('starters.button_save')}
          onPress={save}
          haptic="pop"
        />
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Input
            label={t('starters.new_name_field')}
            value={name}
            onChangeText={setName}
            placeholder={t('starters.new_name_placeholder')}
          />
        </Card>

        <Card>
          {fieldLabel(t('starters.new_hydration_label'))}
          <View style={styles.threeUp}>
            {HYDRATIONS.map((h) => (
              <View key={h} style={styles.cell}>
                <Chip
                  label={t('starters.hydration_badge', { value: h })}
                  emphasis="butter"
                  size="md"
                  numeric
                  raised
                  selected={hydration === h}
                  onPress={() => setHydration(h)}
                />
              </View>
            ))}
          </View>

          {fieldLabel(t('starters.new_ratio_label'))}
          <View style={styles.threeUp}>
            {RATIOS.map((r) => (
              <View key={r} style={styles.cell}>
                <Chip
                  label={r}
                  size="md"
                  numeric
                  selected={ratio === r}
                  onPress={() => setRatio(r)}
                />
              </View>
            ))}
          </View>
        </Card>

        <Card>
          {fieldLabel(t('starters.new_interval_label'))}
          <Stepper
            value={intervalHours}
            onChange={setIntervalHours}
            min={6}
            step={6}
            spread
            formatValue={(v) => t('starters.interval_hours', { count: v })}
            decrementLabel={t('starters.new_interval_label')}
            incrementLabel={t('starters.new_interval_label')}
          />
        </Card>

        <Card>
          {fieldLabel(t('starters.new_notes_label'))}
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('starters.new_notes_placeholder')}
            placeholderTextColor={palette.textFaint}
            multiline
            textAlignVertical="top"
            style={[
              typography.body.lg,
              scaleType(typography.body.lg, fontScale),
              styles.area,
              {
                height: fontScale > 1 ? 120 : 100,
                backgroundColor: palette.bgCanvas,
                borderColor: palette.borderField,
                color: palette.textInk,
              },
            ]}
          />
        </Card>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
  },
  title: { flexShrink: 1 },
  body: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing['3xl'] },
  threeUp: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
  area: {
    borderRadius: radius.lg,
    borderWidth: stroke.soft,
    padding: spacing.md,
  },
});
