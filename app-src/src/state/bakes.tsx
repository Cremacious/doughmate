// The bake journal. Each bake records how a loaf turned out, optionally linked to
// a recipe and the starter used (by id plus a name snapshot). Self contained.
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { storage } from '@/lib/storage';

export interface Bake {
  id: string;
  name: string;
  recipeId?: string;
  recipeName?: string;
  starterId?: string;
  starterName?: string;
  rating: number;
  tags: string[];
  notes?: string;
  bakedAt: number;
  createdAt: number;
}

export interface BakeInput {
  name: string;
  recipeId?: string;
  recipeName?: string;
  starterId?: string;
  starterName?: string;
  rating: number;
  tags: string[];
  notes?: string;
  bakedAt: number;
}

const STORAGE_KEY = 'doughmate.bakes.v1';

function loadBakes(): Bake[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as Bake[];
  } catch {
    return [];
  }
}

interface BakesContextValue {
  bakes: Bake[];
  addBake: (input: BakeInput) => Bake;
  updateBake: (id: string, input: BakeInput) => void;
  removeBake: (id: string) => void;
  restoreBake: (bake: Bake) => void;
  getBake: (id: string) => Bake | undefined;
}

const BakesContext = createContext<BakesContextValue | null>(null);

function sortByBakedAt(list: Bake[]): Bake[] {
  return [...list].sort((a, b) => b.bakedAt - a.bakedAt);
}

export function BakesProvider({ children }: { children: ReactNode }) {
  const [bakes, setBakes] = useState<Bake[]>(() => sortByBakedAt(loadBakes()));

  const value = useMemo<BakesContextValue>(() => {
    const commit = (next: Bake[]) => {
      const sorted = sortByBakedAt(next);
      storage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      setBakes(sorted);
    };
    const fromInput = (input: BakeInput, id: string, createdAt: number): Bake => ({
      id,
      name: input.name,
      recipeId: input.recipeId,
      recipeName: input.recipeName,
      starterId: input.starterId,
      starterName: input.starterName,
      rating: input.rating,
      tags: input.tags,
      notes: input.notes,
      bakedAt: input.bakedAt,
      createdAt,
    });
    return {
      bakes,
      addBake: (input) => {
        const bake = fromInput(
          input,
          `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          Date.now()
        );
        commit([bake, ...bakes]);
        return bake;
      },
      updateBake: (id, input) =>
        commit(bakes.map((b) => (b.id === id ? fromInput(input, b.id, b.createdAt) : b))),
      removeBake: (id) => commit(bakes.filter((b) => b.id !== id)),
      restoreBake: (bake) => commit([bake, ...bakes]),
      getBake: (id) => bakes.find((b) => b.id === id),
    };
  }, [bakes]);

  return <BakesContext.Provider value={value}>{children}</BakesContext.Provider>;
}

export function useBakes(): BakesContextValue {
  const ctx = useContext(BakesContext);
  if (!ctx) {
    throw new Error('useBakes must be used inside a BakesProvider');
  }
  return ctx;
}
