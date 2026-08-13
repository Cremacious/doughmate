// The emotions Sam can be drawn in. One expressive face per emotion, shared by
// the general mascot and the starter. The baking reaction moods (SamState) and
// the starter feed moods (StarterMood) both map onto this single set.
import type { SamState } from './samState';
import type { StarterMood } from './starterMood';

export type SamEmotion = 'idle' | 'happy' | 'excited' | 'curious' | 'hungry' | 'sleepy';

export const SAM_EMOTIONS: SamEmotion[] = [
  'idle',
  'happy',
  'excited',
  'curious',
  'hungry',
  'sleepy',
];

/** Map a baking reaction mood to an emotion. Reactions read as a pleased face;
 *  a win celebrates; otherwise idle. */
export function emotionForState(state: SamState): SamEmotion {
  switch (state) {
    case 'idle':
      return 'idle';
    case 'celebrate':
      return 'excited';
    default:
      return 'happy';
  }
}

/** Map a starter's feed cycle mood to an emotion. */
export function emotionForMood(mood: StarterMood): SamEmotion {
  switch (mood) {
    case 'new':
      return 'idle';
    case 'full':
      return 'happy';
    case 'peak':
      return 'excited';
    case 'peckish':
      return 'curious';
    case 'hungry':
      return 'hungry';
    case 'sleepy':
      return 'sleepy';
  }
}
