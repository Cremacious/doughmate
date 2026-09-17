# DoughMate 1.0 — Production Launch

**Date:** 2026-09-17
**Goal:** Get DoughMate 1.0 submitted to the App Store with a working $2.99 one-time
Supporter purchase and a live ad banner.

---

## Verified starting state

Everything below was confirmed directly (App Store Connect, RevenueCat, the EAS
environment, and the repo) on 2026-09-17. It supersedes GitHub issues #14–#27,
which are stale.

### Done already

| Area | State |
|---|---|
| Agreements, Tax & Banking | Paid Apps Agreement **Active** (Aug 17 2026 – Aug 17 2027); Truist Bank (7578) USD **Active**; U.S. Form W-9 **Active** |
| App Store record | Exists. Listing name **"DoughMate: Baker's Companion"**, App ID **`6802765361`**, iOS 1.0 Prepare for Submission |
| In-app purchase | Exists. `com.cremacious.doughmate.pro`, Non-Consumable, Apple ID `6802774060`, all 175 countries, base USD, already Added for Review |
| App Privacy | Answered. Policy URL `https://cremacious.github.io/doughmate/`; 5 data types declared (Device ID, Performance Data, Purchase History, Crash Data, Advertising Data) |
| AdMob | Real iOS values already in EAS `production`: app id `ca-app-pub-7097735764007585~1861819491`, banner unit `ca-app-pub-7097735764007585/7227339586` |
| Repo | `main` clean and in sync with `origin` at `2785cbd` |

Note: the listing name is **"Baker's Companion"**, not "Baking Calculator" as the
project notes recorded.

### Not done

| Area | State |
|---|---|
| Apple Developer Program License Agreement | **Updated version unaccepted — blocks submitting new apps** |
| IAP price | **$4.99**, must become **$2.99** |
| RevenueCat | **Nothing exists.** The only project on the account is "Picross Cryptids" |
| `EXPO_PUBLIC_REVENUECAT_KEY_IOS` | Absent from every EAS environment (`development` and `preview` are entirely empty) |
| Device verification | No build installed; purchase, restore and banner all unverified on hardware |

### Code defects blocking a sane 1.0

1. **The production paywall is unusable.** With no RevenueCat key,
   `PURCHASES_AVAILABLE` is false (`src/lib/purchases.native.ts:14`), so
   `app/paywall.tsx:77` disables both the buy and the restore buttons. A
   production build today ships a Supporter sheet nobody can buy from.
2. **The price is a hardcoded string.** `src/i18n/en.json:445` is `"price": "$2.99"`,
   rendered directly at `app/paywall.tsx:87`. It contradicts the store today, and
   is wrong in every non-USD storefront regardless of what the store says.
3. **`purchasePro` buys `availablePackages[0]`** (`src/lib/purchases.native.ts:44`),
   so the order of packages in the offering decides what gets charged.
4. **`LINKS.appStoreId` is empty** (`src/lib/links.ts:16`), which keeps the
   Settings "Rate DoughMate" row hidden.

---

## Decisions

**The paywall reads its price from RevenueCat.** The sheet fetches the current
offering and renders the package's localized price string, falling back to the
existing `paywall.price` copy if the offering has not resolved. Chosen over
hardcoding because it is self-correcting — changing the tier in App Store
Connect changes the app — and because it is the only option that is correct
outside the US.

**Scope is launch blockers only.** The four defects above and nothing else. A
broader production audit was considered and rejected: it risks churn immediately
before submission, and the app has already been through a readiness pass
(`5de418d`, `3730099`, `4fd140b`).

**One build serves all device verification.** Sandbox purchases work in
TestFlight, so a single production build verifies the purchase, the restore and
the ad banner — and the binary that was tested is the binary that ships. This
matters because EAS build quota is limited and was exhausted as recently as
2026-09-08.

**The AdMob test-device ID step is deliberately skipped.** The playbook at
`/home/chris/Code/app-launch/README.md` calls for capturing the SDK-printed test
device ID so real ad units serve test ads on your own phone. That ID is printed
to the native console, which cannot be read from a TestFlight build without a
Mac. The mitigation is to verify the banner renders and never tap it. This is a
knowing tradeoff, not an oversight.

---

## Human-only steps

These are not delegated, for cause:

- **Accepting the updated Developer Program License Agreement.** A legal
  agreement binding Chris personally.
- **Generating and uploading the In-App Purchase Key (`.p8`).** A private
  signing key. Chris downloads it from App Store Connect and uploads it to
  RevenueCat directly.

