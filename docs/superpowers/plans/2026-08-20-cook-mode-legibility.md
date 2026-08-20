# Cook Mode Legibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make cook mode legible — stop it inverting to its own dark palette, replace the mismatched duration pill and timer control with one button, and delete the cook-only colour tokens that nothing else uses.

**Architecture:** Three sequential changes, each leaving the app compiling. First the shared `StepTimerControl` gains a real icon and Button-matching metrics. Then `app/recipe/[id]/cook.tsx` drops its palette overrides, remaps every colour to a standard theme token, and deletes the decorative duration pill. Last, with nothing referencing them, the four `cook*` tokens and `BottomSheet`'s colour-override props are removed — a step whose success is proven by `tsc` rather than by inspection.

**Tech Stack:** React Native 0.86, Expo SDK 57, Expo Router, TypeScript, i18next.

## Global Constraints

- **All work happens in `/home/chris/Code/doughmate/app-src`.** Every path below is relative to that directory, and every command runs from it. The branch is `fix/sheet-position-cook-empty-undo`.
- **No new dependencies. No new Expo API surface.** Everything needed is already imported somewhere in this repo. Per `app-src/AGENTS.md`, if you reach for an Expo API that is not, stop and read https://docs.expo.dev/versions/v57.0.0/ first.
- **No new user-facing strings.** Every label this plan renders already exists in `src/i18n/en.json` under the `timers` namespace. Do not add keys.
- **Do not touch the compact `StepTimerControl` variant's appearance.** It is the quiet text control in the recipe-detail step list, a different context that was never raised as a problem. It keeps its `▶` and `◷` text glyphs. Only the `large` variant changes.
- **Ordering is load-bearing.** Task 3 deletes tokens that Tasks 1–2 stop using. Running Task 3 first breaks the build.
- Follow existing code style: comments only where non-obvious reasoning needs recording.
- **Verification** (from `app-src`): `npm test`, `npm run typecheck`, `npm run lint`. The suite is 240 passing and must stay green. This change is entirely presentational and adds no tests — this repo has no component tests by design, not a single `.test.tsx` exists in `app/` or `src/`, and the convention is unit tests for `src/lib/*` plus typecheck and lint for screens. Do not invent a component test harness.

---

### Task 1: `StepTimerControl` large variant reads as a button

**Files:**
- Modify: `src/ui/StepTimerControl.tsx`

**Interfaces:**
- Consumes: `Icon` from `@/ui/Icon` — `function Icon({ name, size, color, strokeWidth }: { name: IconName; size?: number; color: string; strokeWidth?: number })`. The icon name `'timer'` already exists in `src/ui/iconData.ts`. `useAppTheme()` already returns `{ palette, fontScale }`; this file currently destructures only `palette`.
- Produces: nothing new. `StepTimerControlProps` is unchanged, so `app/recipe/[id]/cook.tsx` (Task 2) and `app/recipe/[id].tsx` keep calling it exactly as they do today.

**Three faults are fixed here:** the `▶`/`◷` text glyphs make the control read as a label rather than a button; the control does not match the height of the `Button` directly beneath it in cook mode; and the idle large variant colours its text `palette.bgSurface`, a surface token used as a foreground token, which is correct today only by coincidence.

- [ ] **Step 1: Add the imports and `fontScale`**

In `src/ui/StepTimerControl.tsx`, add `Icon` to the `@/ui/*` imports — place it after the `@/state/timers` import and before the `@/theme` import so the grouping stays alphabetical by path:

```ts
import { Icon } from '@/ui/Icon';
```

Then widen the theme destructure. Find `const { palette } = useAppTheme();` and replace it with:

```ts
const { palette, fontScale } = useAppTheme();
```

- [ ] **Step 2: Add the shared height**

Directly below `const large = size === 'large';`, add:

```ts
// Matches HEIGHTS.lg in src/ui/Button.tsx, so this control and the primary
// button beneath it in cook mode sit at the same height.
const largeHeight = fontScale > 1 ? 72 : 60;
```

- [ ] **Step 3: Rewrite the idle branch**

Replace the whole `if (!running) { ... }` block with this. The label loses its glyph for the large variant and keeps it for the compact one:

