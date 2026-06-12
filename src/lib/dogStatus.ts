import { FEEDING_THRESHOLDS, type FeedingStatus } from '@/constants/feeding';
import { palette } from '@/constants/palette';

const HOUR_MS = 3_600_000;

export function getFeedingStatus(lastFedAt: string | null | undefined, now = Date.now()): FeedingStatus {
  if (!lastFedAt) return 'red';
  const hours = (now - new Date(lastFedAt).getTime()) / HOUR_MS;
  if (hours < FEEDING_THRESHOLDS.fedRecentlyHours) return 'green';
  if (hours < FEEDING_THRESHOLDS.feedingDueHours) return 'yellow';
  return 'red';
}

export const FEEDING_STATUS_COLOR: Record<FeedingStatus, string> = {
  green: palette.status.fedRecently,
  yellow: palette.status.feedingDue,
  red: palette.status.notFed,
};

export const FEEDING_STATUS_LABEL: Record<FeedingStatus, string> = {
  green: 'Fed recently',
  yellow: 'Feeding due',
  red: 'Needs food',
};

/** Minimal shape needed to derive a dog's display color — matches `dogs` row columns. */
export interface DogStatusLike {
  status: string;
  health_status: string;
  has_active_emergency: boolean;
  last_fed_at: string | null;
}

/**
 * Single source of marker/list color priority:
 * emergency > injured/sick > missing > feeding staleness.
 */
export function getMarkerColor(dog: DogStatusLike, now = Date.now()): string {
  if (dog.has_active_emergency) return palette.status.emergency;
  if (dog.health_status === 'injured' || dog.health_status === 'sick') return palette.status.injured;
  if (dog.status === 'missing') return palette.status.missing;
  return FEEDING_STATUS_COLOR[getFeedingStatus(dog.last_fed_at, now)];
}
