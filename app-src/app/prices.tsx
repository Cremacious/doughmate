// Every ingredient price the baker has entered, in one place. Reached from Settings;
// each row opens the same editor the Cost card on a recipe opens.
//
// Not Pro gated on purpose: this only ever lists data the baker typed themselves, and
// hiding it behind the gate would strand those entries if an entitlement lapsed.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { formatUsd } from '@/lib/cost';
import { scaleType } from '@/lib/typeScale';
import { useIngredientPrices } from '@/state/ingredientPrices';
import { spacing, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';

export default function PricesSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { prices } = useIngredientPrices();

  const sorted = [...prices].sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <Text
          style={[
            typography.display.md,
            scaleType(typography.display.md, fontScale),
            styles.title,
            { color: palette.textInk },
          ]}
        >
          {t('prices.title')}
        </Text>
      }
      footer={
        <Button
          label={t('prices.add_title')}
          onPress={() => router.push('/price-new')}
          haptic="pop"
        />
      }
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <Card>
            <Text
              style={[
                typography.body.md,
                scaleType(typography.body.md, fontScale),
                { color: palette.textFaint },
              ]}
            >
              {t('prices.empty')}
            </Text>
          </Card>
        ) : (
          sorted.map((price) => (
            <Card
              key={price.ingredientName}
              onPress={() =>
                router.push(`/price-new?name=${encodeURIComponent(price.ingredientName)}`)
              }
              style={styles.row}
            >
              <Text
                style={[
                  typography.body.lg,
                  scaleType(typography.body.lg, fontScale),
                  styles.rowName,
                  { color: palette.textInk },
                ]}
                numberOfLines={1}
              >
                {price.ingredientName}
              </Text>
              <Text
                style={[
                  typography.numeric.sm,
                  scaleType(typography.numeric.sm, fontScale),
                  { color: palette.proofTeal },
                ]}
              >
                {t('prices.per_100g', { price: formatUsd(price.pricePerGram * 100) })}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.sm, paddingBottom: spacing['3xl'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowName: { flexShrink: 1 },
});
