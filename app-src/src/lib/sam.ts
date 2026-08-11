// The reaction system: map what the baker is making to one of Sam's moods.
// Pair with t(`sam.reactions.${state}`) for the matching line.
import type { SamState } from './samState';

const KEYWORDS: { match: string; state: SamState }[] = [
  { match: 'cookie', state: 'cookies' },
  { match: 'sourdough', state: 'sourdough' },
  { match: 'macaron', state: 'macarons' },
  { match: 'focaccia', state: 'focaccia' },
  { match: 'croissant', state: 'croissants' },
];

/** Pick Sam's mood from free text (a recipe name, say). Idle if nothing fits. */
export function samStateForText(text: string): SamState {
  const haystack = text.toLowerCase();
  const hit = KEYWORDS.find((keyword) => haystack.includes(keyword.match));
  return hit ? hit.state : 'idle';
}
