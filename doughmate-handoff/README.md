# Doughmate — Planning Bundle

Everything decided, documented, and ready for build. This bundle is the complete handoff from planning to development.

## Start here

1. Read `HANDOFF.md` for step-by-step instructions on starting your Claude Code session
2. Open `plan/doughmate-plan.html` in a browser to view the full plan (17 sections, visually designed)
3. Skim `CLAUDE.md` (auto-loaded by Claude Code, but worth reading yourself)

## What's in this bundle

```
doughmate-handoff/
├── README.md                          You are here
├── CLAUDE.md                          Auto-loaded context for Claude Code
├── HANDOFF.md                         Instructions to start dev
│
├── plan/
│   └── doughmate-plan.html            The complete strategic plan (17 sections)
│
├── data/                              Content databases, ready to import
│   ├── ingredients.json               47 baking ingredients with densities
│   ├── yeast.json                     Active dry / instant / fresh conversions
│   ├── eggs.json                      Egg sizes and weights
│   ├── pans.json                      Common pans, areas, scaling formulas
│   └── substitutions.json             18 free-tier substitutions
│
├── src/                               Code-ready artifacts
│   ├── theme.ts                       Design tokens (colors, typography,
│   │                                  spacing, radius, shadow, springs, haptics)
│   ├── i18n/en.json                   Every string in the app
│   └── assets/sam.svg                 Master Sam vector (placeholder before Lottie)
│
└── docs/                              Operational references
    ├── sam-voice-style-guide.md       How Sam sounds (read before writing copy)
    ├── fiverr-brief-sam.md            Character animator brief, ready to paste
    ├── content-calendar.md            28 days of pre-launch social posts
    ├── landing-page-copy.md           doughmate.app one-pager
    ├── accounts-checklist.md          Every service to sign up for
    ├── legal-checklist.md             Termly setup, store compliance
    └── dev-environment.md             Node, packages, git conventions
```

## The order to work

**Week 0 (this week):**
1. Trademark check for "Doughmate" — 10 min at USPTO TESS + App Store + Play Store
2. Register `doughmate.app` domain + social handles (@doughmate.app on TikTok, Instagram, Threads, X)
3. Follow `docs/accounts-checklist.md` — one focused afternoon for all accounts
4. Order Sam on Fiverr using `docs/fiverr-brief-sam.md`
5. Post Day 1 of `docs/content-calendar.md` on TikTok

**Week 1 Day 1:**
Follow `HANDOFF.md` and start Claude Code.

**Weeks 1-4:**
Follow the roadmap in `plan/doughmate-plan.html` section 6.

## What this bundle does NOT include

- **Actual Lottie animation files** — arriving from Fiverr per the brief
- **Real app icon** — Fiverr order
- **App screenshots** — captured once the app runs
- **Full Privacy Policy text** — Termly generates from your answers
- **Any custom code** — Claude Code writes that with you starting Week 1

## Planning is done

Every locked decision is in `plan/doughmate-plan.html`. Every operational reference is in `docs/`. Every content database is in `data/`. Every design token is in `src/theme.ts`. Every string is in `src/i18n/en.json`. Sam is in `src/assets/sam.svg`.

You have more planning than most indie devs ever do before shipping. Now go build.

— Sam
