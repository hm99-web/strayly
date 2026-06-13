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

/** Minimal shape needed to derive a animal's display color — matches `dogs` row columns. */
export interface AnimalStatusLike {
  status: string;
  health_status: string;
  has_active_emergency: boolean;
  last_fed_at: string | null;
}

export interface AnimalBadgeLike extends AnimalStatusLike {
  species: string;
  vaccination_status: string;
  sterilization_status: string;
  has_babies: boolean;
}

export interface BadgeDescriptor {
  key: string;
  label: string;
  /** Hex background; badges always render white text. */
  color: string;
}

/** Single source of badge derivation for cards, markers callouts and detail. */
export function getBadges(animal: AnimalBadgeLike): BadgeDescriptor[] {
  const badges: BadgeDescriptor[] = [];
  if (animal.has_active_emergency) {
    badges.push({ key: 'emergency', label: 'Emergency', color: palette.status.emergency });
  }
  if (animal.status === 'missing') {
    badges.push({ key: 'missing', label: 'Missing', color: palette.status.missing });
  }
  if (animal.health_status === 'injured' || animal.health_status === 'sick') {
    badges.push({
      key: animal.health_status,
      label: animal.health_status === 'injured' ? 'Injured' : 'Sick',
      color: palette.status.injured,
    });
  }
  if (animal.health_status === 'pregnant') {
    badges.push({ key: 'pregnant', label: 'Pregnant', color: palette.badge.pregnant });
  }
  if (animal.has_babies || animal.health_status === 'nursing') {
    badges.push({
      key: 'babies',
      label: animal.species === 'cat' ? 'Kittens' : 'Puppies',
      color: palette.badge.puppies,
    });
  }
  if (animal.vaccination_status === 'yes') {
    badges.push({ key: 'vaccinated', label: 'Vaccinated', color: palette.badge.vaccinated });
  }
  if (animal.sterilization_status === 'yes') {
    badges.push({ key: 'sterilized', label: 'Sterilized', color: palette.badge.sterilized });
  }
  return badges;
}

/**
 * Single source of marker/list color priority:
 * emergency > injured/sick > missing > feeding staleness.
 */
export function getMarkerColor(animal: AnimalStatusLike, now = Date.now()): string {
  if (animal.has_active_emergency) return palette.status.emergency;
  if (animal.health_status === 'injured' || animal.health_status === 'sick') return palette.status.injured;
  if (animal.status === 'missing') return palette.status.missing;
  return FEEDING_STATUS_COLOR[getFeedingStatus(animal.last_fed_at, now)];
}
