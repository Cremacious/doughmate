// A bottom sheet that lists options, with optional search. Used to pick an
// ingredient, a pan, a unit, and so on.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { radius, spacing, typography } from '@/theme';
import { BottomSheet } from './BottomSheet';
import { Input } from './Input';

export interface Option {
  id: string;
  label: string;
  hint?: string;
}

export interface OptionSheetProps {
  title: string;
  options: Option[];
  onSelect: (id: string) => void;
  onClose: () => void;
  selectedId?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function OptionSheet({
  title,
  options,
  onSelect,
  onClose,
  selectedId,
  searchable = false,
  searchPlaceholder,
}: OptionSheetProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchable || query.trim() === '') {
      return options;
    }
    const q = query.toLowerCase();
    return options.filter((o) => `${o.label} ${o.hint ?? ''}`.toLowerCase().includes(q));
  }, [options, query, searchable]);

  return (
    <BottomSheet
      size={searchable ? 'full' : 'half'}
      onClose={onClose}
      header={
        <Text style={[typography.display.md, styles.title, { color: palette.textInk }]}>
          {title}
        </Text>
      }
    >
      <View style={styles.body}>
        <View style={styles.topRow}>
          {searchable ? (
            <View style={styles.searchField}>
              <Input
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                autoFocus
              />
            </View>
          ) : (
            <View style={styles.searchField} />
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={() => {
              triggerHaptic('tap');
              onClose();
            }}
            style={[styles.close, { backgroundColor: palette.bgSunken }]}
          >
            <Text style={[typography.heading, { color: palette.textSoft }]}>✕</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {filtered.map((o) => {
            const sel = o.id === selectedId;
            return (
              <Pressable
                key={o.id}
                accessibilityRole="button"
                accessibilityState={{ selected: sel }}
                onPress={() => {
                  triggerHaptic('select');
                  onSelect(o.id);
                  onClose();
                }}
                style={[styles.row, sel ? { backgroundColor: palette.primaryWash } : null]}
              >
                <Text
                  style={[
                    typography.body.lg,
                    styles.rowLabel,
                    { color: sel ? palette.primaryText : palette.textInk },
                  ]}
                >
                  {o.label}
                </Text>
                {o.hint ? (
                  <Text style={[typography.body.sm, { color: palette.textFaint }]}>{o.hint}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  searchField: { flex: 1 },
  close: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  rowLabel: { flexShrink: 1 },
});

export default OptionSheet;
