# DoughMate 1.0 Production Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship DoughMate 1.0 to the App Store with a working $2.99 one-time Supporter purchase and a live ad banner.

**Architecture:** Four console phases (Apple agreement, IAP price, RevenueCat, submission) bracket four code tasks. The code work extracts offering selection and price formatting into a pure module so it is unit-testable under the existing node-environment Jest config, then threads the resulting localized price through `usePro` to the paywall. Everything is verified on one production build in TestFlight, so the tested binary is the submitted binary.

**Tech Stack:** Expo SDK 57, React Native, TypeScript (strict, `noUncheckedIndexedAccess`), `react-native-purchases` (RevenueCat), `react-native-google-mobile-ads`, EAS Build/Submit, Jest (node env), ESLint, Prettier.

**Spec:** `docs/superpowers/specs/2026-09-17-production-launch-design.md`

## Global Constraints

- **Every `eas` and `npm` command runs from `app-src/`**, never the repo root. From the root, `eas` fails with "EAS project not configured" and offers to `eas init` a new project — which would be wrong. The real project id is in `app-src/app.json` at `extra.eas.projectId`.
- **RevenueCat entitlement id is exactly `pro`.** It must match `PRO_ENTITLEMENT` in `src/lib/purchases.types.ts:9`. Renaming it would break purchases.
- **Product id is exactly `com.cremacious.doughmate.pro`.**
- **Bundle identifier is `com.cremacious.doughmate`.**
- **App Store app id is `6802765361`.** IAP Apple id is `6802774060`.
- **Price is $2.99 USD**, one-time, Non-Consumable.
- **User-facing copy says "Supporter", never "Pro".** Code identifiers stay `pro` (`usePro`, `isPro`, `ProProvider`, `palette.pro`, `PRO_ENTITLEMENT`).
- **1.0 is iOS-only.** `supportsTablet` is false. Do not add Android production AdMob values.
- **Jest runs in a `node` environment** with `testMatch: ['**/src/lib/**/*.test.ts']`. A test file cannot import `react-native-purchases`, `react-native`, or anything else native. Pure logic must live in a module free of native imports.
- **`collectCoverageFrom` in `jest.config.js` enforces 100% branches/functions/lines/statements** on the modules it lists. Any new pure module added to that list must hit 100%.
- **Before any EAS build, verify every package named in a config file resolves.** `babel.config.js` names `babel-preset-expo` and `react-native-worklets/plugin`. pnpm's isolated `node_modules` does not expose transitives to the project root, so a missing declaration passes locally and fails on EAS with the useless error "Cannot read properties of undefined (reading 'transformFile')".
- **Never tap a live ad in the app.** Google's invalid-traffic enforcement is automated.

---

## Phase A — Console Prerequisites (no code)

These are console operations. They have no test cycle; each ends with an explicit verification.

### Task 1: Accept the updated Apple Developer Program License Agreement

**Owner:** Chris, personally. This is a legal agreement binding him; it is not delegated.

**Blocks:** every later task. App Store Connect states the updated agreement must be accepted before new apps can be submitted.

- [ ] **Step 1: Open the account page**

Go to `https://developer.apple.com/account` and sign in as the Account Holder.

- [ ] **Step 2: Review and accept**

Look for the Agreements banner or the "Review Agreement" prompt on the landing page. Read it, then accept.

- [ ] **Step 3: Verify the banner is gone**

Reload `https://appstoreconnect.apple.com/apps`. The yellow "Apple Developer Program License Agreement Updated" banner must no longer appear.

**Done when:** the banner is absent from the Apps page.

---

### Task 2: Change the IAP price from $4.99 to $2.99

**Context:** The IAP already exists and is in "Ready for Review" / "added for review" state. A price change on an IAP that has never been released is metadata-only and does not trigger re-review.

- [ ] **Step 1: Open the IAP**

Go to `https://appstoreconnect.apple.com/apps/6802765361/distribution/iaps/6802774060`.

App Store Connect pages load slowly and often refuse script injection for several seconds. Wait for a screenshot to succeed before clicking anything.

- [ ] **Step 2: Confirm the starting state**

Scroll to **Price Schedule**. Confirm:
- Base Country or Region is **United States (USD)**
- Availability is **All countries or regions selected** (175)
- Clicking **Current Price** shows **United States (USD) $4.99**, proceeds $3.50

- [ ] **Step 3: Set the new price**

Click the **+** beside "Price Schedule". Choose **$2.99 (USD)** for the United States base. Leave the start date as today and no end date. Let Apple auto-convert the other 174 storefronts.

