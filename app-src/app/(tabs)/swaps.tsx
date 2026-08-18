// Swaps: searchable ingredient substitutions. Its own tab. Free bakers get a plum
// teaser at the end that opens the paywall.
//
// The substitute sits in a quiet inset rather than running on as another line of the
// card. That inset is what stops the answer reading as a caption on the question.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { PRO_SUBSTITUTION_COUNT, searchSubstitutions } from '@/lib/substitutions';
import { scaleType } from '@/lib/typeScale';
import { usePro } from '@/state/pro';
import { radius, spacing, stroke, typography } from '@/theme';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Screen } from '@/ui/Screen';

export default function SwapsScreen() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { isPro } = usePro();
  const [query, setQuery] = useState('');
  // Counts what this baker can actually see, so the eyebrow never advertises
  // swaps that are still behind the paywall.
  const results = useMemo(() => searchSubstitutions(query, isPro), [query, isPro]);
  const allCount = useMemo(() => searchSubstitutions('', isPro).length, [isPro]);

  return (
    <Screen
      title={t('tabs.swaps')}
      eyebrow={t('swaps.eyebrow_count', { count: allCount })}
      settingsLabel={t('common.open_settings')}
    >
      <View
        style={[
          styles.search,
          {
            height: 54 * fontScale,
            backgroundColor: palette.bgSurface,
            borderColor: palette.outline,
          },
        ]}
      >
        <Icon name="search" size={20} color={palette.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('swaps.search_placeholder')}
          placeholderTextColor={palette.textFaint}
          style={[
            typography.body.lg,
            scaleType(typography.body.lg, fontScale),
            styles.searchField,
            { color: palette.textInk },
          ]}
        />
      </View>

      {results.length === 0 ? (
        <Text
          style={[
            typography.body.md,
            scaleType(typography.body.md, fontScale),
            styles.empty,
            { color: palette.textSoft },
          ]}
        >
          {t('substitutions.empty')}
        </Text>
      ) : (
        results.map((item) => (
          <Card key={item.id}>
            <View style={styles.head}>
              <Text
                style={[
                  typography.heading,
                  scaleType(typography.heading, fontScale),
                  styles.missing,
                  { color: palette.textInk },
                ]}
              >
                {item.missing}
              </Text>
              <View style={[styles.amountPill, { backgroundColor: palette.bgSunken }]}>
                <Text
                  style={[
                    typography.numeric.sm,
                    scaleType(typography.numeric.sm, fontScale),
                    { color: palette.textSoft },
                  ]}
                >
                  {item.amount}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.inset,
                { backgroundColor: palette.bgSunken, borderColor: palette.border },
              ]}
            >
              <View style={styles.insetHead}>
                <Icon name="swaps" size={16} color={palette.primary} />
                <Text
                  style={[
                    typography.labelSm,
                    scaleType(typography.labelSm, fontScale),
                    { color: palette.primaryText },
                  ]}
                >
                  {t('swaps.use_instead')}
                </Text>
              </View>
              <Text
                style={[
                  typography.body.md,
                  scaleType(typography.body.md, fontScale),
                  { color: palette.textInk },
                ]}
              >
                {item.substitute}
              </Text>
            </View>

            {item.notes ? (
              <Text
                style={[
                  typography.body.sm,
                  scaleType(typography.body.sm, fontScale),
                  { color: palette.textFaint },
                ]}
              >
                {item.notes}
              </Text>
            ) : null}
          </Card>
        ))
      )}

      {!isPro ? (
        <Card
          tier="hero"
          heroColor={palette.pro}
          onPress={() => router.push('/paywall')}
          style={styles.teaser}
        >
          <Text
            style={[
              typography.subheading,
              scaleType(typography.subheading, fontScale),
              styles.teaserText,
              { color: palette.onPro },
            ]}
          >
            {t('substitutions.pro_teaser', { count: PRO_SUBSTITUTION_COUNT })}
          </Text>
          <View style={[styles.chevron, { borderColor: palette.onProSoft }]}>
            <Text style={[typography.subheading, { color: palette.onPro }]}>›</Text>
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius['3xl'],
    borderWidth: stroke.ink,
    paddingHorizontal: spacing.lg,
  },
  searchField: { flex: 1, padding: 0 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  missing: { flexShrink: 1 },
  amountPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  inset: {
    gap: spacing['2xs'],
    borderRadius: radius['2xl'],
    borderWidth: stroke.soft,
    padding: spacing.md,
  },
  insetHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  empty: { paddingTop: spacing.xl },
  teaser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  teaserText: { flexShrink: 1 },
  chevron: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: stroke.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
