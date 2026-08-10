# Doughmate — Claude Code Handoff

Everything you need to hand off this project to Claude Code and start building.

## Setup (5 minutes)

1. Extract this zip somewhere sensible on your machine (e.g., `~/projects/doughmate`)
2. Open your terminal, `cd` into that folder
3. Start Claude Code in that folder: `claude` (or however you launch it)
4. Claude Code will auto-load `CLAUDE.md` — it now has all essential context

## Your first message to Claude Code

Copy and paste this verbatim as your first prompt:

---

```
I'm building Doughmate, a React Native + Expo mobile baking calculator with a
sourdough loaf mascot named Sam. All planning is complete — every decision is
documented in this repo.

Please start by reading these files in order:
1. CLAUDE.md (if you haven't already auto-loaded it)
2. docs/sam-voice-style-guide.md (critical: the no-hyphens voice rule)
3. docs/dev-environment.md (setup approach)
4. src/theme.ts (design tokens you'll consume)
5. src/i18n/en.json (all user-facing strings)

Then open plan/doughmate-plan.html section 6 to see the 4-week roadmap.

Today is Week 1 Day 1. Please:

1. Verify my dev environment is ready (Node 20 LTS, pnpm, Xcode, Android Studio,
   Expo CLI, EAS CLI). If anything's missing, tell me what to install first
   before you proceed.

2. Scaffold the Expo project in a new folder called 'app-src' inside this repo
   using: pnpm create expo app-src --template blank-typescript

3. Configure it: install all dependencies from docs/dev-environment.md, set up
   Expo Router, set up strict TypeScript, add ESLint + Prettier configs.

4. Copy the following files into the new project:
   - src/theme.ts → app-src/src/theme.ts
   - src/i18n/en.json → app-src/src/i18n/en.json
   - src/assets/sam.svg → app-src/src/assets/sam.svg
   - data/*.json → app-src/src/data/

5. Wire up i18n so t('app.name') returns 'Doughmate' anywhere in the code.

6. Build the shell: four bottom tabs (Convert, Recipes, Starters, Settings)
   using Expo Router. Sam SVG floating above the tab bar as a shared element.

7. Confirm it runs by launching in the iOS simulator. Show me a screenshot.

Ask me any clarifying questions before starting. When in doubt, refer to the
plan doc — every locked decision is in there.
```

---

## After Day 1

Continue through the roadmap in plan section 6. Each day of the plan is a
natural conversation with Claude Code. Reference the plan doc, the starter
kit, and the voice guide constantly.

## Reference index

When you (or Claude Code) need to look something up:

| Question | Look here |
|----------|-----------|
| What's the overall strategy? | `plan/doughmate-plan.html` (open in browser) |
| How should Sam sound? | `docs/sam-voice-style-guide.md` |
| What color/font/spacing? | `src/theme.ts` |
| What text should this button say? | `src/i18n/en.json` |
| How many grams in a cup of flour? | `data/ingredients.json` |
| How much yeast do I substitute? | `data/yeast.json` |
| What pan can I swap for a 9" round? | `data/pans.json` |
| What accounts do I need? | `docs/accounts-checklist.md` |
| How do I set up Privacy Policy? | `docs/legal-checklist.md` |
| What's my next social post? | `docs/content-calendar.md` |
| How do I brief the Sam animator? | `docs/fiverr-brief-sam.md` |
| What copy goes on doughmate.app? | `docs/landing-page-copy.md` |
| Node version, git conventions? | `docs/dev-environment.md` |
| A specific edge case? | `plan/doughmate-plan.html` section 16 |

## Rules for Claude Code (from CLAUDE.md, repeated here for emphasis)

**Never** use hyphens or dashes in user-facing text. Ever.
**Always** consume design tokens from `src/theme.ts`, never hardcode.
**Always** use `t('key.path')` for user-facing strings, never hardcode.
**Only** use the three named springs (quick, medium, soft) for animations.
**Only** use the five named haptics (tap, select, pop, success, warning).
**Always** honor reduced motion setting on every animation.
**Always** support dark mode from day one.

## When Claude Code proposes a change you didn't expect

Ask: "Is this a locked decision in the plan doc?" If yes, refer back to it.
If the plan is genuinely ambiguous, decide together and I recommend updating
the plan doc so it stays the source of truth.

## Good luck

You've done more planning than most solo indie devs ever do. Now go make Sam
real. He's waiting.
