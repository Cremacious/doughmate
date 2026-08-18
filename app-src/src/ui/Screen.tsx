// Fresh Bake tab screen scaffold: canvas, the header with its eyebrow, a scrolling
// body on the gutter, and the two pieces of bottom chrome the redesign introduced.
//
// The old scaffold left room for a floating tab bar and let screens anchor a full
// width button on top of it. Now the shelf is flush, the create action is a corner
// FAB, and the ad slot has its own reserved band. Content clears all of it.
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
}

export function Screen({
  title,
  children,
  eyebrow,
  eyebrowColor,
  settingsLabel,
  fab,
}: ScreenProps) {
  const { palette, fontScale } = useAppTheme();
  const bannerVisible = useTimerBannerVisible();
  const adVisible = useAdSlotVisible();

  const gutter = gutterFor(fontScale);
  // Clear the ad band too when one is showing, so nothing scrolls under any chrome.
  const bottomClearance = SHELF_BREATHING_ROOM + (adVisible ? AD_SLOT_SPACE : 0);

  return (
    <View style={[styles.container, { backgroundColor: palette.bgCanvas }]}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <View
          style={[
            { paddingHorizontal: gutter },
            bannerVisible && { paddingTop: TIMER_BANNER_SPACE },
          ]}
        >
          <ScreenHeader
            title={title}
            eyebrow={eyebrow}
            eyebrowColor={eyebrowColor}
            settingsLabel={settingsLabel}
          />
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: gutter, paddingBottom: bottomClearance },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
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
  content: { paddingTop: spacing.xs, gap: spacing.md },
});

export default Screen;
