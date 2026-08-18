// Free tier limits. Reaching them sends the baker to the Pro paywall.
export const FREE_RECIPE_LIMIT = 5;
export const FREE_STARTER_LIMIT = 1;
/** Timers at once. A finished timer has given its slot back already. */
export const FREE_TIMER_LIMIT = 1;

/**
 * Whether a free baker has reached a cap.
 *
 * The gate only ever blocks adding something new. A collection that is already
 * over the cap, from before the limit existed or from a lapsed entitlement, is
 * left alone: nothing is hidden and nothing is deleted.
 */
export function atLimit(count: number, limit: number, isPro: boolean): boolean {
  return !isPro && count >= limit;
}
