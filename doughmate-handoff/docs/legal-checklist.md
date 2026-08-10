# Legal Checklist — Privacy Policy, Terms, Store Compliance

Rather than writing custom legal documents (which needs a lawyer), use Termly's generator. It's designed for app privacy policies and it produces store-compliant output. This guide gives you the answers to put in Termly's questionnaire.

## Privacy Policy via Termly

**URL:** termly.io/products/privacy-policy-generator

**Business info to enter:**
- Business name: Doughmate (or your legal name if sole prop)
- Contact email: hello@doughmate.app
- Website: doughmate.app
- Country: (yours)

**Declare data collection:**

### Personal information collected
- **None directly.** The app itself does not require account creation.
- **Purchase information** (indirect, via Apple/Google): user's Apple ID or Google account is used for IAP. Doughmate never sees the actual account.

### Third-party services that collect data

| Service | What it collects | Purpose | Linked to identity |
|---------|------------------|---------|---------------------|
| Google AdMob | Advertising ID (IDFA/AAID), device info, IP | Ad delivery + optional tracking (opt-in via ATT) | Yes (if user opts in) |
| RevenueCat | User's IAP receipts and Apple/Google IDs | Manage subscription entitlements | Yes |
| PostHog | Anonymized product usage events | Improve the app | No (anonymous) |
| Sentry | Crash reports (stack traces, device model, OS version) | Fix bugs | No (anonymous) |

### Data sharing
- Sold to third parties: NO
- Shared for advertising: only via AdMob if user opts in to tracking

### User rights
- Users can disable ads tracking via iOS Settings > Privacy & Security > Tracking, and Android equivalent
- Users can request data deletion by emailing hello@doughmate.app
- Users can opt out of analytics via Settings within the app

### Special populations
- Not directed at children under 13 (COPPA declaration)
- GDPR compliant for EU users (UMP consent required for ads)
- CCPA compliant for California users

**Output:** Termly generates a URL you host on doughmate.app/privacy. Copy the URL to submit in both app stores.

---

## Terms of Service via Termly

**URL:** termly.io/products/terms-and-conditions-generator

**Key points to include:**
- App provides baking calculation tools "as is"
- Ingredient conversions and substitutions are informational, not medical or allergy advice
- Users are responsible for their own baking outcomes
- IAP purchases are non-refundable except per Apple/Google policy
- Doughmate may update or discontinue the app
- Disputes handled per your jurisdiction

**Output:** Host at doughmate.app/terms.

---

## App Store Connect — Privacy Details

Apple requires a "Privacy Nutrition Label" for every app. Answer as follows:

### Data collection

**Contact Info:** Not collected.
**Health & Fitness:** Not collected.
**Financial Info:** Not collected.
**Location:** Not collected.
**Sensitive Info:** Not collected.
**Contacts:** Not collected.
**User Content:** Not collected (recipes and starters are stored locally).
**Browsing History:** Not collected.
**Search History:** Not collected.
**Identifiers:**
- Device ID (IDFA): YES, if user opts in via ATT. Used for third-party advertising.
- User ID: YES, RevenueCat's anonymous user ID. Used for app functionality.
**Purchases:** YES. Purchase history via RevenueCat. Used for app functionality (unlocking Pro).
**Usage Data:** YES (product interaction). Used for analytics (improving the app), not for tracking. Anonymous.
**Diagnostics:** YES (crash data via Sentry). Used for app functionality (fixing bugs). Anonymous.

### Data uses per type
- Third-party advertising: only IDFA (opt-in)
- App functionality: User ID, Purchases
- Analytics: Usage Data (anonymous, not linked to user)
- Product personalization: none

### Tracking (ATT prompt)
- YES, the app uses tracking via AdMob. Show custom pre-prompt per plan doc.

---

## Google Play — Data Safety form

Google's equivalent of Apple's privacy label. Similar answers:

**Data collected:**
- Ads data: Yes, encrypted in transit, user can request deletion. Shared with third parties (AdMob).
- Purchase history: Yes, encrypted in transit. Not shared with third parties (used only for entitlements).
- Diagnostics: Yes (crashes), anonymous. Not shared.
- Product interactions: Yes, anonymous. Not shared.

**Security practices:**
- Data encrypted in transit: YES (all API calls over HTTPS)
- Users can request data deletion: YES (via hello@doughmate.app)
- Follows Google Play Families policy: Not applicable (not a kids app)

---

## Content ratings

**Apple:** 4+ (no violence, no gambling, no drugs, no adult content, no unrestricted web access)

**Google Play:** Everyone (same reasoning, use IARC questionnaire in Play Console — every answer will be "No")

---

## Trademark check for "Doughmate"

Do this BEFORE announcing publicly:

1. **USPTO TESS:** tsdr.uspto.gov — search "doughmate" and variants like "dough mate"
2. **App Store search:** search "doughmate" in the Apple App Store on your phone
3. **Google Play search:** same in Google Play Store
4. **Google search:** "doughmate" + related terms like app, baking, calculator
5. **Domain check:** whether `.com`, `.app`, `.co` variants are taken (mostly informational)

If TESS shows an existing trademark in a related class (International Class 9 for software, or 41 for education/entertainment), consult a trademark attorney before proceeding. If clear, consider filing for your own trademark once revenue justifies it (~$250-350 DIY at USPTO, ~$1,500 with a lawyer).

---

## Copyright on Sam

Sam is a character. Once the Fiverr animator delivers with full commercial rights (per `docs/fiverr-brief-sam.md`), you own the character. Add a small © notice in the app's Credits screen:

> Sam and Doughmate © 2026 [Your Name]. All rights reserved.

## Third-party licenses

Include an "Open source licenses" screen in Settings > About. Both stores appreciate it and it's required by some library licenses (MIT, Apache, etc.). Expo has a built-in helper to generate this.
