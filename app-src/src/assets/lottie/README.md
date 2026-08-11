# Sam's Lottie animations

Sam's animated states live here, one Lottie JSON per mood. The files in this
folder right now are **empty placeholders** so the app builds; Sam renders from
`assets/sam.svg` until the real animations arrive.

## Expected files (keep these exact names)

| File              | When Sam plays it                                  |
| ----------------- | -------------------------------------------------- |
| `idle.json`       | Default, resting mascot                            |
| `cookies.json`    | Baker is making cookies                            |
| `sourdough.json`  | Sourdough                                          |
| `macarons.json`   | Macarons                                           |
| `focaccia.json`   | Focaccia                                           |
| `croissants.json` | Croissants                                         |
| `celebrate.json`  | A conversion was saved / a milestone hit           |

## To go live (two steps)

1. Drop the animator's Lottie JSON files in here, replacing the placeholders
   (same file names as above).
2. In `index.ts`, set `LOTTIE_READY = true`.

That's it. No other code changes: `Sam` swaps from the SVG to Lottie, and the
reaction system (`src/lib/sam.ts`) already maps recipe text to these states.
