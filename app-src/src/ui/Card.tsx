// Fresh Bake Card. Three surface tiers carry the hierarchy that Proof v2 was missing:
// hero is the one thing you look at first and there is never more than one per screen,
// standard holds inputs and groups, quiet holds fields and read only detail.
//
// Passing `stripColor` makes this a list card: standard fill, a soft card shadow and
// an 8px tag strip along the top edge. The strip needs `overflow: hidden` to take the
// card's corners, which is safe because HardShadow draws outside this view.
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { hardShadow, radius, spacing, stroke } from '@/theme';
import { HardShadow } from './HardShadow';

export type CardTier = 'hero' | 'standard' | 'quiet';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tier?: CardTier;
  /** Hero fill. One of primary, accentButter, proofTeal or pro. Ignored off hero. */
  heroColor?: string;
  /** Tag colour for a list card's top strip. */
  stripColor?: string;
}

const STRIP_HEIGHT = 8;

export function Card({
  children,
  style,
  onPress,
  tier = 'standard',
  heroColor,
  stripColor,
}: CardProps) {
  const { palette } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  const isHero = tier === 'hero';
  const isQuiet = tier === 'quiet';
  const isList = stripColor !== undefined;

  const corner = isHero ? radius.hero : isQuiet ? radius['2xl'] : radius['3xl'];
  const fill = isHero
    ? (heroColor ?? palette.primary)
    : isQuiet
      ? palette.bgSunken
      : palette.bgSurface;

  const shadowOffset = isHero ? hardShadow.hero : isList ? hardShadow.card : hardShadow.none;

  const content = (
    <View
      style={[
        {
          borderRadius: corner,
          backgroundColor: fill,
          borderColor: isQuiet ? palette.border : palette.outline,
          borderWidth: isQuiet ? stroke.soft : stroke.ink,
          overflow: isList ? 'hidden' : 'visible',
        },
        // The strip runs edge to edge, so a list card pads its body instead.
        isList ? null : styles.padded,
        style,
      ]}
    >
      {isList ? (
        <>
          <View style={{ height: STRIP_HEIGHT, backgroundColor: stripColor }} />
          <View style={styles.padded}>{children}</View>
        </>
      ) : (
        children
      )}
    </View>
  );

  const shadowed = (
    <HardShadow offset={shadowOffset} radius={corner} pressed={pressed && onPress !== undefined}>
      {content}
    </HardShadow>
  );

  if (!onPress) {
    return shadowed;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {shadowed}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  padded: { padding: spacing.lg, gap: spacing.sm },
});

export default Card;
