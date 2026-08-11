// Sourdough starters: a persisted list, each with a feed interval and a feed
// history. Feeding stamps the time so the countdown to the next feed can update.
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { storage } from '@/lib/storage';

export interface Starter {
  id: string;
  name: string;
  intervalHours: number;
  lastFedAt: number | null;
  feedCount: number;
  createdAt: number;
}

const STORAGE_KEY = 'doughmate.starters.v1';

function loadStarters(): Starter[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as Starter[];
  } catch {
    return [];
  }
}

interface StartersContextValue {
  starters: Starter[];
  addStarter: (input: { name: string; intervalHours: number }) => Starter;
  feedStarter: (id: string) => void;
  removeStarter: (id: string) => void;
  restoreStarter: (starter: Starter) => void;
}

const StartersContext = createContext<StartersContextValue | null>(null);

export function StartersProvider({ children }: { children: ReactNode }) {
  const [starters, setStarters] = useState<Starter[]>(loadStarters);

  const value = useMemo<StartersContextValue>(() => {
    const commit = (next: Starter[]) => {
      storage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStarters(next);
    };
    return {
      starters,
      addStarter: ({ name, intervalHours }) => {
        const starter: Starter = {
          id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          name,
          intervalHours,
          lastFedAt: null,
          feedCount: 0,
          createdAt: Date.now(),
        };
        commit([starter, ...starters]);
        return starter;
      },
      feedStarter: (id) =>
        commit(
          starters.map((s) =>
            s.id === id ? { ...s, lastFedAt: Date.now(), feedCount: s.feedCount + 1 } : s
          )
        ),
      removeStarter: (id) => commit(starters.filter((s) => s.id !== id)),
      restoreStarter: (starter) =>
        commit([starter, ...starters].sort((a, b) => b.createdAt - a.createdAt)),
    };
  }, [starters]);

  return <StartersContext.Provider value={value}>{children}</StartersContext.Provider>;
}

export function useStarters(): StartersContextValue {
  const ctx = useContext(StartersContext);
  if (!ctx) {
    throw new Error('useStarters must be used inside a StartersProvider');
  }
  return ctx;
}
