// Ingredient substitutions (data/substitutions.json). Lookup only, no math.
//
// The file ships two sets. Free bakers get the everyday swaps; Pro adds the
// long tail: dairy free, gluten free, egg replacers by purpose, sugar
// conversions, and the UK and US names for the same ingredient. Callers pass
// their entitlement rather than reading it here, so this stays pure and
// testable.
import subsData from '../data/substitutions.json';

export interface Substitution {
  id: string;
  missing: string;
  amount: string;
  substitute: string;
  notes: string;
}

interface SubstitutionsFile {
  free: Substitution[];
  pro: Substitution[];
}

const { free, pro } = subsData as unknown as SubstitutionsFile;
const all = [...free, ...pro];

/** How many extra swaps Pro unlocks, for the upgrade prompt. */
export const PRO_SUBSTITUTION_COUNT = pro.length;

export function listSubstitutions(isPro: boolean): Substitution[] {
  return isPro ? all : free;
}

/** Search by what you are missing, the substitute, or the notes. */
export function searchSubstitutions(query: string, isPro: boolean): Substitution[] {
  const q = query.trim().toLowerCase();
  return listSubstitutions(isPro).filter((s) =>
    `${s.missing} ${s.substitute} ${s.notes}`.toLowerCase().includes(q)
  );
}
