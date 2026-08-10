# Accounts Checklist

Every service you need to sign up for. Ordered so nothing blocks the next thing. Aim to do all of this in one focused afternoon during Week 0 (the week before you write code).

## Priority 1 — Do these first (they gate other things or have delays)

### Apple Developer Program
- **URL:** developer.apple.com/programs/enroll
- **Cost:** $99/year
- **Time:** 15 min to apply, up to 48 hours to approve
- **Notes:** Individual account is fine to start. LLC later if you want liability separation.
- **Need before:** submitting to App Store, TestFlight

### Google Play Console
- **URL:** play.google.com/console/signup
- **Cost:** $25 one-time
- **Time:** 10 min, usually instant approval
- **Notes:** Individual account works. Requires payment profile setup.
- **Need before:** internal testing, Play Store submission

### Domain (doughmate.app)
- **URL:** namecheap.com or cloudflare.com
- **Cost:** ~$25/year for `.app` domain
- **Time:** 5 min
- **Notes:** Requires HTTPS by default (`.app` is on HSTS preload list, good for security). Verify trademark search is clear first.

### GitHub (or your git host)
- **URL:** github.com
- **Cost:** Free (private repos included)
- **Time:** 5 min
- **Notes:** Set up a new private repo called `doughmate`. Enable branch protection on main.

---

## Priority 2 — App infrastructure

### AdMob (Google)
- **URL:** admob.google.com
- **Cost:** Free
- **Time:** 10 min signup, 1-2 days for app IDs after you register the app
- **Notes:** You'll need this to generate iOS and Android ad unit IDs. Ad units for banner + interstitial.
- **Need before:** first ad shows

### RevenueCat
- **URL:** revenuecat.com
- **Cost:** Free up to $2,500/month revenue
- **Time:** 15 min setup, plus 30 min to configure products
- **Notes:** Handles all IAP complexity for iOS + Android. Set up product IDs for Pro ($4.99), Remove Ads ($2.99), and initial themes ($1.99 each).
- **Need before:** IAP works in production

### PostHog
- **URL:** posthog.com
- **Cost:** Free up to 1M events/month
- **Time:** 10 min
- **Notes:** Create project, get API key. Use for the analytics event taxonomy in the plan.
- **Need before:** first analytics event fires

### Sentry
- **URL:** sentry.io
- **Cost:** Free tier is generous (10k events/month)
- **Time:** 10 min
- **Notes:** Create separate projects for iOS and Android. Get DSN strings for both.
- **Need before:** first crash needs to be tracked

---

## Priority 3 — Business & communication

### Email forwarding (hello@doughmate.app)
- **URL:** Cloudflare Email Routing (if domain on Cloudflare) or ImprovMX
- **Cost:** Free
- **Time:** 10 min
- **Notes:** Forward `hello@` and `support@` to your personal inbox.

### Termly (or iubenda)
- **URL:** termly.io
- **Cost:** Free tier works for launch (Basic plan)
- **Time:** 30 min to fill out privacy policy questionnaire
- **Notes:** Required for both app stores. See `docs/legal-checklist.md` for what to declare.
- **Need before:** app store submission

### Bank account or payment routing
- **Options:** Personal bank (fine for sole prop), or Mercury / Wise (for LLC)
- **Cost:** Free for basic accounts
- **Time:** Personal 5 min, LLC accounts 1-3 days
- **Notes:** Apple and Google need somewhere to send your revenue. Personal works if sole prop. Do LLC path if you want liability separation (~month 3+).

---

## Priority 4 — Marketing

### TikTok, Instagram, Threads, X handles
- **URL:** each platform
- **Cost:** Free
- **Time:** 5 min each
- **Notes:** Register `@doughmate.app` (or `@doughmateapp` if the dot isn't allowed) on all four. Consistent bio: "The baking calculator with a heart. Meet Sam."
- **Need before:** first pre-launch post

### Vercel account (for landing page)
- **URL:** vercel.com
- **Cost:** Free
- **Time:** 5 min
- **Notes:** Deploy the doughmate.app landing page here. Free custom domain support.

### Fiverr account
- **URL:** fiverr.com
- **Cost:** Free (pay per gig)
- **Time:** 5 min
- **Notes:** Set up billing method. Search for Lottie animator ~ Week 1 of dev, using the brief in `docs/fiverr-brief-sam.md`.

---

## Priority 5 — Nice to have, not urgent

### App Store Connect app record
- **URL:** appstoreconnect.apple.com
- **Cost:** Included with Developer Program
- **Time:** 15 min
- **Notes:** Create app record early (before code done) so you can start filling metadata, screenshots, description. Bundle ID typically `app.doughmate.mobile`.

### Google Play Console app record
- Same idea, do early to prep metadata

### Google UMP consent SDK
- Configured within AdMob console for EU users. Do during Week 2 of dev.

---

## The afternoon checklist (for your Week 0)

Copy this into a text file, check off as you go:

```
[ ] Apple Developer Program
[ ] Google Play Console
[ ] Domain: doughmate.app
[ ] GitHub repo: doughmate (private)
[ ] AdMob account
[ ] RevenueCat account + product IDs configured
[ ] PostHog project + API key noted
[ ] Sentry iOS + Android projects + DSNs noted
[ ] Email forwarding: hello@doughmate.app
[ ] Termly Privacy Policy filled out
[ ] Vercel account
[ ] Fiverr account with billing
[ ] TikTok / Instagram / Threads / X handles registered
[ ] App Store Connect app record created
[ ] Google Play Console app record created
```

Total time: 3-4 hours if you focus. Don't spread it across multiple days.

## Save these somewhere (a `secrets.md` file in a password manager)

- Apple team ID + Apple ID email
- Google Play API access JSON key
- AdMob app IDs (iOS + Android) and ad unit IDs
- RevenueCat public SDK keys (iOS + Android)
- PostHog API key
- Sentry DSN strings (iOS + Android)
- Any Fiverr order confirmation numbers

**Never commit these to git.** Use EAS Secrets (`eas secret:create`) for anything that needs to be in the app build.
