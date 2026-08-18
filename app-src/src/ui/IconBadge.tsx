// A large tinted circle holding an icon. Used as the onboarding hero so each feature
// page reads at a glance. Tomato for the core flow, teal for starters and swaps
// (matching their in app accent). It sits on the butter canvas, so it carries the ink
// outline rather than relying on a wash to separate it.
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { radius, stroke } from '@/theme';
import { Icon, type IconName } from './Icon';

export interface IconBadgeProps {
  name: IconName;
  tint?: 'primary' | 'teal';
  size?: number;
}

export function IconBadge({ name, tint = 'primary', size = 160 }: IconBadgeProps) {
  const { palette } = useAppTheme();
  const bg = tint === 'teal' ? palette.proofTeal : palette.primary;
  const fg = tint === 'teal' ? palette.onTeal : palette.onPrimary;

  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, backgroundColor: bg, borderColor: palette.outline },
      ]}
    >
      <Icon name={name} size={Math.round(size * 0.46)} color={fg} strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    borderWidth: stroke.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconBadge;
