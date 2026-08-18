// Fresh Bake Toast. One at a time, dropping in from the top so it never blocks the
// bottom actions; it stacks below the timers pill when one is showing. Optional action
// (Undo). Auto dismisses after 4.2s.
//
// Fresh Bake has one toast appearance. `variant` is still accepted so callers read the
// same, but confirmation no longer gets its own fill: a toast is chrome, and chrome
// does not get to be a second hero.
import { createContext, type ReactNode, useContext, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TIMER_BANNER_SPACE, useTimerBannerVisible } from '@/hooks/useTimerBannerVisible';
import { radius, shadow, spacing, typography } from '@/theme';

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'neutral' | 'confirmation';
}

interface ActiveToast extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const AUTO_DISMISS_MS = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const value = useMemo<ToastContextValue>(
    () => ({
      show: (options) => {
        if (timer.current) {
          clearTimeout(timer.current);
        }
        nextId.current += 1;
        setToast({ ...options, id: nextId.current });
        timer.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
      },
    }),
    []
  );

  const dismiss = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setToast(null);
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastView key={toast.id} toast={toast} onDismiss={dismiss} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onDismiss }: { toast: ActiveToast; onDismiss: () => void }) {
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const bannerVisible = useTimerBannerVisible();
  const top = insets.top + spacing.xs + (bannerVisible ? TIMER_BANNER_SPACE : 0);

  return (
    <Animated.View
      pointerEvents="box-none"
      entering={reduced ? FadeIn.duration(120) : SlideInUp.springify().stiffness(210).damping(18)}
      exiting={reduced ? FadeOut.duration(120) : SlideOutUp.duration(200)}
      style={[styles.wrap, { top }]}
    >
      <View style={[styles.toast, shadow.md, { backgroundColor: palette.toastBg }]}>
        <Text style={[styles.message, { color: palette.toastText }]} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.actionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              toast.onAction?.();
              onDismiss();
            }}
          >
            <Text style={[typography.labelSm, { color: palette.toastAction }]}>
              {toast.actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: radius.xl,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  message: { flexShrink: 1, fontFamily: 'NunitoSans_700Bold', fontSize: 15, lineHeight: 21 },
});

export default ToastProvider;
