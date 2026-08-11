// Proof Toast. One at a time, above the tab bar. Neutral (dark) or confirmation
// (primary wash). Optional action (Undo). Auto dismisses after 4.2s.
import { createContext, type ReactNode, useContext, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { radius, spacing, typography } from '@/theme';

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
  const confirmation = toast.variant === 'confirmation';

  const bg = confirmation ? palette.primaryWash : palette.toastBg;
  const fg = confirmation ? palette.textInk : palette.toastText;
  const actionColor = confirmation ? palette.primaryText : palette.accentButter;

  return (
    <Animated.View
      pointerEvents="box-none"
      entering={reduced ? FadeIn.duration(120) : SlideInDown.springify().stiffness(210).damping(18)}
      exiting={reduced ? FadeOut.duration(120) : SlideOutDown.duration(200)}
      style={[styles.wrap, { bottom: insets.bottom + 96 }]}
    >
      <View style={[styles.toast, { backgroundColor: bg }]}>
        <Text style={[typography.body.md, styles.message, { color: fg }]} numberOfLines={2}>
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
            <Text style={[typography.title, { color: actionColor }]}>{toast.actionLabel}</Text>
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
    borderRadius: radius.lg,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  message: { flexShrink: 1 },
});

export default ToastProvider;