```tsx
  if (!running) {
    const startLabel = t('timers.start_step_timer', { time: timeLabel });
    const onPress = () => {
      // Free bakers run one timer at a time. Overlapping stages are the Pro upgrade.
      if (atLimit(activeTimerCount(timers, now), FREE_TIMER_LIMIT, isPro)) {
        router.push('/paywall');
        return;
      }
      startTimer({ label: stepText.trim().slice(0, 40), stepLabel, recipeId, durationMs });
      show({ message: t('timers.timer_started', { time: timeLabel }), variant: 'confirmation' });
    };
    return large ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={startLabel}
        onPress={onPress}
        style={[styles.largeBtn, { height: largeHeight, backgroundColor: palette.proofTeal }]}
      >
        <Icon name="timer" size={22} color={palette.onTeal} />
        <Text style={[typography.title, { color: palette.onTeal }]}>{startLabel}</Text>
      </Pressable>
    ) : (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={startLabel}
        onPress={onPress}
        style={styles.compactBtn}
      >
        <Text style={[typography.label, { color: palette.proofTeal }]}>{`▶ ${startLabel}`}</Text>
      </Pressable>
    );
  }
```

- [ ] **Step 4: Rewrite the running branch**

Replace everything from `const remaining = timerRemainingMs(running, now);` down to the closing `);` of the component's final `return` with:

```tsx
  const remaining = timerRemainingMs(running, now);
  const done = isTimerDone(running, now);
  const runningLabel = done
    ? t('timers.done')
    : t('timers.step_time_left', { time: formatRemaining(remaining) });
  const runningColor = done ? palette.primary : palette.proofTealText;

  return large ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('timers.view_running_timer')}
      onPress={() => router.push('/timers')}
      style={[styles.largeBtn, { height: largeHeight, backgroundColor: palette.proofTealWash }]}
    >
      <Icon name="timer" size={22} color={runningColor} />
      <Text style={[typography.title, { color: runningColor }]}>{runningLabel}</Text>
    </Pressable>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('timers.view_running_timer')}
      onPress={() => router.push('/timers')}
      style={styles.compactBtn}
    >
      <Text style={[typography.label, { color: done ? palette.primary : palette.proofTeal }]}>
        {`◷ ${runningLabel}`}
      </Text>
    </Pressable>
  );
```

Note the compact variant keeps `palette.proofTeal` while the large one uses `palette.proofTealText` — that is the existing behaviour, preserved deliberately, because the two sit on different backgrounds.

- [ ] **Step 5: Replace the `largeBtn` style**

In the `StyleSheet.create` block at the bottom, replace the `largeBtn` entry with:

```ts
  largeBtn: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
  },
```

Three changes from the old entry: `paddingVertical` goes because the height is now explicit; `borderRadius` moves from `radius.lg` (14) to `radius.xl` (16) to match `Button`; and `marginTop: spacing.sm` goes because the control no longer sits beside a pill it has to clear — in cook mode the ScrollView body's own `gap: spacing.md` handles the spacing.

Leave `compactBtn` exactly as it is.

- [ ] **Step 6: Typecheck, lint and test**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all clean, 240 tests passing. If lint reports a formatting complaint, run `npx eslint --fix src/ui/StepTimerControl.tsx` and re-run.

- [ ] **Step 7: Commit**

```bash
git add src/ui/StepTimerControl.tsx
git commit -m "fix(timers): give the large step timer an icon and button metrics"
```

---

### Task 2: Cook mode follows the app theme

**Files:**
- Modify: `app/recipe/[id]/cook.tsx`

**Interfaces:**
- Consumes: `StepTimerControl` from Task 1, called exactly as it is today — `<StepTimerControl recipeId stepIndex stepText time durationMs size="large" />`. Props are unchanged.
- Produces: nothing consumed elsewhere. After this task, no file references `palette.cookCanvas`, `palette.cookFooter`, `palette.cookGhost` or `palette.cookDim`, and no file passes `canvasColor` or `footerColor` to `BottomSheet` — which is what makes Task 3 possible.

- [ ] **Step 1: Drop the palette overrides from both sheets**

There are two `<BottomSheet>` calls in this file — one in the no-steps empty-state branch, one in the main render. Both carry these two lines:

```tsx
        canvasColor={palette.cookCanvas}
        footerColor={palette.cookFooter}
```

Delete both lines from **both** calls (four lines total). The sheet then falls back to `palette.bgCanvas` and `palette.bgSurface`, like every other sheet in the app.

- [ ] **Step 2: Remap the empty-state colours**

Still in the empty-state branch, the title currently uses `{ color: palette.onPrimary }` and the body `{ color: palette.onPrimary }`. Change the title to:

```tsx
              { color: palette.textInk },
```

and the body to:

```tsx
              { color: palette.textSoft },
```

Delete the comment block above the body that begins `{/* onPrimary rather than cookDim:` — it explains a decision about a canvas that no longer exists.

- [ ] **Step 3: Remap the header colours**

