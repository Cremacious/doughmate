// Pro entitlement state, backed by RevenueCat on native (stubbed on web).
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { storage } from '@/lib/storage';
import {
  configurePurchases,
  getProPrice,
  PURCHASES_AVAILABLE,
  purchasePro,
  refreshPro,
  restorePro,
} from '@/lib/purchases';
import type { PurchaseOutcome } from '@/lib/purchases.types';

const DEBUG_PRO_KEY = 'debug.proOverride';

/** Dev-only manual Pro override, so the Pro experience can be tested without a real purchase. */
function loadDebugProOverride(): boolean {
  return __DEV__ && storage.getItem(DEBUG_PRO_KEY) === 'true';
}

interface ProContextValue {
  isPro: boolean;
  /** Whether purchasing is possible (native build with a configured key). */
  available: boolean;
  /** Storefront-localised Supporter price, or null until the offering resolves. */
  price: string | null;
  purchase: () => Promise<PurchaseOutcome>;
  restore: () => Promise<boolean>;
  /** Re-fetches the price. Callers use this to recover from a launch-time fetch that failed. */
  refreshPrice: () => Promise<void>;
  /** Dev builds only: manually forces isPro on, regardless of the real entitlement. */
  debugProOverride: boolean;
  setDebugProOverride: (value: boolean) => void;
}

const ProContext = createContext<ProContextValue | null>(null);

export function ProProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [debugProOverride, setDebugProOverrideState] = useState(loadDebugProOverride);
  const [price, setPrice] = useState<string | null>(null);

  // Shared unmount guard for the mount effect below and for refreshPrice, which
  // can still be resolving after the paywall that triggered it has closed.
  const mounted = useRef(true);
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const refreshPrice = useCallback(async () => {
    const storePrice = await getProPrice();
    if (mounted.current) {
      setPrice(storePrice);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await configurePurchases();
      } catch {
        // A malformed key must not stop isPro/price from resolving below, or a
        // paying supporter would silently see ads with no error surfaced.
      }
      const [pro, storePrice] = await Promise.all([refreshPro(), getProPrice()]);
      if (mounted.current) {
        setIsPro(pro);
        setPrice(storePrice);
      }
    })();
  }, []);

  const setDebugProOverride = (value: boolean) => {
    if (!__DEV__) {
      return;
    }
    setDebugProOverrideState(value);
    storage.setItem(DEBUG_PRO_KEY, String(value));
  };

  const value = useMemo<ProContextValue>(
    () => ({
      isPro: debugProOverride || isPro,
      available: PURCHASES_AVAILABLE,
      price,
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
      refreshPrice,
      debugProOverride,
      setDebugProOverride,
    }),
    [isPro, debugProOverride, price, refreshPrice]
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
