// Shared types for the purchases layer (web stub and native both use these).
export interface PurchaseOutcome {
  ok: boolean;
  cancelled?: boolean;
  error?: 'not_configured' | 'no_offering' | 'failed';
}

/** RevenueCat entitlement identifier that unlocks Pro. */
export const PRO_ENTITLEMENT = 'pro';
