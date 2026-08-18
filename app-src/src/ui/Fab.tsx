// Fresh Bake FAB. Replaces the full width bottom anchored button on Recipes and
// Starters: that button plus a floating tab bar stacked two layers of chrome over the
// list. A corner FAB costs one corner instead of a whole band. Sheets keep their
// sticky footer button, which is a different job.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { hardShadow, radius, shadow, spacing, stroke } from '@/theme';
import { AD_SLOT_SPACE, useAdSlotVisible } from './AdSlot';
import { HardShadow } from './HardShadow';
import { Icon, type IconName } from './Icon';

const SIZE = 60;
const FLOURED_SIZE = 72;

export interface FabProps {
  iconName: IconName;
  onPress: () => void;
  accessibilityLabel: string;
}

export function Fab({ iconName, onPress, accessibilityLabel }: FabProps) {
  const { palette, fontScale, isDark } = useAppTheme();
  const [pressed, setPressed] = useState(false);
  const adVisible = useAdSlotVisible();

  const size = fontScale > 1 ? FLOURED_SIZE : SIZE;
  // The screen's bottom edge is the shelf's top edge, so this is just the gap above
  // it. The FAB lifts above the ad slot rather than sitting on it.
  const bottom = spacing.xl + (adVisible ? AD_SLOT_SPACE : 0);

  return (
    <View pointerEvents="box-none" style={[styles.anchor, { bottom }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={() => {
          triggerHaptic('pop');
          onPress();
        }}
      >
        <HardShadow offset={hardShadow.control} radius={radius.pill} pressed={pressed}>
          <View
            style={[
              styles.fab,
              // Dark mode has no ink shadow, so the FAB needs a blurred one to lift.
              isDark ? shadow.md : null,
              {
                width: size,
                height: size,
                backgroundColor: palette.accentButter,
                borderColor: palette.outline,
                borderWidth: isDark ? 0 : stroke.inkHeavy,
              },
            ]}
          >
            <Icon name={iconName} size={26} color={palette.onButter} />
          </View>
        </HardShadow>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', right: spacing.xl, alignItems: 'flex-end' },
  fab: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});

export default Fab;