- [ ] **Step 4: Save**

Click **Save**. If the button is greyed out, no change was registered — re-check Step 3.

- [ ] **Step 5: Verify**

Reload the page, open **Current Price**, and confirm the United States (USD) row reads **$2.99** with proceeds of **$2.09**.

**Done when:** the Current Price table shows $2.99 for United States (USD).

---

### Task 3: Generate the In-App Purchase Key

**Owner:** Chris, personally. The `.p8` is a private signing key. He downloads it and uploads it to RevenueCat himself; it is never handled on his behalf.

**Note:** this is the In-App Purchase Key, **not** the "App-Specific Shared Secret" and **not** an App Store Connect API key. The three are different and RevenueCat wants this one specifically.

- [ ] **Step 1: Open the integrations page**

Go to `https://appstoreconnect.apple.com/access/integrations/api/subs`, or navigate Users and Access → Integrations → **In-App Purchase**.

- [ ] **Step 2: Generate the key**

Click **+**, name it `RevenueCat`, and generate.

- [ ] **Step 3: Download and record**

Download the `.p8` file. **Apple allows this download exactly once.** Also record from the same page:
- the **Key ID** (beside the key)
- the **Issuer ID** (at the top of the page)

Keep all three together for Task 4.

**Done when:** the `.p8` is saved locally and the Key ID and Issuer ID are recorded.

---

### Task 4: Set up RevenueCat end to end

**Context:** RevenueCat currently has exactly one project, "Picross Cryptids". Nothing exists for DoughMate.

- [ ] **Step 1: Create the project**

At `https://app.revenuecat.com`, open the project switcher (top left) → **Create new project**. Name it `DoughMate`.

If an onboarding wizard appears, dismiss it with "Go to dashboard". The wizard creates Test Store objects that are not wanted here.

- [ ] **Step 2: Add the App Store app**

Project settings → **Apps** → **+ New** → **App Store**.

- App name: `DoughMate`
- Bundle ID: `com.cremacious.doughmate`

- [ ] **Step 3: Attach the In-App Purchase Key**

On that same app's settings page, find **In-App Purchase Key Configuration**. Upload the `.p8` from Task 3 and enter the **Key ID** and **Issuer ID**.

Wait for RevenueCat to show the key as validated before continuing. An unvalidated key means RevenueCat cannot verify receipts and purchases will appear to succeed while nothing unlocks.

- [ ] **Step 4: Create the entitlement**

**Product catalog → Entitlements → + New**.

- Identifier: `pro` — lowercase, exactly three characters. This must match `PRO_ENTITLEMENT` in `src/lib/purchases.types.ts:9` character-for-character.
- Description: `Supporter`

- [ ] **Step 5: Create the product**

**Product catalog → Products → + New**. Create it under the **App Store** app just added, not under any Test Store.

- Product ID: `com.cremacious.doughmate.pro`
- Type: Non-Consumable / one-time purchase

- [ ] **Step 6: Attach the product to the entitlement**

Open the `pro` entitlement and attach `com.cremacious.doughmate.pro` to it.

- [ ] **Step 7: Configure the offering**

**Product catalog → Offerings**. Edit the existing offering whose identifier is `default` — do not create a new one. Add exactly **one** package:

- Package type: **Lifetime**
- Product: `com.cremacious.doughmate.pro`

- [ ] **Step 8: Copy the public SDK key**

**Project settings → API keys**. Copy the **public** iOS SDK key — it begins `appl_`. This is a publishable key, not a secret.

Do not copy the secret key (`sk_`), and do not put a secret key in an `EXPO_PUBLIC_*` variable — anything so prefixed is embedded in the shipped bundle.

- [ ] **Step 9: Set it as an EAS environment variable**

From `app-src/`:

```bash
npx eas-cli env:create --environment production --name EXPO_PUBLIC_REVENUECAT_KEY_IOS --value "appl_XXXXXXXXXXXX" --visibility plaintext --non-interactive
```

Replace `appl_XXXXXXXXXXXX` with the real key.

- [ ] **Step 10: Verify**

```bash
npx eas-cli env:list --environment production
```

Expected: three variables — `EXPO_PUBLIC_ADMOB_APP_ID_IOS`, `EXPO_PUBLIC_ADMOB_BANNER_IOS`, and `EXPO_PUBLIC_REVENUECAT_KEY_IOS`.

**Done when:** the key is listed in the production environment, and in RevenueCat the `default` offering contains one Lifetime package pointing at `com.cremacious.doughmate.pro`, which is attached to the `pro` entitlement.

