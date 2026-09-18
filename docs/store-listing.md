# App Store listing copy

The text filed with App Store Connect for DoughMate, kept here so it is version
controlled and so a future version does not start from a blank page.

**House style: no hyphens, en dashes or em dashes in any user facing copy.** The
codebase already holds to this (`src/lib/schedule.ts` documents its clock
formatting as "deterministic and hyphen free"). Check it with a script rather than
by eye, because an em dash pasted from elsewhere is almost invisible in review.

| Field | Limit | Used | Notes |
|---|---|---|---|
| App name | 30 | 28 | `DoughMate: Baker's Companion`. Plain "DoughMate" was taken on the App Store. |
| Subtitle | 30 | 29 | Indexed for search. |
| Promotional text | 170 | 155 | Editable any time without shipping a build. |
| Description | 4000 | 1829 | Not indexed for search. |
| Keywords | 100 | 98 | Comma separated, no spaces after commas. |

---

## App name

```
DoughMate: Baker's Companion
```

The home screen name stays plain `DoughMate` (`app.json` `name`, which becomes
CFBundleDisplayName). Only the App Store listing name has to be globally unique.

## Subtitle

```
Recipes and baking calculator
```

Kept over the alternative "Baking math, made simple" on purpose. Subtitles are
indexed, and this one carries **recipes** and **calculator**, two search terms the
keyword list does not include. Style lost to discovery for an app with no installs.
Worth revisiting once there is an install base to trade against.

## Promotional text

```
Convert cups to grams, pan sizes, oven temps and yeast without leaving the kitchen. Track every starter, log its feeds, and get a nudge when one is hungry.
```

Focused on conversions and starters, the two features people come for. This field
can be changed without a new version, so it is the right place for seasonal or
campaign messaging later.

## Description

```
Baking is mostly waiting, plus a little arithmetic you would rather not do at 6am with flour on your hands.

DoughMate handles the numbers so you can get on with the bread.

CONVERT ANYTHING
Cups to grams. Pan sizes. Oven temperatures. Yeast types. Egg sizes. Butter. Tap a chip, get the number, without scrolling past somebody's life story to find it.

YOUR RECIPE BOX
Save a recipe, scale it by servings, and cook it one step at a time without losing your place. Cook mode keeps the screen awake and the next step in front of you.

MIND YOUR STARTER
Track every starter you keep, log its feeds, and get a nudge when one is due. If you have ever found a jar at the back of the fridge and felt a bit guilty, this is for you.

PLAN A BAKE
Tell DoughMate when you want it ready. It counts backwards through your recipe's own steps, using the times you set for them, and tells you when to start. As each step comes due, it lets you know.

SWAP IN A PINCH
Out of buttermilk. Short on bread flour. Find a substitution in a tap, with the ratio already worked out.

TIMERS THAT FIT BAKING
Name them, run them, and always know which one is the levain and which one is the oven.

KEEP A BAKING BOOK
Log what you baked and how it went, so next time you are adjusting from notes instead of memory.

DoughMate is free, and it stays free. Everything above is included.

There is also a Supporter purchase for anyone who wants to chip in. You buy it once. It is not a subscription. It unlocks unlimited recipes, starters and timers at once, the full substitution library, baker's percentages, a levain build calculator, and a cost calculator that tells you what a loaf actually costs to make. It also removes ads.

Your recipes, starters and timers stay on your device. No account, no sign up, nothing uploaded.

Built by one person who bakes.
```

Deliberate choices worth preserving:

- **No price figure.** Prices differ per storefront and can change; a hardcoded
  "$2.99" would be wrong in most of the 175 countries. "You buy it once. It is not
  a subscription." carries the part that matters.
- **The free tier is described as complete**, matching the Supporter framing in the
  paywall and heading off "bait and switch" reviews.
- **PLAN A BAKE describes what the scheduler actually does**: it works from the
  user's own recipe steps and the times they set, not from preset baking stages. An
  earlier draft invented "bulk, shape, proof, bake" and was cut as overclaiming.

## Keywords

```
sourdough,starter,levain,hydration,bread,dough,proofing,ferment,converter,grams,cups,yeast,scaling
```

No spaces after the commas, since spaces count toward the 100 character limit.
Words already in the app name or subtitle are omitted, because Apple indexes those
separately and repeating them wastes the budget. That is why "baker", "companion",
"recipes" and "calculator" are absent.

## Other version fields

| Field | Value |
|---|---|
| Support URL | `https://cremacious.github.io/doughmate/support.html` |
| Privacy Policy URL | `https://cremacious.github.io/doughmate/` |
| Marketing URL | not set |
| Copyright | `2026 Chris Mackall` |

Apple expects the Support URL to genuinely offer support, so it points at
`docs/support.html` rather than the privacy policy.
