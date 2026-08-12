// Live timers. Each is running (with an end time) or paused (with a held
// remaining). "Done" is derived from the clock, not stored. Self contained.
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { storage } from '@/lib/storage';

export interface Timer {
  id: string;
  label: string;
  recipeId?: string;
  stepLabel?: string;
  durationMs: number;
  status: 'running' | 'paused';
  endsAt?: number;
  remainingMs?: number;
  createdAt: number;
}

export interface StartTimerInput {
  label: string;
  durationMs: number;
  recipeId?: string;
  stepLabel?: string;
}

const STORAGE_KEY = 'doughmate.timers.v1';

function loadTimers(): Timer[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as Timer[];
  } catch {
    return [];
  }
}

function sortTimers(list: Timer[]): Timer[] {
  return [...list].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'running' ? -1 : 1;
    }
    if (a.status === 'running') {
      return (a.endsAt ?? 0) - (b.endsAt ?? 0);
    }
    return b.createdAt - a.createdAt;
  });
}

interface TimersContextValue {
  timers: Timer[];
  startTimer: (input: StartTimerInput) => Timer;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  cancelTimer: (id: string) => void;
  getTimer: (id: string) => Timer | undefined;
}

const TimersContext = createContext<TimersContextValue | null>(null);

export function TimersProvider({ children }: { children: ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>(() => sortTimers(loadTimers()));

  const value = useMemo<TimersContextValue>(() => {
    const commit = (next: Timer[]) => {
      const sorted = sortTimers(next);
      storage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      setTimers(sorted);
    };
    return {
      timers,
      startTimer: (input) => {
        const timer: Timer = {
          id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          label: input.label,
          recipeId: input.recipeId,
          stepLabel: input.stepLabel,
          durationMs: input.durationMs,
          status: 'running',
          endsAt: Date.now() + input.durationMs,
          createdAt: Date.now(),
        };
        commit([timer, ...timers]);
        return timer;
      },
      pauseTimer: (id) =>
        commit(
          timers.map((t) =>
            t.id === id && t.status === 'running'
              ? {
                  ...t,
                  status: 'paused',
                  remainingMs: Math.max(0, (t.endsAt ?? Date.now()) - Date.now()),
                  endsAt: undefined,
                }
              : t
          )
        ),
      resumeTimer: (id) =>
        commit(
          timers.map((t) =>
            t.id === id && t.status === 'paused'
              ? {
                  ...t,
                  status: 'running',
                  endsAt: Date.now() + (t.remainingMs ?? 0),
                  remainingMs: undefined,
                }
              : t
          )
        ),
      cancelTimer: (id) => commit(timers.filter((t) => t.id !== id)),
      getTimer: (id) => timers.find((t) => t.id === id),
    };
  }, [timers]);

  return <TimersContext.Provider value={value}>{children}</TimersContext.Provider>;
}

export function useTimers(): TimersContextValue {
  const ctx = useContext(TimersContext);
  if (!ctx) {
    throw new Error('useTimers must be used inside a TimersProvider');
  }
  return ctx;
}
