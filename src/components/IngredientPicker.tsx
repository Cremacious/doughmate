// A field showing the chosen ingredient. Tapping opens a searchable list.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { type Ingredient, searchIngredients } from '@/lib/convert';
import { triggerHaptic } from '@/lib/haptics';
import { radius, spacing, typography } from '@/theme';

export interface IngredientPickerProps {
  value: Ingredient;
  onChange: (ingredient: Ingredient) => void;
}

export function IngredientPicker({ value, onChange }: IngredientPickerProps) {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchIngredients(query), [query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

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
        <Text style={[typography.body.lg, { color: palette.choc }]} numberOfLines={1}>
          {value.name}
        </Text>
        <Text style={[typography.body.md, { color: palette.chocSoft }]}>▾</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={close}>
        <SafeAreaView style={[styles.modal, { backgroundColor: bg.primary }]} edges={['top']}>
          <View style={styles.searchRow}>
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder={t('converter.picker_search_placeholder')}
              placeholderTextColor={palette.chocSoft}
              style={[
                typography.body.lg,
                styles.search,
                { backgroundColor: bg.subtle, color: palette.choc },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('paywall.close')}
              onPress={close}
              style={styles.close}
            >
              <Text style={[typography.body.lg, { color: palette.crust }]}>✕</Text>
            </Pressable>
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = item.id === value.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    triggerHaptic('select');
                    onChange(item);
                    close();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: pressed ? bg.subtle : 'transparent' },
                  ]}
                >
                  <Text
                    style={[typography.body.lg, { color: selected ? palette.crust : palette.choc }]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
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
  modal: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  search: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  close: {
    padding: spacing.sm,
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

export default IngredientPicker;