In the main render's `header` prop, the recipe name uses `{ color: palette.cookDim }` and the step counter uses `{ color: palette.onPrimary }`. Change them to:

```tsx
            { color: palette.textFaint },
```

for the recipe name, and:

```tsx
            { color: palette.textInk },
```

for the step counter.

- [ ] **Step 4: Remap the footer's swipe hint**

In the main render's `footer` prop, the hint text uses `{ color: palette.cookDim }`. Change it to:

```tsx
              { color: palette.textFaint },
```

- [ ] **Step 5: Remap the dots, the ghost numeral and the step text**

In the ScrollView body, the inactive dot colour is `palette.cookGhost`. Change that line to:

```tsx
                  backgroundColor: i === index ? palette.primary : palette.divider,
```

The ghost numeral line reads `<Text style={[typography.numeric.hero, numeralLine(GHOST), { color: palette.cookGhost }]}>`. Change it to:

```tsx
        <Text style={[typography.numeric.hero, numeralLine(GHOST), { color: palette.bgSunken }]}>
```

The step text uses `{ color: palette.onPrimary }`. Change it to:

```tsx
            { color: palette.textInk },
```

- [ ] **Step 6: Replace the duration pill and timer row with the single control**

Find the whole `{step.time ? ( ... ) : null}` block — it opens with `<View style={styles.timerRow}>` and contains the `styles.duration` pill and the `styles.timerControl` wrapper. Replace the entire block with:

```tsx
        {step.time && stepDurationMs !== null ? (
          <StepTimerControl
            recipeId={recipe.id}
            stepIndex={index}
            stepText={step.text}
            time={step.time}
            durationMs={stepDurationMs}
            size="large"
          />
        ) : null}
```

The duration is gone as a separate element because the button's own label already reads "Start 30 min timer". Note the guard is now a single condition: previously an unparseable time still rendered the pill with no control, which was a rectangle that did nothing.

- [ ] **Step 7: Remove the styles and imports that just became unused**

In the `StyleSheet.create` block, delete these three entries entirely:

```ts
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  duration: {
    borderRadius: radius.lg,
    borderWidth: stroke.ink,
    borderColor: 'transparent',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  timerControl: { flex: 1, minWidth: 180 },
```

`formatStepTime` was used only by the deleted pill, and `stroke` only by the deleted `duration` style. Change the timer import from:

```ts
import { formatStepTime, parseDuration } from '@/lib/timer';
```

to:

```ts
import { parseDuration } from '@/lib/timer';
```

and the theme import from:

```ts
import { radius, spacing, stroke, typography } from '@/theme';
```

to:

```ts
import { radius, spacing, typography } from '@/theme';
```

Keep `radius` — the `dot` style still uses `radius.pill`.

- [ ] **Step 8: Typecheck, lint and test**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all clean, 240 passing. Lint is what catches a missed unused import here; typecheck catches a mistyped token name. If lint reports formatting, run `npx eslint --fix "app/recipe/[id]/cook.tsx"` and re-run.

- [ ] **Step 9: Confirm no cook token references remain**

Run: `grep -rn "cookCanvas\|cookFooter\|cookGhost\|cookDim" app src --include=*.tsx --include=*.ts | grep -v "src/theme.ts"`
Expected: **no output.** Any hit means a colour was missed in Steps 2–5 and Task 3 will fail to compile.

- [ ] **Step 10: Commit**

```bash
git add "app/recipe/[id]/cook.tsx"
git commit -m "fix(recipes): let cook mode follow the app theme and use one timer button"
```

---

### Task 3: Delete the cook-only tokens and the override props

**Files:**
- Modify: `src/theme.ts`
- Modify: `src/ui/BottomSheet.tsx`

**Interfaces:**
- Consumes: the guarantee from Task 2 that nothing references the four `cook*` tokens or passes `canvasColor`/`footerColor`.
- Produces: nothing. This is pure deletion.

**Why this is in scope rather than deferred:** `tsc` is what proves the retheme was complete. A missed `palette.cookDim` becomes a compile error here instead of a colour nobody notices until a user reports it.

- [ ] **Step 1: Delete the tokens from both palettes**

`src/theme.ts` declares the four cook tokens twice — once in the light palette (around line 84) and once in the dark (around line 156). Both blocks read identically:

```ts
    cookCanvas: '#241611',
    cookFooter: '#1B120E',
    cookGhost: '#3D2C22',
    cookDim: '#5A4436',
```

Delete all four lines from **both** palettes — eight lines total. Leave every other token untouched, including `heroDim`, which sits nearby and is unrelated.

- [ ] **Step 2: Remove the props from `BottomSheet`**

In `src/ui/BottomSheet.tsx`, delete these lines from `BottomSheetProps`:

