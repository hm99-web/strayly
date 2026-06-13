import type { AnimalFilters } from '@/stores/mapStore';

/**
 * Query key factory — ALL TanStack keys come from here so invalidation
 * never misses a spelling.
 */
export const keys = {
  profile: (userId: string) => ['profile', userId] as const,
  mySettings: (userId: string) => ['settings', userId] as const,
  animals: {
    all: ['animals'] as const,
    radius: (params: { lat: number; lng: number; radiusM: number; filters: AnimalFilters }) =>
      ['animals', 'radius', params] as const,
    bbox: (tileKey: string, filters: AnimalFilters) => ['animals', 'bbox', tileKey, filters] as const,
    detail: (animalId: string) => ['animals', 'detail', animalId] as const,
    photos: (animalId: string) => ['animals', 'photos', animalId] as const,
    timeline: (animalId: string) => ['animals', 'timeline', animalId] as const,
    feedings: (animalId: string) => ['animals', 'feedings', animalId] as const,
    vaccinations: (animalId: string) => ['animals', 'vaccinations', animalId] as const,
    medical: (animalId: string) => ['animals', 'medical', animalId] as const,
    duplicates: (lat: number, lng: number) =>
      ['animals', 'duplicates', Number(lat.toFixed(5)), Number(lng.toFixed(5))] as const,
  },
  emergencies: {
    open: ['emergencies', 'open'] as const,
    detail: (id: string) => ['emergencies', 'detail', id] as const,
    forDog: (animalId: string) => ['emergencies', 'animal', animalId] as const,
  },
  notifications: {
    list: (userId: string) => ['notifications', 'list', userId] as const,
    unreadCount: (userId: string) => ['notifications', 'unread', userId] as const,
  },
  follows: {
    mine: (userId: string) => ['follows', userId] as const,
  },
} as const;