---

## Phase B — Code

### File structure

| File | Responsibility |
|---|---|
| `src/lib/offering.ts` | **New.** Pure: pick the Supporter package out of a list, and read its localized price. No native imports, so it is unit-testable. |
| `src/lib/offering.test.ts` | **New.** Unit tests for the above. |
| `src/lib/purchases.types.ts` | Add `PRO_PRODUCT_ID` beside the existing `PRO_ENTITLEMENT`. |
| `src/lib/purchases.native.ts` | Use the pure selector instead of `availablePackages[0]`; add `getProPrice()`. |
| `src/lib/purchases.ts` | Web stub: add a matching `getProPrice()` returning `null`. |
| `src/state/pro.tsx` | Fetch the price once on mount and expose it as `price` on the context. |
| `app/paywall.tsx` | Render the fetched price, falling back to the existing copy. |
| `src/lib/links.ts` | Fill in `appStoreId`. |
| `jest.config.js` | Add `src/lib/offering.ts` to `collectCoverageFrom`. |

---

### Task 5: Pure offering selection and price

**Files:**
- Create: `app-src/src/lib/offering.ts`
- Create: `app-src/src/lib/offering.test.ts`
- Modify: `app-src/src/lib/purchases.types.ts`
- Modify: `app-src/jest.config.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `PRO_PRODUCT_ID: 'com.cremacious.doughmate.pro'` (exported from `purchases.types.ts`)
  - `interface OfferingPackage { readonly product: { readonly identifier: string; readonly priceString: string } }`
  - `selectProPackage<T extends OfferingPackage>(packages: readonly T[] | null | undefined): T | null`
  - `proPriceString(pkg: OfferingPackage | null | undefined): string | null`

**Why a separate pure module:** `jest.config.js` sets `testEnvironment: 'node'` and `testMatch: ['**/src/lib/**/*.test.ts']`. A test that imports `react-native-purchases` would fail to load. The structural `OfferingPackage` type is satisfied by RevenueCat's real `PurchasesPackage` (whose `product` is a `PurchasesStoreProduct` with `identifier: string` and `priceString: string`), so the native layer passes real objects straight in with no casting.

- [ ] **Step 1: Add the product id constant**

In `app-src/src/lib/purchases.types.ts`, below the existing `PRO_ENTITLEMENT` export:

```ts
/** App Store product identifier for the one-time Supporter purchase. */
export const PRO_PRODUCT_ID = 'com.cremacious.doughmate.pro';
```

- [ ] **Step 2: Write the failing test**

Create `app-src/src/lib/offering.test.ts`:

```ts
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
});
```

- [ ] **Step 3: Run the test to verify it fails**

From `app-src/`:

```bash
npx jest src/lib/offering.test.ts
```

Expected: FAIL — `Cannot find module './offering'`.

- [ ] **Step 4: Write the implementation**

Create `app-src/src/lib/offering.ts`:

```ts
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
  return price ? price : null;
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx jest src/lib/offering.test.ts
```

Expected: PASS, 8 tests.

- [ ] **Step 6: Add the module to the coverage mandate**

In `app-src/jest.config.js`, add `'src/lib/offering.ts',` to the `collectCoverageFrom` array, after `'src/lib/samEmotion.ts',`.

- [ ] **Step 7: Verify coverage is 100%**

```bash
npm run test:coverage
```

Expected: PASS with `offering.ts` at 100% across branches, functions, lines and statements. The global threshold is 100% and will fail the run otherwise.

- [ ] **Step 8: Commit**

```bash
git add app-src/src/lib/offering.ts app-src/src/lib/offering.test.ts app-src/src/lib/purchases.types.ts app-src/jest.config.js
git commit -m "feat(purchases): select the supporter package by product id

The offering is edited in a RevenueCat web console, so neither the number of
packages nor their order is something the app controls. Matching by product id
is what stops a reordered offering from charging for the wrong thing.

