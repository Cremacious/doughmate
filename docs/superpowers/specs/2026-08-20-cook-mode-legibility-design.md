# Cook Mode Legibility — Design

Date: 2026-08-20
Branch: `fix/sheet-position-cook-empty-undo`
Status: Approved for planning

## Problem

Cook mode is the screen a baker actually stands at the counter with, and it is the least legible screen in the app. Four faults, found by using it on a device:

1. **The canvas is too dark for its own text.** Cook mode inverts on both themes — `cookCanvas` is `#241611` on light *and* dark. Its secondary tone, `cookDim` (`#5A4436`), lands at roughly **2:1** contrast against that canvas, well under the WCAG AA floor of 4.5:1. The recipe name and the "Swipe down to step out." hint are both `cookDim`, so both are near-invisible. The ghost step numeral in `cookGhost` (`#3D2C22`) sits at roughly 1.3:1.

2. **The phone's own status bar disappears.** `app/_layout.tsx` sets `<StatusBar style={isDark ? 'light' : 'dark'} />` once, at the app root, from the app theme. Cook mode inverts underneath that without telling it, so on the light theme the OS draws black clock and battery icons over a near-black canvas.

3. **Two mismatched rectangles.** The step's duration renders as a decorative `proofTeal` pill using `typography.numeric.lg`, and the timer control sits beside it using `typography.title` — different type sizes, therefore different heights. The timer control also carries `marginTop: spacing.sm` that the pill does not, so the two are not even aligned along their top edge.

4. **The timer does not read as a button.** It is one of two similar rounded rectangles where only one is tappable, and it leads with a `▶` text glyph rather than an icon. The duration it would count is already printed in the pill next to it, so the pair reads as two labels rather than a label and an action.

## Goals

Make cook mode legible without redesigning it. The oversized step text, the ghost numeral, the progress dots and the sticky footer all stay exactly where they are — the layout was never the complaint.

## Non-goals

- **Redesigning the layout.** No new components, no Card treatment, no rearranging.
- **The compact `StepTimerControl` in the recipe detail step list.** Different context, different size, not raised as a problem. It keeps its current text-glyph treatment.
- **A cook-mode-specific theme.** The point of this change is that cook mode stops having its own palette.
- **Fixing `cookDim`'s contrast.** The token is deleted rather than corrected.

## Decision: drop the inversion

Cook mode follows the app theme like every other screen.

The inversion was there to make the screen read as a work surface rather than a page. It bought that at the cost of a palette nothing else used, no contrast budget, and a status bar it could not reach. Following the theme is what makes the status bar correct for free — see below — and lets every colour on the screen come from tokens the rest of the app already validates.

### Colour mapping

`app/recipe/[id]/cook.tsx` currently passes `canvasColor` and `footerColor` to both of its `BottomSheet` calls. Both props are dropped, so the sheet falls back to `palette.bgCanvas` and `palette.bgSurface` like every other sheet. The remaining cook-only tokens map to existing theme tokens:

| Element | Was | Becomes |
|---|---|---|
| Sheet canvas | `cookCanvas` | `bgCanvas` (BottomSheet default) |
| Sheet footer | `cookFooter` | `bgSurface` (BottomSheet default) |
| Step text, "Step N of M" | `onPrimary` | `textInk` |
| Recipe name label | `cookDim` | `textFaint` |
| "Swipe down to step out." | `cookDim` | `textFaint` |
| Ghost step numeral | `cookGhost` | `bgSunken` |
| Inactive progress dots | `cookGhost` | `divider` |
| Active progress dot | `primary` | `primary` (unchanged) |
| Empty-state title | `onPrimary` | `textInk` |
| Empty-state body | `onPrimary` | `textSoft` |

`bgSunken` keeps the ghost numeral in the same role it had — a shade off the canvas, present but not competing with the step text.

### The status bar needs no code

Once cook mode stops inverting, the root `StatusBar` is already correct for it: light theme gets dark icons on a light canvas, dark theme gets light icons on a dark one. Fault 2 is fixed by deleting the thing that caused it, not by adding a per-screen override.

