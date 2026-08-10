// Free-tier ingredient substitutions (data/substitutions.json). Lookup only,
// no math. Pro adds more later.
import subsData from '../data/substitutions.json';

export interface Substitution {
  id: string;
  missing: string;
  amount: string;
  substitute: string;
  notes: string;
}

const subs = (subsData as { free: Substitution[] }).free;

export function listSubstitutions(): Substitution[] {
  return subs;
}

/** Search by what you are missing, the substitute, or the notes. */
export function searchSubstitutions(query: string): Substitution[] {
  const q = query.trim().toLowerCase();
  return subs.filter((s) => `${s.missing} ${s.substitute} ${s.notes}`.toLowerCase().includes(q));
}