```ts
  /** Overrides the panel fill. Cook mode inverts, on both themes. */
  canvasColor?: string;
  /** Overrides the sticky footer fill, paired with `canvasColor`. */
  footerColor?: string;
```

Delete `canvasColor,` and `footerColor,` from the destructured parameter list.

Then simplify the two places they were used. The panel fill currently reads:

```ts
            backgroundColor: canvasColor ?? palette.bgCanvas,
```

Change it to:

```ts
            backgroundColor: palette.bgCanvas,
```

The footer fill currently reads:

```ts
                backgroundColor: footerColor ?? palette.bgSurface,
```

Change it to:

```ts
                backgroundColor: palette.bgSurface,
```

- [ ] **Step 3: Typecheck, lint and test**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all clean, 240 passing. A typecheck error naming `cookCanvas`, `cookFooter`, `cookGhost` or `cookDim` means Task 2 missed a reference — go back and fix it there rather than restoring the token.

- [ ] **Step 4: Verify the tokens are gone everywhere**

Run: `grep -rn "cookCanvas\|cookFooter\|cookGhost\|cookDim\|canvasColor\|footerColor" app src --include=*.tsx --include=*.ts`
Expected: **no output.**

- [ ] **Step 5: Manual verification in the browser**

This repo has no component tests, so screens are verified by hand. Note the browser cannot show the status-bar fix — that is device-only — but it does show every colour change.

1. Start the web preview: `npm run web` from `app-src`, or the project's `web` launch config. If port 8081 is already taken by a device dev server, stop that first.
2. Set the viewport to a phone size (375×812).
3. Open a recipe with at least one step whose time parses (`10 min`, `1h 30m`, or a bare `20`), then tap **Start baking**.
4. Confirm the sheet is now the normal cream canvas, not the dark brown one.
5. Confirm the recipe name above "Step 1 of N" is readable, and the "Swipe down to step out." hint at the bottom is readable.
6. Confirm the big faded step numeral behind the step text is visible as a watermark but does not compete with the text.
7. Confirm there is exactly **one** control below the step text — a teal button reading "Start 30 min timer" with a clock icon — and that it is the same height and corner radius as the "All done" button beneath it.
8. Tap it. Confirm it flips to a pale teal block reading "29:55 left" at the same size, and that tapping again opens Timers.
9. Switch the app to the dark theme in Settings and repeat steps 4–7. Every element should still be legible.

- [ ] **Step 6: Commit**

```bash
git add src/theme.ts src/ui/BottomSheet.tsx
git commit -m "refactor(theme): drop the cook-only palette and sheet colour overrides"
```

## Self-Review Notes

**Spec coverage** — every section of `docs/superpowers/specs/2026-08-20-cook-mode-legibility-design.md`:

| Spec requirement | Where |
|---|---|
| Drop the inversion; sheet uses `bgCanvas`/`bgSurface` | Task 2, Step 1 |
| Full colour mapping table (8 rows) | Task 2, Steps 2–5 |
| Status bar needs no code | No task — correct, and deliberately so. Fixed by Task 2 Step 1 removing the inversion the root `StatusBar` was fighting. Verified on device, not in the browser. |
| One timer button, three states | Task 1, Steps 3–4 |
| Real icon instead of `▶`/`◷` glyphs | Task 1, Steps 3–4 |
| `Button size="lg"` metrics (60/72, `radius.xl`) | Task 1, Steps 2 and 5 |
| `bgSurface` → `onTeal` latent bug | Task 1, Step 3 |
| Delete four `cook*` tokens from both palettes | Task 3, Step 1 |
| Remove `canvasColor`/`footerColor` props | Task 3, Step 2 |
| Compact variant left alone | Global Constraints, and preserved explicitly in Task 1 Steps 3–4 |
| No new tests; typecheck + lint + 240 green | Global Constraints, and every task's verification step |

**Placeholder scan:** none. Every step carries the actual code to write or the actual command to run.

**Type consistency:** `StepTimerControlProps` is unchanged across all three tasks, so Task 2 calls the control exactly as the current code does. `largeHeight` and `runningColor` are introduced and used only within Task 1. The token names deleted in Task 3 (`cookCanvas`, `cookFooter`, `cookGhost`, `cookDim`) are precisely the four remapped in Task 2, and the props deleted in Task 3 (`canvasColor`, `footerColor`) are precisely the two removed from call sites in Task 2 Step 1.

**One ordering risk worth restating:** Task 3 cannot run before Task 2. The grep in Task 2 Step 9 exists to catch that before it becomes a confusing compile failure in a later task.
