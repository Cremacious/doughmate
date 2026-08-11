// Purchases: native (RevenueCat). Reads the API key from env; with no key it
// stays unconfigured and Pro simply never unlocks (so a dev build without keys
// still runs). Swap in real keys via .env.local or EAS secrets.
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

import { PRO_ENTITLEMENT, type PurchaseOutcome } from './purchases.types';

const apiKey =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_KEY_IOS
    : process.env.EXPO_PUBLIC_REVENUECAT_KEY_ANDROID;

export const PURCHASES_AVAILABLE = Boolean(apiKey);

let configured = false;

export async function configurePurchases(): Promise<void> {
  if (!apiKey || configured) {
    return;
  }
  Purchases.configure({ apiKey });
  configured = true;
}

export async function refreshPro(): Promise<boolean> {
  if (!configured) {
    return false;
  }
  try {
    const info = await Purchases.getCustomerInfo();
    return Boolean(info.entitlements.active[PRO_ENTITLEMENT]);
  } catch {
    return false;
  }
}

export async function purchasePro(): Promise<PurchaseOutcome> {
  if (!configured) {
    return { ok: false, error: 'not_configured' };
  }
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    if (!pkg) {
      return { ok: false, error: 'no_offering' };
    }
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { ok: Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT]) };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'userCancelled' in error) {
      if ((error as { userCancelled?: boolean }).userCancelled) {
        return { ok: false, cancelled: true };
      }
    }
    return { ok: false, error: 'failed' };
  }
}

export async function restorePro(): Promise<boolean> {
  if (!configured) {
    return false;
  }
  try {
    const info = await Purchases.restorePurchases();
    return Boolean(info.entitlements.active[PRO_ENTITLEMENT]);
  } catch {
    return false;
  }
}