Pure and structurally typed so it tests under the node-environment Jest config
without react-native-purchases having to load."
```

---

### Task 6: Use the selector and expose the price in the purchases layer

**Files:**
- Modify: `app-src/src/lib/purchases.native.ts`
- Modify: `app-src/src/lib/purchases.ts`

**Interfaces:**
- Consumes: `selectProPackage`, `proPriceString` from `./offering`; `PRO_PRODUCT_ID` from `./purchases.types`.
- Produces: `getProPrice(): Promise<string | null>` — exported from **both** `purchases.native.ts` and `purchases.ts`, so the two platform siblings keep identical shapes.

**Note:** `metro.config.js` drops the `.native` extension inside `src/` when `DOUGHMATE_EXPO_GO=1`, so the web sibling resolves in Expo Go. The two files must therefore export the same names, or Expo Go breaks.

- [ ] **Step 1: Update the native implementation**

In `app-src/src/lib/purchases.native.ts`, replace the import block and `purchasePro`, and add `getProPrice`.

Change the imports at the top to:

```ts
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

import { proPriceString, selectProPackage } from './offering';
import { PRO_ENTITLEMENT, type PurchaseOutcome } from './purchases.types';
```

Replace the body of `purchasePro` so the package lookup is by identity:

```ts
export async function purchasePro(): Promise<PurchaseOutcome> {
  if (!configured) {
    return { ok: false, error: 'not_configured' };
  }
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = selectProPackage(offerings.current?.availablePackages);
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
```

Add at the end of the file:

```ts
/**
 * The storefront-localised price of the Supporter purchase, or null if the
 * offering cannot be reached. Null is not an error: the paywall falls back to
 * its own copy, so a slow network shows a price rather than a blank.
 */
export async function getProPrice(): Promise<string | null> {
  if (!configured) {
    return null;
  }
  try {
    const offerings = await Purchases.getOfferings();
    return proPriceString(selectProPackage(offerings.current?.availablePackages));
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Update the web stub**

Add to the end of `app-src/src/lib/purchases.ts`:

```ts
export async function getProPrice(): Promise<string | null> {
  return null;
}
```

- [ ] **Step 3: Verify the two siblings export the same names**

```bash
grep -o 'export \(async function\|const\) [A-Za-z_]*' src/lib/purchases.ts src/lib/purchases.native.ts | sed 's/.*[ ]//' | sort | uniq -c
```

Expected: every name appears exactly **twice** — `PURCHASES_AVAILABLE`, `configurePurchases`, `getProPrice`, `purchasePro`, `refreshPro`, `restorePro`. A count of 1 means the siblings have drifted and Expo Go will break.

- [ ] **Step 4: Typecheck and lint**

```bash
npm run typecheck && npm run lint
```

Expected: both clean.

- [ ] **Step 5: Run the full test suite**

```bash
npm test
```

Expected: PASS, no regressions.

- [ ] **Step 6: Commit**

```bash
git add app-src/src/lib/purchases.native.ts app-src/src/lib/purchases.ts
git commit -m "feat(purchases): read the supporter price from RevenueCat

purchasePro now matches the package by product id instead of taking whichever
one happens to be first, and getProPrice exposes the storefront-localised price
so the paywall can stop hardcoding dollars.

Both platform siblings gain getProPrice: metro.config.js resolves the web one
in Expo Go, so a name present in only one of them breaks that path."
```

---

### Task 7: Render the real price on the paywall

**Files:**
- Modify: `app-src/src/state/pro.tsx`
- Modify: `app-src/app/paywall.tsx`

**Interfaces:**
- Consumes: `getProPrice` from `@/lib/purchases`.
- Produces: `price: string | null` on the `usePro()` context value.

**Behaviour:** the price is fetched once when the provider mounts, alongside the existing entitlement refresh. The paywall renders `price ?? t('paywall.price')`, so the hardcoded `$2.99` becomes a fallback for the moment before the offering resolves, for web, and for a failed network — never the primary source.

- [ ] **Step 1: Add `price` to the context type**

In `app-src/src/state/pro.tsx`, add to the `ProContextValue` interface, after `available`:

```ts
  /** Storefront-localised Supporter price, or null until the offering resolves. */
  price: string | null;
```

- [ ] **Step 2: Import the new function**

Change the `@/lib/purchases` import block to include `getProPrice`:

```ts
import {
  configurePurchases,
  getProPrice,
  PURCHASES_AVAILABLE,
  purchasePro,
  refreshPro,
  restorePro,
} from '@/lib/purchases';
```

- [ ] **Step 3: Fetch the price on mount**

Add the state declaration beside the existing ones:

```ts
  const [price, setPrice] = useState<string | null>(null);
```

Then extend the existing mount effect so it also resolves the price. Replace the effect body with:

```ts
  useEffect(() => {
    let active = true;
    void (async () => {
      await configurePurchases();
      const [pro, storePrice] = await Promise.all([refreshPro(), getProPrice()]);
      if (active) {
        setIsPro(pro);
        setPrice(storePrice);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
```

- [ ] **Step 4: Expose it on the context**

In the `useMemo` value object, add `price,` after `available: PURCHASES_AVAILABLE,`. Then add `price` to the dependency array so it becomes `[isPro, debugProOverride, price]`.

- [ ] **Step 5: Render it on the paywall**

In `app-src/app/paywall.tsx`, destructure `price` from `usePro`:

```ts
  const { isPro, available, price, purchase, restore } = usePro();
```

Then change the price rendered in the button's `trailing` prop (currently `{t('paywall.price')}` at line 87) to:

```tsx
                  {price ?? t('paywall.price')}
```

- [ ] **Step 6: Typecheck and lint**

```bash
npm run typecheck && npm run lint
```

Expected: both clean.

- [ ] **Step 7: Run the full test suite**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 8: Verify the fallback renders in Expo Go**

```bash
npm run go
```

Open the app, go to Settings → the Supporter row, and open the sheet. In Expo Go, RevenueCat is excluded from the bundle, so `available` is false and `price` is null.

Expected: the button reads **Support** with **$2.99** beside it (the fallback copy), and both buttons are disabled. A blank beside the button is a failure — it means the fallback was not applied.

- [ ] **Step 9: Commit**

```bash
git add app-src/src/state/pro.tsx app-src/app/paywall.tsx
git commit -m "feat(paywall): show the price the store will actually charge

The sheet hardcoded \$2.99 while App Store Connect said \$4.99, and it was wrong
in every non-USD storefront regardless of which of those two was right. It now
renders RevenueCat's localised price, keeping the copy as a fallback for web,
for a failed fetch, and for the moment before the offering resolves."
```

---

### Task 8: Fill in the App Store id

**Files:**
- Modify: `app-src/src/lib/links.ts`

**Context:** `appStoreId` is deliberately empty so the Settings "Rate DoughMate" row stays hidden rather than opening a dead store page. The record now exists, so the id is known.

- [ ] **Step 1: Set the id**

In `app-src/src/lib/links.ts`, change line 16 from:

```ts
  appStoreId: '',
```

to:

```ts
  appStoreId: '6802765361',
```

- [ ] **Step 2: Typecheck and lint**

```bash
npm run typecheck && npm run lint
```

Expected: both clean.

- [ ] **Step 3: Verify the Rate row appears**

```bash
npm run go
```

Open Settings. The **Rate DoughMate** row must now be visible. Tapping it in Expo Go will not open the App Store — the listing is unreleased — but the row must render.

- [ ] **Step 4: Commit**

```bash
git add app-src/src/lib/links.ts
git commit -m "feat(settings): reveal the rate row now the store id exists

App id 6802765361. The row stayed hidden while this was empty so it could never
open a dead store page."
```

---

## Phase C — Build, verify, submit

### Task 9: Build and verify on device

**Prerequisite:** Tasks 1–8 complete, and `main` pushed.

- [ ] **Step 1: Check the pnpm config trap**

From `app-src/`:

```bash
node -e "require.resolve('babel-preset-expo'); require.resolve('react-native-worklets/plugin'); console.log('config packages resolve')"
```

Expected: `config packages resolve`. Anything else means the EAS build will fail with "Cannot read properties of undefined (reading 'transformFile')" after burning quota.

- [ ] **Step 2: Check expo-doctor**

```bash
npx expo-doctor
```

Expected: 21/21 checks pass.

- [ ] **Step 3: Check remaining build quota**

```bash
npx eas-cli build:list --platform ios --limit 5
```

Quota was exhausted on 2026-09-08 and should have reset. Confirm before spending it — this plan budgets for **one** build.

- [ ] **Step 4: Build**

```bash
npx eas-cli build --platform ios --profile production
```

The `production` profile sets `autoIncrement: true` and `environment: production`, so it picks up all three environment variables.

- [ ] **Step 5: Confirm the build used real values**

In the EAS build logs, confirm the environment section lists `EXPO_PUBLIC_REVENUECAT_KEY_IOS`, `EXPO_PUBLIC_ADMOB_APP_ID_IOS` and `EXPO_PUBLIC_ADMOB_BANNER_IOS`.

A build without the RevenueCat key produces an app whose Supporter buttons are permanently disabled. Stop here if it is missing.

- [ ] **Step 6: Submit to TestFlight**

```bash
npx eas-cli submit --platform ios --latest
```

- [ ] **Step 7: Create a Sandbox Apple ID**

In App Store Connect: **Users and Access → Sandbox → Test Accounts → +**. Use an email address not already associated with an Apple ID.

- [ ] **Step 8: Sign in to the sandbox account on the phone**

On the iPhone: **Settings → App Store → Sandbox Account** (near the bottom), and sign in with the tester.

Do **not** sign out of the real Apple ID in the main Settings screen. The sandbox slot is separate.

- [ ] **Step 9: Install from TestFlight and verify, in order**

Work through these and record each result:

1. **Ad banner renders.** It appears on a free-tier screen. **Do not tap it.**
2. **Price is correct.** Open the Supporter sheet. It reads **$2.99**, not $4.99. If it shows $4.99, RevenueCat has cached the old offering — force-close the app, relaunch, and re-check before investigating anything else.
3. **Purchase completes.** Tap Support, confirm with the sandbox account. A sandbox purchase shows an "[Environment: Sandbox]" label in the confirmation dialog.
4. **Entitlement unlocks.** Baker's percentages, the levain calculator, the recipe cost calculator, the full swap library, and unlimited recipes/starters/timers are all reachable.
5. **Ads stop.** The banner is gone.
6. **Restore works.** Delete the app, reinstall from TestFlight, open the Supporter sheet, tap **Restore purchases**. It re-unlocks without charging.
7. **AdMob sees traffic.** In the AdMob console, the banner unit shows a non-zero request count. This can lag by a few hours.

**Done when:** all seven verified. Any failure stops Task 10 — do not submit an unverified binary.

---

### Task 10: Submit for review

- [ ] **Step 1: Re-check App Privacy**

At `https://appstoreconnect.apple.com/apps/6802765361/distribution/privacy`, the declaration currently lists five data types: Device ID, Performance Data, Purchase History, Crash Data, Advertising Data.

`@sentry/react-native` and `posthog-react-native` were removed in `9d23042`, so confirm whether Google's Mobile Ads SDK still justifies **Crash Data** and **Performance Data**. Check Google's own disclosure at `https://developers.google.com/admob/ios/privacy/data-disclosure`. Withdraw either type it does not cover, so the privacy label is not scarier than reality.

If any change is made, click **Publish**.

- [ ] **Step 2: Confirm the Age Rating declares advertising**

**App Information → Age Rating**. Because the app ships an ad SDK, the advertising question must be answered **Yes**. Also answer the new social-media questions App Store Connect is flagging.

- [ ] **Step 3: Complete the 1.0 product page**

On the iOS 1.0 version page, fill in: description, keywords, support URL (`https://cremacious.github.io/doughmate/`), marketing URL if wanted, and iPhone screenshots.

The app is iPhone-only (`supportsTablet: false`), so no iPad screenshots are required.

- [ ] **Step 4: Attach the build**

In the **Build** section of the 1.0 version page, select the build from Task 9.

- [ ] **Step 5: Confirm the IAP is attached**

The **In-App Purchases and Subscriptions** section of the version page must list `Doughmate Pro`. The IAP is already in "Ready for Review", so it should attach automatically — confirm rather than assume. A first-version IAP that is not attached will not be reviewed, and the purchase will fail for real users on launch day.

- [ ] **Step 6: Add review notes**

In **App Review Information**, include the sandbox instructions:

> The Supporter upgrade is a one-time $2.99 non-consumable purchase, reachable from Settings → Supporter. No account or login is required to use any part of the app.

- [ ] **Step 7: Submit**

Click **Add for Review** → **Submit to App Review**.

- [ ] **Step 8: Update the tracking issues**

Close GitHub issues #14–#27 on `Cremacious/doughmate` that this plan completed, with a comment pointing at this plan.

**Done when:** the 1.0 version shows **Waiting for Review**.

---

## Post-submission

Record in memory once submitted: the submission date, the build number, and any review feedback. Update `/home/chris/Code/app-launch/README.md` with two gotchas this launch surfaced that it does not yet cover:

1. The Apple Developer Program License Agreement gets re-issued periodically and silently blocks new submissions until the Account Holder accepts it. Check for the banner before planning a submission.
2. The AdMob test-device-ID step assumes a Mac. The SDK prints the id to the native console, which is not readable from a TestFlight build on Linux. The fallback is to verify the banner visually and never tap it.

---

## Out of scope

- iCloud sync via `react-native-cloud-storage` — the last unbuilt feature from the 2026-08-20 Pro-expansion spec.
- Android production AdMob values. 1.0 is deliberately iOS-only.
- Reconciling `ingredientPrices.tsx` with the shared helpers in `src/lib/collection.ts`.
