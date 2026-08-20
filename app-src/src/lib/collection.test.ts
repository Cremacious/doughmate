import { removeById, restoreById } from './collection';

interface Rec {
  id: string;
  createdAt: number;
}

describe('removeById', () => {
  it('removes the record with a matching id', () => {
    const list: Rec[] = [
      { id: 'a', createdAt: 1 },
      { id: 'b', createdAt: 2 },
    ];
    expect(removeById(list, 'a')).toEqual([{ id: 'b', createdAt: 2 }]);
  });

  it('leaves the list unchanged when the id is absent', () => {
    const list: Rec[] = [{ id: 'a', createdAt: 1 }];
    expect(removeById(list, 'missing')).toEqual(list);
  });
});

describe('restoreById', () => {
  it('prepends into a list that does not already contain the record', () => {
    const list: Rec[] = [{ id: 'a', createdAt: 1 }];
    const restored: Rec = { id: 'b', createdAt: 2 };
    expect(restoreById(list, restored)).toEqual([restored, { id: 'a', createdAt: 1 }]);
  });

  // This is the regression case: an undo handler closes over whatever list its
  // render saw. If a stale mutator ever derives from that render's list again,
  // restoring would put the record back into a list that still holds it,
  // producing two entries sharing one id — duplicate React keys, and edits that
  // can land on the wrong record.
  it('does not duplicate a record whose id is already present', () => {
    const existing: Rec = { id: 'a', createdAt: 1 };
    const list: Rec[] = [existing];
    const restored: Rec = { id: 'a', createdAt: 1 };
    const result = restoreById(list, restored);
    expect(result).toHaveLength(1);
    expect(result.filter((r) => r.id === 'a')).toHaveLength(1);
  });

  it('is idempotent: restoring the same record twice matches restoring it once', () => {
    const list: Rec[] = [{ id: 'a', createdAt: 1 }];
    const restored: Rec = { id: 'b', createdAt: 2 };
    const once = restoreById(list, restored);
    const twice = restoreById(once, restored);
    expect(twice).toEqual(once);
  });

  it('without a comparator, just moves the restored record to the front', () => {
    const list: Rec[] = [
      { id: 'a', createdAt: 5 },
      { id: 'c', createdAt: 1 },
    ];
    const restored: Rec = { id: 'b', createdAt: 3 };
    expect(restoreById(list, restored)).toEqual([
      restored,
      { id: 'a', createdAt: 5 },
      { id: 'c', createdAt: 1 },
    ]);
  });

  // recipes.tsx and starters.tsx sort the whole list by createdAt descending on
  // restore, so an old record restored after newer ones were added lands back
  // in its chronological place rather than jumping to the very front.
  it('with a comparator, sorts the full result (and still dedupes)', () => {
    const list: Rec[] = [
      { id: 'a', createdAt: 5 },
      { id: 'c', createdAt: 1 },
    ];
    const restored: Rec = { id: 'b', createdAt: 3 };
    const byCreatedAtDesc = (x: Rec, y: Rec) => y.createdAt - x.createdAt;
    expect(restoreById(list, restored, byCreatedAtDesc)).toEqual([
      { id: 'a', createdAt: 5 },
      { id: 'b', createdAt: 3 },
      { id: 'c', createdAt: 1 },
    ]);

    const dupList: Rec[] = [
      { id: 'a', createdAt: 5 },
      { id: 'b', createdAt: 1 },
    ];
    const dupRestored: Rec = { id: 'b', createdAt: 1 };
    const result = restoreById(dupList, dupRestored, byCreatedAtDesc);
    expect(result).toEqual([
      { id: 'a', createdAt: 5 },
      { id: 'b', createdAt: 1 },
    ]);
  });
});
