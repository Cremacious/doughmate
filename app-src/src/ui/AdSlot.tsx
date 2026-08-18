// Fresh Bake ad slot. A reserved, dashed frame on the canvas between the content and
// the tab shelf. It never sits over a card and never sits under the FAB, so a free
// baker always knows which part of the screen is theirs. Pro gets the space back.
import { StyleSheet, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePro } from '@/state/pro';
import { adSlot, radius, stroke } from '@/theme';

/** Whether the slot is taking up room, so Screen and Fab can budget for it. */
export function useAdSlotVisible(): boolean {
  const { isPro } = usePro();
  return !isPro;
}

/** Room the slot needs above the tab shelf, including its gap. */
export const AD_SLOT_SPACE = adSlot.height + adSlot.gapToShelf;

export function AdSlot() {
  const { palette } = useAppTheme();
  const visible = useAdSlotVisible();

  if (!visible) {
    return null;
  }

  // A tab screen's bottom edge already is the shelf's top edge.
  return (
    <View pointerEvents="box-none" style={styles.anchor}>
      <View
        style={[styles.frame, { backgroundColor: palette.bgSunken, borderColor: palette.border }]}
      >
        <AdBanner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    left: adSlot.gutter,
    right: adSlot.gutter,
    bottom: adSlot.gapToShelf,
  },
  frame: {
    height: adSlot.height,
    borderRadius: radius.xl,
    borderWidth: stroke.soft,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default AdSlot;