## Decision: one timer button

The decorative duration pill and the `styles.timerRow` wrapper that held it are deleted. `StepTimerControl size="large"` becomes the only control in that position.

| State | Fill | Text | Label | Action |
|---|---|---|---|---|
| Idle | `proofTeal` | `onTeal` | timer icon + "Start 30 min timer" | starts the timer |
| Running | `proofTealWash` | `proofTealText` | timer icon + "29:55 left" | routes to `/timers` |
| Done | `proofTealWash` | `primary` | timer icon + "Done" | routes to `/timers` |

Two things make it read as a button rather than a label:

- **A real icon.** The `▶` and `◷` text glyphs are replaced with the `timer` icon already in `src/ui/iconData.ts`, rendered through the existing `Icon` component.
- **Button metrics.** The large variant adopts `Button size="lg"`'s exact metrics so it sits consistently with the "All done" button directly beneath it: height **60** normally and **72** under floured-fingers mode (`fontScale > 1`), matching `HEIGHTS.lg` in `src/ui/Button.tsx`, and `radius.xl` (**16**) rather than its current `radius.lg` (14). It keeps its own `proofTeal` fill — a teal button is not a `Button` variant, so this stays a `Pressable` that matches Button's measurements rather than becoming a `Button`.

Deleting the pill removes the duplication that made the pair confusing: the duration was printed twice, once as decoration and once inside the action's own label.

### A latent bug fixed in passing

`StepTimerControl`'s idle large variant colours its label `palette.bgSurface` on a `proofTeal` fill. That is a surface token used as a foreground token — correct today only by coincidence, and wrong the moment surface colours move. It becomes `palette.onTeal`, which is what that token exists for.

## Decision: delete the dead tokens

`cookCanvas`, `cookFooter`, `cookGhost` and `cookDim` are removed from both the light and dark palettes in `src/theme.ts`. After the mapping above, nothing references them.

`BottomSheet`'s `canvasColor` and `footerColor` props are removed too. Cook mode was their only consumer; leaving an unused escape hatch invites another screen to grow its own untested palette the same way.

## Files touched

| File | Change |
|---|---|
| `app/recipe/[id]/cook.tsx` | Drop `canvasColor`/`footerColor` from both sheets; remap colours; delete the duration pill and `timerRow`; drop the now-unused `duration`, `timerRow` and `timerControl` styles |
| `src/ui/StepTimerControl.tsx` | Large variant: `Icon` instead of glyphs, `Button size="lg"` metrics, `onTeal` fix |
| `src/ui/BottomSheet.tsx` | Remove `canvasColor` and `footerColor` props and their use |
| `src/theme.ts` | Delete the four `cook*` tokens from both palettes |

## Testing

No new unit tests. Every change here is presentational, and this repo has no component tests by design — not a single `.test.tsx` exists in `app/` or `src/`; the convention is unit tests for `src/lib/*` plus typecheck and lint for screens.

Verification is:

- `npm test` — the existing suite stays green (240 at the time of writing).
- `npm run typecheck` and `npm run lint` — both clean. Typecheck is what proves the token deletion is complete: any missed `palette.cookDim` reference is a compile error, not a runtime surprise.
- **Device check in both themes.** Open a recipe with a timed step and confirm: the status bar's clock and battery are legible; the recipe name and swipe hint are readable; the timer button is the only control in its row and matches "All done" in height; starting it flips the button to a countdown.

The typecheck guarantee is the reason the token deletion is in scope rather than deferred — it converts "did we catch every reference?" from a review question into a build failure.

## Risks

- **Cook mode loses its visual distinctiveness.** It will look like the rest of the app rather than announcing itself as a mode. Accepted deliberately: the oversized step text and single-step-at-a-time layout still separate it from browsing a recipe, and legibility at a counter matters more than mode signalling.
- **Dark-theme users see little change.** For a phone kept permanently in dark mode the canvas stays dark, so the visible win is the status bar, the contrast tones and the timer button rather than the background. This is expected, not a shortfall.
