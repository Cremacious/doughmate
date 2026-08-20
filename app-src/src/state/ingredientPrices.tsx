// Ingredient prices the baker has entered, used to cost a recipe. One record per
// ingredient name, normalised to dollars per gram so any recipe unit can use it.
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { type IngredientPrice, priceKey, upsertPrice } from '@/lib/cost';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'doughmate.ingredientPrices.v1';

function loadPrices(): IngredientPrice[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as IngredientPrice[];
  } catch {
    return [];
  }
}

interface IngredientPricesContextValue {
  prices: IngredientPrice[];
  setPrice: (entry: IngredientPrice) => void;
  removePrice: (name: string) => void;
  getPrice: (name: string) => IngredientPrice | undefined;
}

const IngredientPricesContext = createContext<IngredientPricesContextValue | null>(null);

export function IngredientPricesProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<IngredientPrice[]>(loadPrices);

  const value = useMemo<IngredientPricesContextValue>(() => {
    // The updater form of setState (not a `prices` closed over from this render) is
    // required here: a rename calls removePrice(oldName) and setPrice(newEntry) back
    // to back in the same handler, before React has re-rendered. Computing each commit
    // from a snapshot of `prices` captured at render time would make the second call
    // overwrite the first's effect instead of composing with it.
    const commit = (updater: (prev: IngredientPrice[]) => IngredientPrice[]) => {
      setPrices((prev) => {
        const next = updater(prev);
        storage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    };
    return {
      prices,
      setPrice: (entry) => commit((prev) => upsertPrice(prev, entry)),
      removePrice: (name) =>
        commit((prev) => prev.filter((p) => priceKey(p.ingredientName) !== priceKey(name))),
      getPrice: (name) => prices.find((p) => priceKey(p.ingredientName) === priceKey(name)),
    };
  }, [prices]);

  return (
    <IngredientPricesContext.Provider value={value}>{children}</IngredientPricesContext.Provider>
  );
}

export function useIngredientPrices(): IngredientPricesContextValue {
  const ctx = useContext(IngredientPricesContext);
  if (!ctx) {
    throw new Error('useIngredientPrices must be used inside an IngredientPricesProvider');
  }
  return ctx;
}
