import { listSubstitutions, PRO_SUBSTITUTION_COUNT, searchSubstitutions } from './substitutions';

const FREE_COUNT = 18;

describe('substitutions', () => {
  it('gives a free baker only the free set', () => {
    expect(listSubstitutions(false).length).toBe(FREE_COUNT);
  });

  it('gives Pro the free set plus the Pro set', () => {
    expect(listSubstitutions(true).length).toBe(FREE_COUNT + PRO_SUBSTITUTION_COUNT);
  });

  it('actually unlocks something worth paying for', () => {
    expect(PRO_SUBSTITUTION_COUNT).toBeGreaterThan(FREE_COUNT);
  });

  it('returns everything for an empty query', () => {
    expect(searchSubstitutions('', false).length).toBe(FREE_COUNT);
  });

  it('finds a substitution by what you are missing', () => {
    const ids = searchSubstitutions('buttermilk', false).map((s) => s.id);
    expect(ids).toContain('buttermilk_diy');
  });

  it('searches the substitute text too', () => {
    const ids = searchSubstitutions('yogurt', false).map((s) => s.id);
    expect(ids).toContain('sour_cream_yogurt');
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchSubstitutions('zzzz', false)).toEqual([]);
  });

  // The whole point of the gate: a Pro only swap must not leak to a free search.
  it('hides Pro swaps from a free search', () => {
    expect(searchSubstitutions('psyllium', false)).toEqual([]);
    expect(searchSubstitutions('psyllium', true).length).toBeGreaterThan(0);
  });

  it('keeps every id unique across both sets', () => {
    const ids = listSubstitutions(true).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // User facing copy in this app never uses hyphens or dashes.
  it('has no hyphens or dashes in any visible field', () => {
    const offenders = listSubstitutions(true).filter((s) =>
      /[-‐-―−]/.test(`${s.missing} ${s.amount} ${s.substitute} ${s.notes}`)
    );
    expect(offenders).toEqual([]);
  });
});
