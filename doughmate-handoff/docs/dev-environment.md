# Dev Environment Setup

Everything you need on your machine before day one of coding.

## Prerequisites

### Node.js
- **Version:** Node 20 LTS
- **Install via:** [Volta](https://volta.sh) (recommended) or [nvm](https://github.com/nvm-sh/nvm)
- **Verify:** `node --version` shows `v20.x.x`

Volta is preferred because it auto-switches Node versions per project (defined in package.json `engines` field).

### Package manager
- **Choice:** `pnpm` (fastest, best for React Native)
- **Install:** `npm install -g pnpm` after Node is set up
- **Verify:** `pnpm --version`

### Git
- Install from git-scm.com if not already installed
- **Config:**
  ```
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  git config --global init.defaultBranch main
  git config --global pull.rebase true
  ```

### Editor
- **VS Code** or **Cursor** (Cursor is VS Code with AI baked in — recommended)
- **Extensions to install:**
  - ES7+ React/Redux/React-Native snippets
  - ESLint
  - Prettier
  - Expo Tools
  - TypeScript and JavaScript Language Features (built-in)
  - GitLens
  - Pretty TypeScript Errors

### Watchman (macOS only)
- Required by React Native for file watching
- Install: `brew install watchman`

### Xcode (macOS only, for iOS)
- Install from Mac App Store (~40 GB, take an evening)
- Also install: Command Line Tools (`xcode-select --install`)
- Simulators: install at least iPhone 15 Pro and iPhone SE (2nd gen) for size testing

### Android Studio (all platforms, for Android)
- Install from developer.android.com/studio
- Install: Android SDK Platform 34, Android SDK Build-Tools, Android Virtual Device
- Create AVD: Pixel 7 with Android 14 (API 34) is a good default

### Expo CLI + EAS CLI
- `pnpm install -g expo eas-cli`
- Log in: `eas login` (uses your Expo account, sign up at expo.dev)

---

## Project setup

Once accounts are created, from the doughmate repo root:

```bash
# Create Expo project
pnpm create expo doughmate --template blank-typescript

cd doughmate

# Install core dependencies
pnpm install \
  expo-router \
  react-native-reanimated \
  lottie-react-native \
  expo-haptics \
  expo-audio \
  react-native-mmkv \
  react-native-google-mobile-ads \
  react-native-purchases \
  posthog-react-native \
  @sentry/react-native \
  react-i18next \
  i18next

# Copy the starter kit files into the right places
mkdir -p src/data src/i18n src/assets
cp path/to/starter-kit/data/*.json src/data/
cp path/to/starter-kit/src/theme.ts src/
cp path/to/starter-kit/src/i18n/en.json src/i18n/
cp path/to/starter-kit/src/assets/sam.svg src/assets/

# Initial commit
git init
git add .
git commit -m "chore: initial scaffold"
```

## Code style

### TypeScript
Set `tsconfig.json` to strict mode:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint
Use Expo's default ESLint config with a couple of additions:
```bash
pnpm install --save-dev eslint-config-expo eslint-plugin-react-hooks
```

`.eslintrc.js`:
```js
module.exports = {
  extends: ['expo'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### Prettier
`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

Install VS Code Prettier extension, enable "Format on Save".

---

## Environment variables

Never commit AdMob keys, Sentry DSNs, RevenueCat keys, or PostHog keys.

**Local dev:** create `.env.local` (add to `.gitignore`):
```
EXPO_PUBLIC_ADMOB_APP_ID_IOS=ca-app-pub-xxx
EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=ca-app-pub-xxx
EXPO_PUBLIC_REVENUECAT_KEY_IOS=appl_xxx
EXPO_PUBLIC_REVENUECAT_KEY_ANDROID=goog_xxx
EXPO_PUBLIC_POSTHOG_KEY=phc_xxx
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN_IOS=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN_ANDROID=https://xxx@xxx.ingest.sentry.io/xxx
```

**Production builds:** use EAS Secrets:
```bash
eas secret:create --scope project --name SENTRY_DSN_IOS --value "https://..."
```

Variables prefixed `EXPO_PUBLIC_` get bundled into the app. Anything sensitive (Sentry DSN, though DSNs are technically public) uses EAS Secrets.

---

## Git conventions

### Branch naming
- `feat/description` — new feature
- `fix/description` — bug fix
- `chore/description` — tooling, refactor, docs
- `wip/description` — work in progress

### Commit messages (Conventional Commits)
```
feat: add pan converter screen
fix: correct yeast ratio for fresh yeast
chore: bump expo to sdk 52
docs: update README with account list
refactor: extract conversion engine to pure module
```

Format: `type: short description`. Body optional, use for context.

### Branch strategy for solo dev
- Work directly on `main` for early scaffolding
- Once you have beta users, start using feature branches + PRs to yourself for review discipline
- Tag every release: `git tag v0.1.0 -m "beta release"`

---

## Testing setup

### Jest for unit tests (conversion logic)
Already comes with Expo. Config in `jest.config.js`:
```js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo|@expo)/)',
  ],
};
```

Focus 100% coverage on:
- Ingredient conversion functions
- Yeast/egg/butter conversion math
- Pan area/volume formulas
- Recipe scaling logic

Skip UI component tests for now; too much overhead for solo dev.

### Manual QA checklist (before every beta release)
- [ ] Fresh install onboards correctly
- [ ] Convert 5 different ingredients, spot check numbers vs King Arthur
- [ ] Scale a recipe by 2x and 0.5x, math checks out
- [ ] Save a recipe, close app, reopen, still there
- [ ] Create a starter, log a feed, notification fires
- [ ] Toggle dark mode, everything readable
- [ ] Toggle reduced motion, no bounce animations
- [ ] Turn on floured fingers mode, text is huge
- [ ] Try Pro purchase in sandbox, restore purchases works
- [ ] Force airplane mode, calculator still works
- [ ] Screen sizes: iPhone SE, iPhone 15 Pro, iPad, small Android, large Android

---

## Useful commands to remember

```bash
# Run dev server
pnpm expo start

# Build for iOS simulator
pnpm expo run:ios

# Build for Android emulator
pnpm expo run:android

# Type-check
pnpm tsc --noEmit

# Lint
pnpm eslint . --ext .ts,.tsx

# Format
pnpm prettier --write .

# Test
pnpm jest

# Build for TestFlight (iOS)
eas build --platform ios --profile preview

# Build for Play Internal Testing (Android)
eas build --platform android --profile preview

# Ship an OTA update to existing installs (skip app review)
eas update --branch production
```

## AI coding partner tips

Since you're building this with Claude's help:
- Feed Claude the `theme.ts` and `en.json` at the start of every session
- Reference `docs/sam-voice-style-guide.md` before writing any new copy
- Feed ingredient data files when working on conversion logic
- Ask Claude to write in the same style as existing files (consistency wins)