The RevenueCat `appl_…` key is a *publishable* SDK key, not a secret, and may be
handled normally.

---

## Plan

### Phase 0 — Unblock

Chris accepts the updated Apple Developer Program License Agreement at
`developer.apple.com/account`. Blocks every later phase.

### Phase 1 — Price

In App Store Connect, change `com.cremacious.doughmate.pro` from $4.99 to
**$2.99** US, base country USD, allowing Apple's automatic conversion for the
other 174 storefronts. A price change on an unreleased IAP does not trigger
re-review.

**Done when:** the Current Price table reads $4.99 → $2.99 for United States (USD).

### Phase 2 — RevenueCat

1. Create a new RevenueCat project for DoughMate.
2. Add an App Store app with bundle ID `com.cremacious.doughmate`.
3. Chris generates the In-App Purchase Key in App Store Connect
   (Users and Access → Integrations → In-App Purchase) and uploads the `.p8`
   along with its Key ID and Issuer ID.
4. Create entitlement **`pro`** — must match `PRO_ENTITLEMENT` in
   `src/lib/purchases.types.ts:9` exactly.
5. Create product `com.cremacious.doughmate.pro` under the App Store app (not
   the Test Store) and attach it to the `pro` entitlement.
6. Edit the existing `default` offering — do not create a new one — to hold one
   **Lifetime** package pointing at that product.
7. Copy the `appl_…` public SDK key into EAS `production` as
   `EXPO_PUBLIC_REVENUECAT_KEY_IOS`.

**Done when:** `eas env:list --environment production` shows the key, and the
RevenueCat product shows as attached to the `pro` entitlement inside the
`default` offering.

### Phase 3 — Code

1. **Price from RevenueCat.** Extend the purchases layer with a function that
   returns the current offering's Lifetime package and its localized price
   string. Surface it through `usePro`. `app/paywall.tsx` renders that string,
   falling back to `t('paywall.price')` while it is unresolved or unavailable.
   The web stub returns null so web behaviour is unchanged.
2. **Match by product identifier.** `purchasePro` selects the package whose
   `product.identifier` is `com.cremacious.doughmate.pro` rather than taking
   `availablePackages[0]`, and returns the existing `no_offering` error when no
   package matches.
3. **`appStoreId`.** Set to `'6802765361'` in `src/lib/links.ts`.
4. Confirm `PURCHASES_AVAILABLE` resolves true under the production environment.

**Done when:** `tsc --noEmit`, ESLint, and the Jest suite all pass, with unit
coverage for product-ID matching and for the price fallback path.

### Phase 4 — Build and verify

Production build via EAS, `eas submit` to TestFlight, then on device:

- The ad banner renders. **Do not tap it.**
- A sandbox Apple ID completes the purchase, and the sheet shows **$2.99**.
- The `pro` entitlement unlocks the gated features.
- The ad banner disappears after purchase.
- Delete, reinstall, and Restore Purchases re-unlocks.
- AdMob console shows a non-zero ad request count.

**Done when:** all six verified on hardware.

### Phase 5 — Submit

- Re-check App Privacy. It currently declares Crash Data and Performance Data,
  but `@sentry/react-native` and `posthog-react-native` were removed in
  `9d23042`. Confirm the Google Mobile Ads SDK still justifies those two, and
  withdraw them if it does not, so the privacy label is not scarier than reality.
- Confirm Age Rating declares advertising.
- Complete the 1.0 product page: screenshots, description, keywords, support URL.
- Attach the build and the IAP to the 1.0 version; submit for review.

---

## Risks

| Risk | Mitigation |
|---|---|
| EAS build quota exhausted again | Verify remaining quota before Phase 4; the single-build strategy exists for this reason |
| Entitlement or product ID typo | Both are asserted character-for-character against the source files in Phase 2; a mismatch means purchases succeed and nothing unlocks |
| Accidentally tapping a live ad | Banner is verified visually only; never tapped |
| Price change not propagating to a cached offering | RevenueCat caches offerings; force-close and relaunch before reading the price on device |

---

## Follow-ups (explicitly out of scope for 1.0)

- iCloud sync via `react-native-cloud-storage` — the last unbuilt feature from
  the 2026-08-20 Pro-expansion spec.
- Android production AdMob values. 1.0 is deliberately iOS-only.
- Reconciling `ingredientPrices.tsx` with the shared helpers in
  `src/lib/collection.ts`.
