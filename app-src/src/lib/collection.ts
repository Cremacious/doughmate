// Shared list transforms for id-keyed records (recipes, starters, bakes). An
// undo handler lives inside a toast, which holds the callback from the render
// that raised it — restoring blindly into "whatever list that render saw"
// could put a record back into a list that already held it, leaving two
// records sharing one id (duplicate React keys, edits landing on the wrong
// record). Centralising the dedupe here means every provider gets it for
// free instead of reimplementing it, correctly or not.

export interface Identifiable {
  id: string;
}

/** Drop the record with this id, if present. A no-op if it isn't. */
export function removeById<T extends Identifiable>(list: T[], id: string): T[] {
  return list.filter((item) => item.id !== id);
}

/**
 * Put a record back into a list. Idempotent: any record already holding this
 * id is dropped first, so a double tap on undo can't produce a duplicate.
 *
 * Without `compare`, the restored record is simply moved to the front. With
 * `compare`, the full result is sorted by it afterwards — for providers that
 * restore a record to its chronological place rather than the very front.
 */
export function restoreById<T extends Identifiable>(
  list: T[],
  record: T,
  compare?: (a: T, b: T) => number
): T[] {
  const deduped = [record, ...removeById(list, record.id)];
  return compare ? deduped.sort(compare) : deduped;
}
