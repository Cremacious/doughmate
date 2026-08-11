// Pro entitlement state, backed by RevenueCat on native (stubbed on web).
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import {
  configurePurchases,
  PURCHASES_AVAILABLE,
  purchasePro,
  refreshPro,
  restorePro,
} from '@/lib/purchases';
import type { PurchaseOutcome } from '@/lib/purchases.types';

interface ProContextValue {
  isPro: boolean;
  /** Whether purchasing is possible (native build with a configured key). */
  available: boolean;
  purchase: () => Promise<PurchaseOutcome>;
  restore: () => Promise<boolean>;
}

const ProContext = createContext<ProContextValue | null>(null);

export function ProProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      await configurePurchases();
      const pro = await refreshPro();
      if (active) {
        setIsPro(pro);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<ProContextValue>(
    () => ({
      isPro,
      available: PURCHASES_AVAILABLE,
      purchase: async () => {
        const outcome = await purchasePro();
        if (outcome.ok) {
          setIsPro(true);
        }
        return outcome;
      },
      restore: async () => {
        const restored = await restorePro();
        if (restored) {
          setIsPro(true);
        }
        return restored;
      },
    }),
    [isPro]
  );

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export function usePro(): ProContextValue {
  const ctx = useContext(ProContext);
  if (!ctx) {
    throw new Error('usePro must be used inside a ProProvider');
  }
  return ctx;
}
