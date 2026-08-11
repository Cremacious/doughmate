import { samStateForText } from './sam';

describe('samStateForText', () => {
  it('reacts to cookies', () => {
    expect(samStateForText('chocolate chip cookies')).toBe('cookies');
  });

  it('reacts to sourdough', () => {
    expect(samStateForText('Weekend sourdough loaf')).toBe('sourdough');
  });

  it('reacts to macarons', () => {
    expect(samStateForText('French macarons')).toBe('macarons');
  });

  it('reacts to focaccia', () => {
    expect(samStateForText('rosemary focaccia')).toBe('focaccia');
  });

  it('reacts to croissants', () => {
    expect(samStateForText('butter croissants')).toBe('croissants');
  });

  it('ignores case', () => {
    expect(samStateForText('COOKIES')).toBe('cookies');
  });

  it('falls back to idle when nothing matches', () => {
    expect(samStateForText('mystery dough')).toBe('idle');
  });

  it('is idle for empty text', () => {
    expect(samStateForText('')).toBe('idle');
  });
});
