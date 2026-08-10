# Doughmate

A cozy mobile baking calculator with a sourdough loaf mascot named Sam. Convert
ingredients between volume and weight, scale recipes, and keep your starter fed.
React Native + Expo, shipping to iOS and Android from one codebase.

## Layout

- **`app-src/`** — the Expo application (the code that ships).
- **`doughmate-handoff/`** — planning and reference material: the strategic plan,
  Sam's voice guide, design tokens and string sources, content data, and
  operational checklists. Source of truth for decisions.

## Working in the app

```bash
cd app-src
pnpm install
pnpm start        # or: pnpm web, pnpm ios, pnpm android
pnpm test         # conversion engine unit tests
pnpm typecheck
pnpm lint
```

See `app-src` and `doughmate-handoff/CLAUDE.md` for the house rules (no hyphens in
user facing copy, design tokens only, strings via i18n, dark mode everywhere).
