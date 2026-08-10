// The Recipe Box: a persisted list of saved recipes. Each recipe is a name plus
// a few free-text ingredient lines (the same shape the scaler understands).
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { storage } from '@/lib/storage';

export interface Recipe {
  id: string;
  name: string;
  lines: string[];
  createdAt: number;
}

const STORAGE_KEY = 'doughmate.recipes.v1';

function loadRecipes(): Recipe[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as Recipe[];
  } catch {
    return [];
  }
}

function persist(recipes: Recipe[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

interface RecipesContextValue {
  recipes: Recipe[];
  addRecipe: (input: { name: string; lines: string[] }) => Recipe;
  removeRecipe: (id: string) => void;
  restoreRecipe: (recipe: Recipe) => void;
}

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes);

  const value = useMemo<RecipesContextValue>(() => {
    const commit = (next: Recipe[]) => {
      persist(next);
      setRecipes(next);
    };
    return {
      recipes,
      addRecipe: ({ name, lines }) => {
        const recipe: Recipe = {
          id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          name,
          lines,
          createdAt: Date.now(),
        };
        commit([recipe, ...recipes]);
        return recipe;
      },
      removeRecipe: (id) => commit(recipes.filter((r) => r.id !== id)),
      restoreRecipe: (recipe) =>
        commit([recipe, ...recipes].sort((a, b) => b.createdAt - a.createdAt)),
    };
  }, [recipes]);

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes(): RecipesContextValue {
  const ctx = useContext(RecipesContext);
  if (!ctx) {
    throw new Error('useRecipes must be used inside a RecipesProvider');
  }
  return ctx;
}
