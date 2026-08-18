// Fresh Bake screen header. Title on the left under an eyebrow that carries the
// screen's live state ("one is hungry", "1 running"), a gear that opens Settings on
// the right, plus a Pro pill when entitled. No other top chrome, no back button.
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { usePro } from '@/state/pro';
import { radius, spacing, typography } from '@/theme';
import { IconButton } from './IconButton';

/** The screen title is set by hand: 36 goes to 42, not to 36 times 1.25. */
const TITLE = { normal: 36, floured: 42 } as const;

export interface ScreenHeaderProps {
  title: string;
  /** Live state above the title. Its colour is the meaning. */
  eyebrow?: string;
  eyebrowColor?: string;
  settingsLabel: string;
}

export function ScreenHeader({ title, eyebrow, eyebrowColor, settingsLabel }: ScreenHeaderProps) {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { isPro } = usePro();

  return (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        {eyebrow ? (
          <Text
            numberOfLines={1}
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              { color: eyebrowColor ?? palette.textFaint },
            ]}
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text
          style={[
            typography.display.lg,
            {
              fontSize: fontScale > 1 ? TITLE.floured : TITLE.normal,
              lineHeight: Math.round((fontScale > 1 ? TITLE.floured : TITLE.normal) * (38 / 36)),
              color: palette.textInk,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <View style={styles.right}>
        {isPro ? (
          <View style={[styles.proPill, { backgroundColor: palette.proWash }]}>
            <Text
              style={[
                typography.labelSm,
                scaleType(typography.labelSm, fontScale),
                { color: palette.pro },
              ]}
            >
              {t('common.pro')}
            </Text>
          </View>
        ) : null}
        <IconButton
          iconName="settings"
          accessibilityLabel={settingsLabel}
          onPress={() => router.push('/settings')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  titleBlock: { flexShrink: 1, gap: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  proPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
});

export default ScreenHeader;
