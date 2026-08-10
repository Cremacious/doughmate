import { listSubstitutions, searchSubstitutions } from './substitutions';

describe('substitutions', () => {
  it('lists every free substitution', () => {
    expect(listSubstitutions().length).toBe(18);
  });

  it('returns everything for an empty query', () => {
    expect(searchSubstitutions('').length).toBe(18);
  });

  it('finds a substitution by what you are missing', () => {
    const ids = searchSubstitutions('buttermilk').map((s) => s.id);
    expect(ids).toContain('buttermilk_diy');
  });

  it('searches the substitute text too', () => {
    const ids = searchSubstitutions('yogurt').map((s) => s.id);
    expect(ids).toContain('sour_cream_yogurt');
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchSubstitutions('zzzz')).toEqual([]);
  });
});
