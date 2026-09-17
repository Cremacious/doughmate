// Picking the Supporter package out of a RevenueCat offering, and reading its
// price. Pure on purpose: the offering is edited in a web console, so the app
// cannot assume anything about how many packages come back or what order they
// arrive in, and that logic is worth testing without a native module in the way.
//
// OfferingPackage is structural rather than imported so this file stays free of
// react-native-purchases. Jest runs these tests in a node environment where that
// import would not load. RevenueCat's real PurchasesPackage satisfies it.
import { PRO_PRODUCT_ID } from './purchases.types';

export interface OfferingPackage {
  readonly product: {
    readonly identifier: string;
    readonly priceString: string;
  };
}

/**
 * The package whose product is the Supporter purchase, or null if the offering
 * does not contain it. Matches on product id, never on position.
 */
export function selectProPackage<T extends OfferingPackage>(
  packages: readonly T[] | null | undefined
): T | null {
  return packages?.find((pkg) => pkg.product.identifier === PRO_PRODUCT_ID) ?? null;
}

/**
 * The storefront-localised price string, e.g. "$2.99" or "€3,49". Null when the
 * package is absent or carries no price, so callers can fall back to their own
 * copy rather than render a blank.
 */
export function proPriceString(pkg: OfferingPackage | null | undefined): string | null {
  const price = pkg?.product.priceString;
  return price?.trim() ? price : null;
}
