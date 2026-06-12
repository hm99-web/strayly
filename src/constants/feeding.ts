/**
 * Feeding staleness thresholds.
 * MUST stay in sync with fn_feeding_status() in supabase/migrations/..._rpcs.sql —
 * these two places are the only definitions of the thresholds.
 */
export const FEEDING_THRESHOLDS = {
  /** Fed within this many hours → green ("fed recently"). */
  fedRecentlyHours: 24,
  /** Fed within this many hours (but beyond fedRecentlyHours) → yellow ("due"). Beyond → red. */
  feedingDueHours: 72,
} as const;

export type FeedingStatus = 'green' | 'yellow' | 'red';
