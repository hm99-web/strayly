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

export interface DogBadgeLike extends DogStatusLike {
  vaccination_status: string;
  sterilization_status: string;
  has_puppies: boolean;
}

export interface BadgeDescriptor {
  key: string;
  label: string;
  /** Hex background; badges always render white text. */
  color: string;
}

/** Single source of badge derivation for cards, markers callouts and detail. */
export function getBadges(dog: DogBadgeLike): BadgeDescriptor[] {
  const badges: BadgeDescriptor[] = [];
  if (dog.has_active_emergency) {
    badges.push({ key: 'emergency', label: 'Emergency', color: palette.status.emergency });
  }
  if (dog.status === 'missing') {
    badges.push({ key: 'missing', label: 'Missing', color: palette.status.missing });
  }
  if (dog.health_status === 'injured' || dog.health_status === 'sick') {
    badges.push({
      key: dog.health_status,
      label: dog.health_status === 'injured' ? 'Injured' : 'Sick',
      color: palette.status.injured,
    });
  }
  if (dog.health_status === 'pregnant') {
    badges.push({ key: 'pregnant', label: 'Pregnant', color: palette.badge.pregnant });
  }
  if (dog.has_puppies || dog.health_status === 'nursing') {
    badges.push({ key: 'puppies', label: 'Puppies', color: palette.badge.puppies });
  }
  if (dog.vaccination_status === 'yes') {
    badges.push({ key: 'vaccinated', label: 'Vaccinated', color: palette.badge.vaccinated });
  }
  if (dog.sterilization_status === 'yes') {
    badges.push({ key: 'sterilized', label: 'Sterilized', color: palette.badge.sterilized });
  }
  return badges;
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
