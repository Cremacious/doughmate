import { proPriceString, selectProPackage } from './offering';
import { PRO_PRODUCT_ID } from './purchases.types';

const pkg = (identifier: string, priceString: string) => ({
  product: { identifier, priceString },
});

describe('selectProPackage', () => {
  it('finds the supporter package by product id', () => {
    const supporter = pkg(PRO_PRODUCT_ID, '$2.99');
    expect(selectProPackage([supporter])).toBe(supporter);
  });

  // The offering is edited in a web console, so the order of its packages is
  // not something the app controls. Matching by product id rather than by
  // position is what stops a reordered offering from charging for the wrong
  // thing.
  it('ignores position and matches on identity', () => {
    const decoy = pkg('com.cremacious.doughmate.other', '$9.99');
    const supporter = pkg(PRO_PRODUCT_ID, '$2.99');
    expect(selectProPackage([decoy, supporter])).toBe(supporter);
  });

  it('returns null when no package matches', () => {
    expect(selectProPackage([pkg('com.example.nope', '$1.99')])).toBeNull();
  });

  it('survives an empty, missing or undefined offering', () => {
    expect(selectProPackage([])).toBeNull();
    expect(selectProPackage(null)).toBeNull();
    expect(selectProPackage(undefined)).toBeNull();
  });
});

describe('proPriceString', () => {
  it('reads the localised price off the package', () => {
    expect(proPriceString(pkg(PRO_PRODUCT_ID, '$2.99'))).toBe('$2.99');
  });

  // RevenueCat hands back whatever the storefront says, which is the whole
  // point of asking it rather than hardcoding dollars.
  it('passes a non-USD price through untouched', () => {
    expect(proPriceString(pkg(PRO_PRODUCT_ID, '€3,49'))).toBe('€3,49');
  });

  it('returns null for a missing package', () => {
    expect(proPriceString(null)).toBeNull();
    expect(proPriceString(undefined)).toBeNull();
  });

  // An offering that resolved but carries an empty price string is useless to
  // the paywall, and treating it as absent is what lets the caller fall back
  // to its own copy rather than rendering a blank beside the button.
  it('treats an empty price string as absent', () => {
    expect(proPriceString(pkg(PRO_PRODUCT_ID, ''))).toBeNull();
  });

  // A whitespace-only price is just as useless to the paywall as an empty one;
  // without trimming, `' '` is truthy and would slip past the "never blank"
  // guard and render as a blank space beside the button.
  it('treats a whitespace-only price string as absent', () => {
    expect(proPriceString(pkg(PRO_PRODUCT_ID, '   '))).toBeNull();
  });
});
