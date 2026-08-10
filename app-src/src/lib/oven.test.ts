import { cToF, fToC, gasMarkTemp, listGasMarks, nearestGasMark } from './oven';

describe('temperature conversion', () => {
  it('converts Fahrenheit to Celsius', () => {
    expect(fToC(350)).toBeCloseTo(176.67, 2);
  });

  it('converts Celsius to Fahrenheit', () => {
    expect(cToF(180)).toBe(356);
  });

  it('agrees at boiling point', () => {
    expect(fToC(212)).toBeCloseTo(100, 6);
    expect(cToF(100)).toBe(212);
  });
});

describe('gas marks', () => {
  it('lists the standard gas marks', () => {
    expect(listGasMarks().length).toBe(11);
  });

  it('maps a gas mark to a temperature', () => {
    expect(gasMarkTemp('4')).toEqual({ f: 350, c: 180 });
  });

  it('returns undefined for an unknown mark', () => {
    expect(gasMarkTemp('11')).toBeUndefined();
  });

  it('finds the nearest gas mark for a Fahrenheit temperature', () => {
    expect(nearestGasMark(350)).toBe('4');
    expect(nearestGasMark(360)).toBe('4');
    expect(nearestGasMark(390)).toBe('6');
  });

  it('finds the nearest low gas mark', () => {
    expect(nearestGasMark(230)).toBe('1/4');
  });
});
