// Proof screen header. Title on the left, a gear that opens Settings on the
// right, plus a Pro pill when entitled. No other top chrome, no back button.
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { usePro } from '@/state/pro';
import { radius, spacing, typography } from '@/theme';
import { Icon } from './Icon';

export interface ScreenHeaderProps {
  title: string;
}

export function ScreenHeader({ title }: ScreenHeaderProps) {
  const { palette, fontScale } = useAppTheme();
  const { isPro } = usePro();

  return (
    <View style={styles.header}>
      <Text
        style={[
          typography.display.lg,
          scaleType(typography.display.lg, fontScale),
          { color: palette.textInk },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={styles.right}>
        {isPro ? (
          <View style={[styles.proPill, { backgroundColor: palette.proWash }]}>
            <Text style={[typography.label, { color: palette.pro }]}>Pro</Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={() => router.push('/settings')}
          style={[styles.gear, { backgroundColor: palette.bgSunken }]}
        >
          <Icon name="settings" size={22} color={palette.textInk} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  proPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  gear: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ScreenHeader;
