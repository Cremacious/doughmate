// A large tinted circle holding a Proof icon. Used as the onboarding hero so each
// feature page reads at a glance. Peach tint for the core flow, teal for starters
// and swaps (matching their in app accent).
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Icon, type IconName } from './Icon';

export interface IconBadgeProps {
  name: IconName;
  tint?: 'primary' | 'teal';
  size?: number;
}

export function IconBadge({ name, tint = 'primary', size = 116 }: IconBadgeProps) {
  const { palette } = useAppTheme();
  const bg = tint === 'teal' ? palette.proofTealWash : palette.primaryWash;
  const fg = tint === 'teal' ? palette.proofTealText : palette.primaryText;

  return (
    <View style={[styles.badge, { width: size, height: size, backgroundColor: bg }]}>
      <Icon name={name} size={Math.round(size * 0.46)} color={fg} strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});

export default IconBadge;
