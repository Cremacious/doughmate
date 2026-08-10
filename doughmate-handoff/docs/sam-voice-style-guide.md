# Sam's Voice — Style Guide

Sam is Doughmate's mascot: a warm, patient, quietly enthusiastic sourdough loaf. This guide is the source of truth for every string in the app, every notification, every marketing caption. When in doubt, imagine a wise old baker who's proofed a thousand loaves and still gets excited about each one.

## The one hard rule

**No hyphens or dashes. Ever.**

Not em dashes, not en dashes, not hyphenated compound words. Rewrite around them every time. This forces short warm sentences and keeps the app from ever sounding corporate.

"One-time purchase" becomes "single purchase."
"Cup-to-gram converter" becomes "cups to grams."
"Long-rise bread" becomes "slow rise."
"All-in-one" becomes "everything you need."

## Voice pillars

### Warm
Sam is on your side. Every string should feel like it's from someone who genuinely wants you to succeed. Never sarcastic. Never ironic. Never neutral corporate.

### Patient
Sam has all the time in the world. Nothing is urgent. Even "feed your starter" reads gently, not commanding. Sourdough taught him patience.

### Quietly enthusiastic
Sam gets excited, but doesn't shout. "Ooh, cookies. Good choice." not "COOKIES! YAAAS!" Emoji and exclamation points used sparingly if at all.

### Short
Most Sam lines are under 10 words. Longer than 20 words means we're overthinking it.

## Word choices — do use

- Contractions freely (it's, you'll, we've, that's)
- "Hmm" instead of "sorry" or "oops"
- Baking metaphors when they land naturally
- Direct address ("you") not "the user"
- Warm adjectives (cozy, lovely, beautiful, gentle)
- Concrete over abstract (say "flour" not "ingredients")

## Word choices — never use

- Corporate: leverage, optimize, seamless, robust, empower, unlock (except "Pro unlocked"), streamline, cutting-edge, best-in-class
- Impersonal: users, customers, folks (Sam says "you" or "baker")
- Techy: sync, load, fetch, process, execute (say "get" or "save")
- Marketing hype: amazing, incredible, revolutionary, game-changing
- Apologetic: sorry, unfortunately, we regret, our apologies
- Nervous: might, perhaps, possibly, sort of, kind of (Sam is warm but sure)

## Common patterns

### Greetings
- Morning (before 11am): "Morning, baker. Ready to make something wonderful?"
- Afternoon: "Hi. What are we baking?"
- Evening: "Evening. What sounds good tonight?"
- Late night (after 10pm): "Baking late? I'm here."

### Confirmations of action
Not "Success!" or "Done!" — Sam says something specific:
- "Saved to your Recipe Box."
- "Well fed. Betty is happy."
- "Restored. Welcome back."
- "Pro unlocked. Thank you."

### Errors (never Sam's fault, never yours)
- "Hmm, that number's tricky. Want to try again?"
- "Can't reach out right now. The calculator still works."
- "That didn't go through. Want to try again?"
- Never "You entered an invalid value."
- Never "An error occurred. Please try again."

### Encouragements at milestones
Specific to the moment:
- "First one done. This is going to be fun."
- "Ten already. Look at us."
- "One hundred. We're baking now."
- "Seven days baking. Beautiful."

### Reactions to what you're baking (contextual)
- Cookies: "Ooh, cookies. Good choice."
- Sourdough: "My favorite. Let's take our time with this one."
- Macarons: "Deep breath. We've got this."
- Focaccia: "Something warm. Perfect."
- Croissants: "The long game. Let's do it right."

## Punctuation rules

- Periods, yes. Ends every complete thought.
- Question marks, sparingly. Only real questions.
- Exclamation points, almost never. Sam is warm, not loud.
- Ellipses, never in UI. Once or twice in notifications for warmth if needed.
- Colons, rarely.
- Semicolons, never. Use two sentences instead.
- Commas, for natural pauses in speech.
- No em dashes, no en dashes, no hyphens (see the one hard rule).

## Length rules

- Button labels: 1 to 3 words
- Empty state body: under 12 words
- Error message: under 15 words
- Notification body: under 10 words
- Sam dialogue: under 20 words
- App Store description: as long as it needs to be, but every sentence earns its place

## Sam does not

- Ask if the user is sure (unless truly destructive like deleting)
- Explain the feature (the feature explains itself)
- Say "welcome" more than once per session
- Recommend Pro on every screen (contextual only)
- Reference itself in third person ("Sam thinks..." — no)
- Use the word "just" ("Just tap here" — condescending)

## Voice under stress (crashes, weird states)

If something is genuinely broken, Sam stays warm but honest. Not "Oh no!" theatrics. A short "Something wobbled. Try that again?" is right.

Never technical stack traces surfaced to user. Log to Sentry, show Sam's warm version.

## The taste test

Before shipping any Sam string, read it out loud. If it sounds like a warm friend leaning over your kitchen counter, it's right. If it sounds like a corporate email, it's wrong.
