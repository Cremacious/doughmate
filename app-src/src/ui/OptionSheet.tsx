// A bottom sheet that lists options, with optional search. Used to pick an
// ingredient, a pan, a unit, and so on.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { radius, spacing, stroke, typography } from '@/theme';
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
  /**
   * Overrides the sheet height. Defaults to full when searchable, half
   * otherwise. A sheet opened from inside another BottomSheet (rather than
   * directly on a screen) needs `tall` instead of `full` — the outer sheet
   * clips its own content to its panel, so a nested `full` sheet's content
   * renders past that boundary and never becomes visible.
   */
  size?: 'half' | 'tall' | 'full';
}

export function OptionSheet({
  title,
  options,
  onSelect,
  onClose,
  selectedId,
  searchable = false,
  searchPlaceholder,
  size,
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
      size={size ?? (searchable ? 'full' : 'half')}
      onClose={onClose}
      // Close sits on the title's own line, top right. It used to ride the search
      // row instead, which reads as part of the search field when there is one and,
      // when there is not, leaves the button stranded on an otherwise empty row
      // directly under the title.
      header={
        <View style={styles.headerRow}>
          <Text
            style={[
              typography.display.md,
              styles.title,
              // The base 32/34 line box crops this font's ascenders (same class of
              // clip `numeralLine` exists to avoid for big numerals).
              { lineHeight: typography.display.md.lineHeight + 6, color: palette.textInk },
            ]}
          >
            {title}
          </Text>
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
      }
    >
      <View style={styles.body}>
        {searchable ? (
          <View style={styles.searchRow}>
            <Input value={query} onChangeText={setQuery} placeholder={searchPlaceholder} />
          </View>
        ) : null}
        <ScrollView
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
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
                style={[
                  styles.row,
                  sel
                    ? { backgroundColor: palette.accentButter, borderColor: palette.outline }
                    : { borderColor: 'transparent' },
                ]}
              >
                <Text
                  style={[
                    typography.body.lg,
                    styles.rowLabel,
                    { color: sel ? palette.onButter : palette.textInk },
                  ]}
                >
                  {o.label}
                </Text>
                {o.hint ? (
                  <Text
                    style={[
                      typography.body.sm,
                      { color: sel ? palette.onButterBody : palette.textFaint },
                    ]}
                  >
                    {o.hint}
                  </Text>
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
  // The sheet's drag area centres its children, so the row has to stretch itself
  // to full width or it shrinks to the title and the close button sits beside the
  // text rather than in the corner.
  headerRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  // Takes the room the close button does not, so a long title wraps instead of
  // pushing the button off the panel.
  title: { flex: 1, marginTop: spacing.xs },
  body: { flex: 1 },
  searchRow: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  close: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The top pad stands in for the search row's, so an unsearchable sheet does not
  // butt its first option straight against the title.
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing['3xl'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    borderRadius: radius['2xl'],
    borderWidth: stroke.ink,
  },
  rowLabel: { flexShrink: 1 },
});

export default OptionSheet;
