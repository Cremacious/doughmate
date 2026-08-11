// Swaps: searchable ingredient substitutions. Its own tab now.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { searchSubstitutions } from '@/lib/substitutions';
import { spacing, typography } from '@/theme';
import { Card } from '@/ui/Card';
import { Input } from '@/ui/Input';
import { Screen } from '@/ui/Screen';

export default function SwapsScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchSubstitutions(query), [query]);

  return (
    <Screen title={t('tabs.swaps')}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={t('substitutions.search_placeholder')}
      />

      {results.length === 0 ? (
        <Text style={[typography.body.md, styles.empty, { color: palette.textSoft }]}>
          {t('substitutions.empty')}
        </Text>
      ) : (
        results.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.head}>
              <Text style={[typography.title, styles.missing, { color: palette.textInk }]}>
                {item.missing}
              </Text>
              <Text style={[typography.numeric.sm, { color: palette.textFaint }]}>
                {item.amount}
              </Text>
            </View>
            <Text style={[typography.label, { color: palette.primaryText }]}>
              {t('substitutions.swap_for')}
            </Text>
            <Text style={[typography.body.md, { color: palette.textInk }]}>{item.substitute}</Text>
            <Text style={[typography.body.sm, { color: palette.textFaint }]}>{item.notes}</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing['2xs'] },
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  missing: { flexShrink: 1 },
  empty: { paddingTop: spacing.xl },
});
