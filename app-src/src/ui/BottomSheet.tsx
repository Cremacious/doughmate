// Proof BottomSheet. The only navigation besides the tabs. Drag the handle down
// (past 120px or a fast flick) or tap the scrim to dismiss. Sticky footer for the
// primary action.
//
// The panel arrives on spring.snap, which is stiff enough to stop rather than settle,
// and the scrim fades over 140ms instead of appearing at once — a scrim that is
// already there when the panel is still travelling is what makes a sheet feel like
// it lags behind its own background. Dismiss is a hard 170ms on easing.exit, because
// something being dismissed should feel like it already went. The drag to dismiss
// gesture keeps its own velocity handoff. Opacity only under reduced motion.
//
// The panel also gets out of the keyboard's way. On iOS the window does not resize
// when the keyboard opens, so a panel anchored to the bottom at a fixed fraction of
// its container simply has its lower third covered — which is what hid the notes
// field on the starter form, and every other field sitting low in a sheet. The panel
// pads its own bottom by the live keyboard height instead of moving, so its top edge
// and the grabber stay exactly where they were and only the usable area shrinks. The
// footer rides up with it, so the primary action is never behind the keyboard either.
//
// One file: the mode tray, all six option sheets, recipe and starter detail, the
// cook sheet, the bake plan and the paywall.
import { type ReactNode, useEffect } from 'react';
import { Keyboard, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { easing, sheet as sheetTokens, shadow, spacing, spring, stroke, transition } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface BottomSheetProps {
  onClose: () => void;
  size?: 'half' | 'tall' | 'full';
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}

export function BottomSheet({
  onClose,
  size = 'tall',
  children,
  footer,
  header,
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

  // Tracked on the UI thread, so the panel shrinks in step with the keyboard rather
  // than snapping once it has finished arriving.
  const keyboard = useAnimatedKeyboard();

  const translateY = useSharedValue(reduced ? 0 : sheetH);
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      translateY.value = 0;
      progress.value = 1;
      return;
    }
    translateY.value = withSpring(0, spring.snap);
    progress.value = withTiming(1, { duration: transition.scrimMs });
  }, [reduced, translateY, progress]);

  const dismiss = () => {
    // A sheet leaving with the keyboard still up leaves the keyboard behind on the
    // screen underneath, which then has to animate away on its own.
    Keyboard.dismiss();
    if (reduced) {
      onClose();
      return;
    }
    progress.value = withTiming(0, { duration: transition.scrimMs });
    translateY.value = withTiming(
      sheetH,
      { duration: transition.sheetOutMs, easing: Easing.bezier(...easing.exit) },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      }
    );
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
        // Snapping back from a partial drag is a return, not an arrival, so it
        // rides the same spring the panel came in on.
        translateY.value = withSpring(0, spring.snap);
        progress.value = withTiming(1, { duration: transition.scrimMs });
      }
    });

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  // Padding rather than a lift: raising the whole panel would push its top edge, and
  // the grabber with it, off the top of the screen on a tall sheet. Padding takes the
  // space out of the bottom, which is the part the keyboard is standing on anyway.
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    paddingBottom: keyboard.height.value,
  }));

  // The home indicator inset is only worth reserving while nothing covers it. Once the
  // keyboard is taller than the inset, the footer sits directly on the keyboard.
  const footerStyle = useAnimatedStyle(() => ({
    paddingBottom: spacing.md + Math.max(0, insets.bottom - keyboard.height.value),
  }));

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
            backgroundColor: palette.bgCanvas,
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
          <Animated.View
            style={[
              styles.footer,
              {
                backgroundColor: palette.bgSurface,
                borderTopColor: palette.outline,
              },
              footerStyle,
            ]}
          >
            {footer}
          </Animated.View>
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
