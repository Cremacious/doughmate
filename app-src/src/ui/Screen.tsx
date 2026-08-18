// Fresh Bake tab screen scaffold: canvas, a scrolling body that carries the header
// with it, an optional row that pins to the top edge, and the two pieces of bottom
// chrome the redesign introduced.
//
// The old scaffold left room for a floating tab bar and let screens anchor a full
// width button on top of it. Now the shelf is flush, the create action is a corner
// FAB, and the ad slot has its own reserved band. Content clears all of it.
//
// Scrolling rule: the page moves as one piece. The header scrolls away with the
// content, and only a `sticky` row stays put. That row is opaque and full bleed, so
// content passes under it and is hidden by something the eye can see. Anything pinned
// on the canvas colour instead would slice content at a seam the same colour as the
// background, which reads as content being cut off by nothing at all.
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { TIMER_BANNER_SPACE, useTimerBannerVisible } from '@/hooks/useTimerBannerVisible';
import { spacing } from '@/theme';
import { AD_SLOT_SPACE, AdSlot, useAdSlotVisible } from './AdSlot';
import { Fab } from './Fab';
import type { IconName } from './Icon';
import { ScreenHeader } from './ScreenHeader';

/**
 * Breathing room between the last card and the shelf. The tab navigator lays the
 * shelf out below the screen, so this view already stops at the shelf's top edge and
 * only the gap is ours to add. With the 70pt shelf that is the 100 the design asks for.
 */
const SHELF_BREATHING_ROOM = spacing['2xl'];

/** The sticky row is the second block, after the header. */
const STICKY_INDICES = [1];

/** 22 normally, 20 in floured fingers, which needs the width back for bigger type. */
function gutterFor(fontScale: number): number {
  return fontScale > 1 ? 20 : spacing.xl;
}

export interface ScreenFab {
  iconName: IconName;
  onPress: () => void;
  accessibilityLabel: string;
}

export interface ScreenProps {
  title: string;
  children: ReactNode;
  /** Live state above the title, coloured by meaning. */
  eyebrow?: string;
  eyebrowColor?: string;
  settingsLabel: string;
  /** The screen level create action. Replaces the old bottom anchored button. */
  fab?: ScreenFab;
  /**
   * A row that pins to the top edge once the header has scrolled past it, for the
   * one control that has to stay reachable while the list moves. Everything else
   * belongs in `children` so it scrolls with the page.
   *
   * Pass a component that owns its own layout, not a bare `flexDirection: 'row'`
   * view: the band below is the sticky child, and React Native moves a sticky
   * child's style onto its own wrapper, replacing it with `flex: 1`. Layout set on
   * the band itself is lost. Nesting one level deeper survives.
   */
  sticky?: ReactNode;
}

export function Screen({
  title,
  children,
  eyebrow,
  eyebrowColor,
  settingsLabel,
  fab,
  sticky,
}: ScreenProps) {
  const { palette, fontScale } = useAppTheme();
  const bannerVisible = useTimerBannerVisible();
  const adVisible = useAdSlotVisible();

  const gutter = gutterFor(fontScale);
  // Clear the ad band too when one is showing, so nothing scrolls under any chrome.
  const bottomClearance = SHELF_BREATHING_ROOM + (adVisible ? AD_SLOT_SPACE : 0);

  // Built as an array so the sticky index is stable whether or not a sticky row is
  // passed. A conditional child would shift the index and pin the wrong block.
  const blocks = [
    <View key="header" style={{ paddingHorizontal: gutter }}>
      <ScreenHeader
        title={title}
        eyebrow={eyebrow}
        eyebrowColor={eyebrowColor}
        settingsLabel={settingsLabel}
      />
    </View>,
  ];

  if (sticky) {
    blocks.push(
      <View
        key="sticky"
        style={[styles.sticky, { paddingHorizontal: gutter, backgroundColor: palette.bgCanvas }]}
      >
        {sticky}
      </View>
    );
  }

  blocks.push(
    <View key="content" style={[styles.content, { paddingHorizontal: gutter }]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.bgCanvas }]}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        {/*
          The timers pill floats over the top edge, so the scroll viewport starts below
          it rather than the header merely padding itself down. That keeps a sticky row
          from pinning underneath the pill once the header scrolls away.
        */}
        <View style={[styles.flex, bannerVisible && { paddingTop: TIMER_BANNER_SPACE }]}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={{ paddingBottom: bottomClearance }}
            stickyHeaderIndices={sticky ? STICKY_INDICES : undefined}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {blocks}
          </ScrollView>
        </View>
      </SafeAreaView>
      <AdSlot />
      {fab ? (
        <Fab
          iconName={fab.iconName}
          onPress={fab.onPress}
          accessibilityLabel={fab.accessibilityLabel}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  // paddingBottom keeps a selected control's hard shadow inside the opaque band, so
  // the shadow is not clipped and content does not surface beside it while scrolling.
  sticky: { paddingTop: spacing.xs, paddingBottom: spacing.sm },
  content: { paddingTop: spacing.xs, gap: spacing.md },
});

export default Screen;
