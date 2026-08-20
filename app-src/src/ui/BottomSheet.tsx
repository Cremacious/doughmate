// Proof BottomSheet. The only navigation besides the tabs. Drag the handle down
// (past 120px or a fast flick) or tap the scrim to dismiss. Sticky footer for the
// primary action. Enter/exit spring soft; opacity only under reduced motion.
import { type ReactNode, useEffect } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { sheet as sheetTokens, shadow, spacing, spring, stroke } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface BottomSheetProps {
  onClose: () => void;
  size?: 'half' | 'tall' | 'full';
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  /** Overrides the panel fill. Cook mode inverts, on both themes. */
  canvasColor?: string;
  /** Overrides the sticky footer fill, paired with `canvasColor`. */
  footerColor?: string;
}

export function BottomSheet({
  onClose,
  size = 'tall',
  children,
  footer,
  header,
  canvasColor,
  footerColor,
}: BottomSheetProps) {
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { height: winH } = useWindowDimensions();

  // The panel is anchored to the bottom of its own container, so its height has
  // to be relative to that container rather than to the window. A sheet opened
  // from inside a tab screen sits in a box a tab bar shorter than the window,
  // and a window-sized "tall" panel all but filled it, putting the panel's top
  // edge — and the grabber with it — at the very top of the screen. A percentage
  // keeps every sheet the same fraction of whatever contains it.
  const heightPct = `${sheetTokens.heights[size] * 100}%` as const;

  // The slide distance only has to clear the screen, so the window height works
  // for the animation even where it would be wrong for the panel itself.
  const sheetH = winH;

  // Only a full-height panel reaches into the status bar; anything shorter opens
  // at least a tenth of the container below it, which already clears the inset.
  // Padding every sheet regardless is what opened a gap above the grabber.
  const grabberInset = size === 'full' ? insets.top : 0;

  const translateY = useSharedValue(reduced ? 0 : sheetH);
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      translateY.value = 0;
      progress.value = 1;
      return;
    }
    translateY.value = withSpring(0, spring.soft);
    progress.value = withTiming(1, { duration: 200 });
  }, [reduced, translateY, progress]);

  const dismiss = () => {
    if (reduced) {
      onClose();
      return;
    }
    progress.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(sheetH, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        progress.value = 1 - Math.min(e.translationY / sheetH, 1) * 0.5;
      }
    })
    .onEnd((e) => {
      if (
        e.translationY > sheetTokens.dismissThresholdPx ||
        e.velocityY > sheetTokens.dismissVelocity
      ) {
        runOnJS(dismiss)();
      } else {
        translateY.value = withSpring(0, spring.soft);
        progress.value = withTiming(1, { duration: 160 });
      }
    });

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <AnimatedPressable
        accessibilityRole="button"
        onPress={dismiss}
        style={[StyleSheet.absoluteFill, { backgroundColor: palette.scrim }, scrimStyle]}
      />
      <Animated.View
        style={[
          styles.panel,
          shadow.sheet,
          {
            height: heightPct,
            backgroundColor: canvasColor ?? palette.bgCanvas,
            borderTopColor: palette.outline,
          },
          panelStyle,
        ]}
      >
        <GestureDetector gesture={pan}>
          {/* A panel whose top edge reaches into the status bar needs the inset
              or the phone's battery/wifi icons sit on the handle. One that opens
              below it needs none, and adding it regardless left a dead band
              between the panel's top edge and the handle. */}
          <View style={[styles.dragArea, { paddingTop: spacing.lg + grabberInset }]}>
            <View style={[styles.grabber, { backgroundColor: palette.grabber }]} />
            {header}
          </View>
        </GestureDetector>

        <View style={styles.content}>{children}</View>

        {footer ? (
          <View
            style={[
              styles.footer,
              {
                backgroundColor: footerColor ?? palette.bgSurface,
                borderTopColor: palette.outline,
                paddingBottom: insets.bottom + spacing.md,
              },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: sheetTokens.radius,
    borderTopRightRadius: sheetTokens.radius,
    borderTopWidth: stroke.ink,
    overflow: 'hidden',
  },
  dragArea: { paddingTop: 10, paddingBottom: 6, alignItems: 'center' },
  grabber: {
    width: sheetTokens.grabber.width,
    height: sheetTokens.grabber.height,
    borderRadius: sheetTokens.grabber.radius,
  },
  content: { flex: 1 },
  footer: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: stroke.ink,
  },
});

export default BottomSheet;
