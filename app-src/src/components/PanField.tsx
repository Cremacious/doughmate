// A field showing the chosen pan. Tapping it opens a list of common pans.
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { listPans, type Pan } from '@/lib/pan';
import { radius, shadow, spacing, typography } from '@/theme';

export interface PanFieldProps {
  value: Pan;
  onChange: (pan: Pan) => void;
}

export function PanField({ value, onChange }: PanFieldProps) {
  const { palette, bg } = useAppTheme();
  const [open, setOpen] = useState(false);
  const pans = listPans();

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          triggerHaptic('tap');
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.field,
          { backgroundColor: palette.dough, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[typography.body.lg, { color: palette.choc }]}>{value.name}</Text>
        <Text style={[typography.body.md, { color: palette.chocSoft }]}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, shadow.lg, { backgroundColor: bg.elevated }]}>
            <ScrollView>
              {pans.map((pan) => {
                const selected = pan.id === value.id;
                return (
                  <Pressable
                    key={pan.id}
                    accessibilityRole="button"
                    onPress={() => {
                      triggerHaptic('select');
                      onChange(pan);
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
                      style={[
                        typography.body.lg,
                        { color: selected ? palette.crust : palette.choc },
                      ]}
                    >
                      {pan.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
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
    maxWidth: 340,
    maxHeight: '70%',
    borderRadius: radius.xl,
    padding: spacing.sm,
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
});

export default PanField;
