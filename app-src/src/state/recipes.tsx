// The Recipe Box. Recipes carry structured ingredients, steps, tags and notes.
// v1 records ({ name, lines[] }) are migrated once into this richer shape.
import { createContext, type ReactNode, useContext, useMemo, useRef, useState } from 'react';

import { parseIngredientLine } from '@/lib/recipe';
import { storage } from '@/lib/storage';

export interface RecipeIngredient {
  amount: number | '';
  unit: string;
  item: string;
  /** Optional section name (e.g. "Dough"). Absent = the leading unlabeled group. */
  section?: string;
}

export interface RecipeStep {
  text: string;
  time?: string;
}

export interface Recipe {
  id: string;
  name: string;
  tags: string[];
  totalTime?: string;
  yieldLabel: string;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  notes?: string;
  createdAt: number;
}

export interface RecipeInput {
  name: string;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  tags?: string[];
  yieldLabel?: string;
  servings?: number;
  notes?: string;
  totalTime?: string;
}

const KEY = 'doughmate.recipes.v2';
const KEY_V1 = 'doughmate.recipes.v1';

interface V1Recipe {
  id: string;
  name: string;
  lines: string[];
  createdAt: number;
}

function migrateV1(records: V1Recipe[]): Recipe[] {
  return records.map((r) => ({
    id: r.id,
    name: r.name,
    tags: [],
    yieldLabel: '',
    servings: 1,
    ingredients: r.lines.map(parseIngredientLine),
    steps: [],
    createdAt: r.createdAt,
  }));
}

function loadRecipes(): Recipe[] {
  const raw = storage.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Recipe[];
    } catch {
      return [];
    }
  }
  const rawV1 = storage.getItem(KEY_V1);
  if (rawV1) {
    try {
      const migrated = migrateV1(JSON.parse(rawV1) as V1Recipe[]);
      storage.setItem(KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return [];
    }
  }
  return [];
}

interface RecipesContextValue {
  recipes: Recipe[];
  addRecipe: (input: RecipeInput) => Recipe;
  updateRecipe: (id: string, input: RecipeInput) => void;
  removeRecipe: (id: string) => void;
  restoreRecipe: (recipe: Recipe) => void;
  getRecipe: (id: string) => Recipe | undefined;
}

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes);
  // Mutations derive from this rather than from the captured `recipes`. An undo
  // handler lives inside a toast, which holds the callback from the render that
  // raised it — deriving from that render's list re-added a recipe that had
  // already gone, leaving two records sharing one id.
  const listRef = useRef(recipes);

  const value = useMemo<RecipesContextValue>(() => {
    const commit = (update: (prev: Recipe[]) => Recipe[]) => {
      const next = update(listRef.current);
      listRef.current = next;
      storage.setItem(KEY, JSON.stringify(next));
      setRecipes(next);
    };
    const fromInput = (input: RecipeInput, id: string, createdAt: number): Recipe => ({
      id,
      name: input.name,
      tags: input.tags ?? [],
      totalTime: input.totalTime,
      yieldLabel: input.yieldLabel ?? '',
      servings: input.servings ?? 1,
      ingredients: input.ingredients ?? [],
      steps: input.steps ?? [],
      notes: input.notes,
      createdAt,
    });
    return {
      recipes,
      addRecipe: (input) => {
        const recipe = fromInput(
          input,
          `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          Date.now()
        );
        commit((prev) => [recipe, ...prev]);
        return recipe;
      },
      updateRecipe: (id, input) =>
        commit((prev) => prev.map((r) => (r.id === id ? fromInput(input, r.id, r.createdAt) : r))),
      removeRecipe: (id) => commit((prev) => prev.filter((r) => r.id !== id)),
      // Dropping any record already holding this id keeps restore idempotent, so
      // a double tap on undo cannot duplicate what it is putting back.
      restoreRecipe: (recipe) =>
        commit((prev) =>
          [recipe, ...prev.filter((r) => r.id !== recipe.id)].sort(
            (a, b) => b.createdAt - a.createdAt
          )
        ),
      getRecipe: (id) => recipes.find((r) => r.id === id),
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
