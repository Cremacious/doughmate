// Fresh Bake icon button, extracted from ScreenHeader. The default variant is the
// gear: a square outlined tile on a hard shadow. The quiet variant is the inline
// delete on cards, which must not compete with the card's own content.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic, type HapticName } from '@/lib/haptics';
import { hardShadow, radius, stroke } from '@/theme';
import { HardShadow } from './HardShadow';
import { Icon, type IconName } from './Icon';

export type IconButtonVariant = 'default' | 'quiet';

export interface IconButtonProps {
  iconName: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  haptic?: HapticName;
  /** Overrides the glyph colour. Defaults to ink, or soft on quiet. */
  color?: string;
  /** Overrides the square size at fontScale.normal. */
  size?: number;
  /** Overrides the corner radius, for tiles that are squarer than the gear. */
  radius?: number;
}

export function IconButton({
  iconName,
  onPress,
  accessibilityLabel,
  variant = 'default',
  haptic = 'tap',
  color,
  size: sizeOverride,
  radius: radiusOverride,
}: IconButtonProps) {
  const { palette, fontScale } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  const floured = fontScale > 1;
  const quiet = variant === 'quiet';

  // The gear grows and squares off further in floured fingers; the quiet delete
  // rides the shared touch target instead.
  const base = sizeOverride ?? (quiet ? 40 : 46);
  const size = floured ? Math.round(base * (58 / 46)) : base;
  const corner = radiusOverride ?? (quiet ? radius.md : floured ? radius['2xl'] : radius.lg);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        triggerHaptic(haptic);
        onPress();
      }}
      hitSlop={quiet ? 6 : 0}
    >
      <HardShadow
        offset={quiet ? hardShadow.none : hardShadow.control}
        radius={corner}
        pressed={pressed}
      >
        <View
          style={[
            styles.tile,
            {
              width: size,
              height: size,
              borderRadius: corner,
              backgroundColor: quiet ? palette.bgSunken : palette.bgSurface,
              borderColor: palette.outline,
              borderWidth: quiet ? 0 : stroke.ink,
            },
          ]}
        >
          <Icon
            name={iconName}
            size={Math.round(size * 0.46)}
            color={color ?? (quiet ? palette.textSoft : palette.textInk)}
          />
        </View>
      </HardShadow>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center' },
});

export default IconButton;
