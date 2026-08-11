// The moods Sam can be in. Each maps to one Lottie animation (and one line).
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
