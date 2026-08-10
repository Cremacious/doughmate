// A small pill showing the current unit. Tapping it opens a chooser.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import type { Unit } from '@/lib/convert';
import { radius, shadow, spacing, typography } from '@/theme';

const UNITS: Unit[] = ['cup', 'tbsp', 'tsp', 'ml', 'g', 'oz', 'lb'];

export interface UnitFieldProps {
  value: Unit;
  onChange: (unit: Unit) => void;
}

export function UnitField({ value, onChange }: UnitFieldProps) {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          triggerHaptic('tap');
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.pill,
          { backgroundColor: palette.dough, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[typography.body.lg, { color: palette.choc }]}>{t(`units.${value}`)}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, shadow.lg, { backgroundColor: bg.elevated }]}>
            {UNITS.map((unit) => {
              const selected = unit === value;
              return (
                <Pressable
                  key={unit}
                  accessibilityRole="button"
                  onPress={() => {
                    triggerHaptic('select');
                    onChange(unit);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: selected ? palette.steam : 'transparent',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[typography.body.lg, { color: selected ? palette.crust : palette.choc }]}
                  >
                    {t(`units.${unit}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 320,
    borderRadius: radius.xl,
    padding: spacing.sm,
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
});

export default UnitField;
