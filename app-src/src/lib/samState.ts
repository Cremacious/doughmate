// The baking reaction moods behind Sam's reaction lines (sam.reactions.*). The
// drawing maps these to an emotion via samEmotion; the text uses the mood key.
export type SamState =
  'idle' | 'cookies' | 'sourdough' | 'macarons' | 'focaccia' | 'croissants' | 'celebrate';

export const SAM_STATES: SamState[] = [
  'idle',
  'cookies',
  'sourdough',
  'macarons',
  'focaccia',
  'croissants',
  'celebrate',
];
