import { convertYeast, getYeastType, listYeastTypes } from './yeast';

describe('convertYeast', () => {
  it('converts active dry to instant', () => {
    expect(convertYeast(1, 'active_dry', 'instant')).toBeCloseTo(0.75, 3);
  });

  it('converts instant to active dry', () => {
    expect(convertYeast(1, 'instant', 'active_dry')).toBeCloseTo(1.33, 3);
  });

  it('converts active dry to fresh', () => {
    expect(convertYeast(1, 'active_dry', 'fresh')).toBeCloseTo(2.5, 3);
  });

  it('scales by amount', () => {
    expect(convertYeast(2, 'active_dry', 'instant')).toBeCloseTo(1.5, 3);
  });

  it('returns the same amount for the same type', () => {
    expect(convertYeast(3, 'instant', 'instant')).toBe(3);
  });
});

describe('yeast types', () => {
  it('lists all three types', () => {
    expect(listYeastTypes().length).toBe(3);
  });

  it('names a type', () => {
    expect(getYeastType('instant')?.name).toBe('Instant yeast');
  });

  it('returns undefined for an unknown type', () => {
    expect(getYeastType('magic')).toBeUndefined();
  });
});
