// Sam's current mood, shared app wide. Screens nudge it (celebrate on a save,
// react to a recipe name); the floating Sam shows the matching animation.
import { createContext, type ReactNode, useContext, useMemo, useRef, useState } from 'react';

import { samStateForText } from '@/lib/sam';
import type { SamState } from '@/lib/samState';

interface SamMoodContextValue {
  state: SamState;
  setMood: (state: SamState) => void;
  /** React to free text (e.g. a recipe name). */
  reactTo: (text: string) => void;
  /** A brief celebration, then back to idle. */
  celebrate: () => void;
}

const SamMoodContext = createContext<SamMoodContextValue | null>(null);

export function SamMoodProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SamState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const value = useMemo<SamMoodContextValue>(
    () => ({
      state,
      setMood: setState,
      reactTo: (text) => setState(samStateForText(text)),
      celebrate: () => {
        setState('celebrate');
        if (timer.current) {
          clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => setState('idle'), 2200);
      },
    }),
    [state]
  );

  return <SamMoodContext.Provider value={value}>{children}</SamMoodContext.Provider>;
}

export function useSamMood(): SamMoodContextValue {
  const ctx = useContext(SamMoodContext);
  if (!ctx) {
    throw new Error('useSamMood must be used inside a SamMoodProvider');
  }
  return ctx;
}
