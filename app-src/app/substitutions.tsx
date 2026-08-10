// Substitutions. Search what you are missing; see what to swap in. Lookup from
// src/lib/substitutions.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { ModalHeader } from '@/components/ModalHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { searchSubstitutions } from '@/lib/substitutions';
import { radius, spacing, typography } from '@/theme';

export default function SubstitutionsScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchSubstitutions(query), [query]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ModalHeader title={t('substitutions.title')} />

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('substitutions.search_placeholder')}
        placeholderTextColor={palette.chocSoft}
        style={[
          typography.body.lg,
          styles.search,
          { backgroundColor: bg.subtle, color: palette.choc },
        ]}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[typography.body.md, styles.empty, { color: palette.chocSoft }]}>
            {t('substitutions.empty')}
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={[typography.body.lg, styles.missing, { color: palette.choc }]}>
                {item.missing}
              </Text>
              <Text style={[typography.caption, { color: palette.chocSoft }]}>{item.amount}</Text>
            </View>
            <Text style={[typography.caption, styles.swapLabel, { color: palette.crust }]}>
              {t('substitutions.swap_for')}
            </Text>
            <Text style={[typography.body.md, { color: palette.choc }]}>{item.substitute}</Text>
            <Text style={[typography.body.sm, styles.notes, { color: palette.chocSoft }]}>
              {item.notes}
            </Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md },
  card: { gap: spacing.xs },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  missing: { flexShrink: 1 },
  swapLabel: { marginTop: spacing.xs },
  notes: { marginTop: spacing.xs },
  empty: { textAlign: 'center', marginTop: spacing['2xl'], paddingHorizontal: spacing.lg },
});
