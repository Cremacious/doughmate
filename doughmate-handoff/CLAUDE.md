# Doughmate — Auto-loaded Context

You are helping build **Doughmate**, a React Native + Expo mobile baking calculator with a cozy sourdough loaf mascot named Sam. Ships to iOS and Android from one codebase.

## THE ONE HARD RULE

**Never use hyphens or dashes in any app-facing text. Ever.**

Not in Sam's dialogue, not in button labels, not in error messages, not in App Store copy, not in any string that ends up in the user interface. Rewrite around them every time.

Examples of transformations:
- "one-time purchase" → "single purchase" or "buy once"
- "cup-to-gram" → "cups to grams"
- "long-rise bread" → "slow rise"
- "home-screen widget" → "home screen widget"
- "all-in-one" → "everything you need"

**Scope of the rule:** applies to user-facing text only (UI copy, i18n strings, notifications, marketing content, App Store description). Regular code (variable names, comments, technical docs like this file) can use hyphens as normal.

## Tech stack (locked, do not change)

- Framework: React Native + Expo SDK 52+
- Language: TypeScript, strict mode
- Package manager: pnpm
- Navigation: Expo Router (file-based, four bottom tabs with Sam floating above)
- Animations: react-native-reanimated 3 (spring physics)
- Character animation: lottie-react-native (files coming from Fiverr, use src/assets/sam.svg as placeholder)
- Storage: react-native-mmkv
- IAP: RevenueCat via react-native-purchases
- Ads: react-native-google-mobile-ads (AdMob)
- Analytics: posthog-react-native
- Crash reporting: @sentry/react-native
- i18n: react-i18next
- Haptics: expo-haptics

## Key files in this handoff bundle

- `plan/doughmate-plan.html` — Full strategic plan (17 sections). Open in browser to view. Read specific sections when relevant (Design Depth for UI, Product Depth for behavior, Micro Decisions for edge cases).
- `data/*.json` — Content databases ready to import into src/data/ of the Expo project
- `src/theme.ts` — Complete design tokens (colors, typography, spacing, radius, shadow, spring configs, haptic map)
- `src/i18n/en.json` — Every user-facing string, organized by feature
- `src/assets/sam.svg` — Master Sam vector, placeholder before Lottie files arrive
- `docs/sam-voice-style-guide.md` — Read before writing ANY user-facing text
- `docs/dev-environment.md` — Setup instructions (Node, packages, ESLint, git)
- `docs/accounts-checklist.md` — Every service to sign up for
- `docs/legal-checklist.md` — Termly setup, store compliance answers
- `docs/fiverr-brief-sam.md` — Ready to paste brief for the character animator
- `docs/content-calendar.md` — 28 days of pre-launch social posts
- `docs/landing-page-copy.md` — doughmate.app one-pager copy

## Target project structure (create this in the Expo project)

```
doughmate/
├── app/                              # Expo Router
│   ├── _layout.tsx                   # Root: theme, i18n, Sentry init
│   ├── onboarding/
│   │   ├── welcome.tsx
│   │   ├── features.tsx
│   │   └── notifications.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Tab bar with Sam persistent above
│   │   ├── convert/
│   │   │   ├── index.tsx             # Main converter
│   │   │   ├── pan.tsx
│   │   │   ├── oven.tsx
│   │   │   ├── yeast.tsx
│   │   │   ├── egg.tsx
│   │   │   ├── butter.tsx
│   │   │   └── substitutions.tsx
│   │   ├── recipes/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── new.tsx
│   │   ├── starters/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── new.tsx
│   │   └── settings/
│   │       ├── index.tsx
│   │       ├── appearance.tsx
│   │       ├── preferences.tsx
│   │       ├── notifications.tsx
│   │       ├── pro.tsx
│   │       └── about.tsx
│   ├── paywall.tsx                   # Modal
│   ├── shop.tsx                      # Modal, cosmetics
│   └── splash.tsx
├── src/
│   ├── theme.ts
│   ├── i18n/en.json (+ future locales)
│   ├── assets/                       # sam.svg, lottie/, icons/
│   ├── data/                         # ingredients.json, yeast.json, etc.
│   ├── components/                   # Button, Input, Card, Sam, ...
│   ├── screens/                      # Screen-specific components
│   └── lib/                          # convert.ts, storage.ts, analytics.ts
```

## Design tokens (import from src/theme.ts, never hardcode)

Palette highlights: cream #FBF5EA background, crust #C9975B primary, jam #E36A6A CTA, chocolate #4A3728 text. Full palette (including dark mode) in theme.ts.

Springs: **only three named** — `spring.quick`, `spring.medium`, `spring.soft`. Never invent one-off values.
Haptics: **only five named** — `haptic.tap`, `haptic.select`, `haptic.pop`, `haptic.success`, `haptic.warning`.

## Sam's voice (see docs/sam-voice-style-guide.md for full)

Warm, patient, quietly enthusiastic. Short sentences. Contractions freely. Never uses corporate words (leverage, optimize, seamless). Never says "sorry" — says "hmm" instead. Uses baking metaphors when natural. Addresses user as "you." Under 20 words per Sam dialogue line.

## Build order (from plan section 6, 4-week roadmap)

**Week 1:** Design system + navigation shell + core conversion engine + secondary tools
**Week 2:** Sam Lottie integration + micro animations + widgets + AdMob + RevenueCat
**Week 3:** Internal QA + TestFlight/Play beta with recruited testers + iterate
**Week 4:** Store assets + submission + marketing prep + launch

## Non-negotiables during development

- Every user-facing string routes through `t('key.path')`, never hardcoded
- Every color/spacing/font consumes from `theme.ts`, never hardcoded
- Every animation uses one of the three named springs
- Every haptic uses one of the five named types
- Every new copy string checked against `docs/sam-voice-style-guide.md`
- Reduced motion setting honored on every animation
- Dark mode supported on every screen
- No hyphens in app copy, ever

## When to ask the user

Ask before:
- Changing any locked product decision (feature scope, monetization, stack)
- Introducing a new dependency not in the tech stack list
- Making a UX choice that contradicts the design depth section of the plan
- Any content that could be legally sensitive (allergy claims, medical advice)

Do not ask before:
- Small UX details already covered in plan section 16 (Micro Decisions)
- Implementation approaches for locked features
- Refactoring code you wrote for cleanliness

## Testing

- Jest for the conversion engine (100% coverage target on pure math functions)
- Manual QA checklist in `docs/dev-environment.md` before every beta release
- No E2E tests in v1 (too much overhead for solo dev)
