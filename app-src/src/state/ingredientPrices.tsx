// Ingredient prices the baker has entered, used to cost a recipe. One record per
// ingredient name, normalised to dollars per gram so any recipe unit can use it.
import { createContext, type ReactNode, useContext, useMemo, useRef, useState } from 'react';

import { type IngredientPrice, priceKey, removePriceByName, upsertPrice } from '@/lib/cost';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'doughmate.ingredientPrices.v1';

function loadPrices(): IngredientPrice[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as IngredientPrice[]) : [];
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
  // Mutations derive from this rather than from the captured `prices`, matching
  // every other provider. A rename calls removePrice(oldName) then setPrice(new)
  // back to back in one handler, before React re-renders, so the second call has
  // to see the first's result. Deriving from a ref also keeps the storage write
  // out of the setState updater, which React requires to be pure.
  const listRef = useRef(prices);

  const value = useMemo<IngredientPricesContextValue>(() => {
    const commit = (update: (prev: IngredientPrice[]) => IngredientPrice[]) => {
      const next = update(listRef.current);
      listRef.current = next;
      storage.setItem(STORAGE_KEY, JSON.stringify(next));
      setPrices(next);
    };
    return {
      prices,
      setPrice: (entry) => commit((prev) => upsertPrice(prev, entry)),
      removePrice: (name) => commit((prev) => removePriceByName(prev, name)),
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
