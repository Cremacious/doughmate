// Pan converter. Pick the recipe's pan and your pan; get a scale factor and a
// bake time hint. Area + scaling math lives in src/lib/pan.
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { ModalHeader } from '@/components/ModalHeader';
import { PanField } from '@/components/PanField';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatQuantity } from '@/lib/convert';
import { bakeTimeHint, getPan, panScaleFactor, type Pan } from '@/lib/pan';
import { spacing, typography } from '@/theme';

const DEFAULT_FROM: Pan = getPan('round_9')!;
const DEFAULT_TO: Pan = getPan('round_8')!;

export default function PanScreen() {
  const { t } = useTranslation();
  const { palette, bg } = useAppTheme();

  const [fromPan, setFromPan] = useState<Pan>(DEFAULT_FROM);
  const [toPan, setToPan] = useState<Pan>(DEFAULT_TO);

  const factor = useMemo(
    () => panScaleFactor(fromPan.area_sqin, toPan.area_sqin),
    [fromPan, toPan]
  );
  const hint = useMemo(() => bakeTimeHint(fromPan.area_sqin, toPan.area_sqin), [fromPan, toPan]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.primary }]} edges={['top']}>
      <ModalHeader title={t('pan.title')} />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('pan.from_label')}
          </Text>
          <View style={styles.field}>
            <PanField value={fromPan} onChange={setFromPan} />
          </View>

          <Text style={[typography.caption, styles.spaced, { color: palette.chocSoft }]}>
            {t('pan.to_label')}
          </Text>
          <View style={styles.field}>
            <PanField value={toPan} onChange={setToPan} />
          </View>
        </Card>

        <View style={styles.resultBlock}>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('pan.scale_label')}
          </Text>
          <Text style={[typography.number.hero, { color: palette.crust }]}>
            {factor === null ? '—' : `${formatQuantity(factor)}x`}
          </Text>
        </View>

        <Card>
          <Text style={[typography.caption, { color: palette.chocSoft }]}>
            {t('pan.bake_time_label')}
          </Text>
          <Text style={[typography.body.lg, styles.hint, { color: palette.choc }]}>
            {t(`pan.bake_${hint}`)}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  field: {
    marginTop: spacing.xs,
  },
  spaced: {
    marginTop: spacing.lg,
  },
  resultBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  hint: {
    marginTop: spacing.xs,
    lineHeight: 26,
  },
});
