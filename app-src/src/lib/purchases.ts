// Purchases: web / default stub. Pro is never active on web; every call is a
// safe no-op. Native devices use purchases.native.ts (RevenueCat) instead.
import type { PurchaseOutcome } from './purchases.types';

/** Whether in app purchases can run at all (needs a native build + a key). */
export const PURCHASES_AVAILABLE = false;

export async function configurePurchases(): Promise<void> {}

export async function refreshPro(): Promise<boolean> {
  return false;
}

export async function purchasePro(): Promise<PurchaseOutcome> {
  return { ok: false, error: 'not_configured' };
}

export async function restorePro(): Promise<boolean> {
  return false;
}
