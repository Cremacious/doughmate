import { emotionForMood, emotionForState, SAM_EMOTIONS } from './samEmotion';

describe('emotionForState', () => {
  it('keeps idle idle', () => {
    expect(emotionForState('idle')).toBe('idle');
  });
  it('celebrates as excited', () => {
    expect(emotionForState('celebrate')).toBe('excited');
  });
  it('reads baking reactions as happy', () => {
    expect(emotionForState('cookies')).toBe('happy');
    expect(emotionForState('sourdough')).toBe('happy');
    expect(emotionForState('macarons')).toBe('happy');
    expect(emotionForState('focaccia')).toBe('happy');
    expect(emotionForState('croissants')).toBe('happy');
  });
});

describe('emotionForMood', () => {
  it('maps every starter mood to an emotion', () => {
    expect(emotionForMood('new')).toBe('idle');
    expect(emotionForMood('full')).toBe('happy');
    expect(emotionForMood('peak')).toBe('excited');
    expect(emotionForMood('peckish')).toBe('curious');
    expect(emotionForMood('hungry')).toBe('hungry');
    expect(emotionForMood('sleepy')).toBe('sleepy');
  });
  it('only produces known emotions', () => {
    const moods = ['new', 'full', 'peak', 'peckish', 'hungry', 'sleepy'] as const;
    for (const m of moods) {
      expect(SAM_EMOTIONS).toContain(emotionForMood(m));
    }
  });
});
