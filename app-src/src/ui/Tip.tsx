// A one time, dismissible hint in Sam's voice. Shows until the baker taps the
// close, then never again (the id is remembered in settings). Settings has a
// "Show tips again" control that clears them all.
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { triggerHaptic } from '@/lib/haptics';
import { useSettings } from '@/state/settings';
import { radius, spacing, stroke, typography } from '@/theme';

export interface TipProps {
  /** Stable id remembered once dismissed. */
  id: string;
  text: string;
}

export function Tip({ id, text }: TipProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const reduced = useReducedMotion();
  const { settings, update } = useSettings();

  if (settings.dismissedTips.includes(id)) {
    return null;
  }

  const dismiss = () => {
    triggerHaptic('tap');
    update('dismissedTips', [...settings.dismissedTips, id]);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(reduced ? 120 : 220)}
      style={[styles.card, { backgroundColor: palette.butterWash, borderColor: palette.border }]}
    >
      <Sam size={34} />
      <Text style={[typography.body.md, styles.text, { color: palette.textInk }]}>{text}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={dismiss}
        style={styles.close}
      >
        <Text style={[typography.subheading, { color: palette.butterText }]}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius['2xl'],
    borderWidth: stroke.soft,
    padding: spacing.md,
  },
  text: { flex: 1 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});

export default Tip;
