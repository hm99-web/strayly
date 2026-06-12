import type { DogFilters } from '@/stores/mapStore';

/**
 * Query key factory — ALL TanStack keys come from here so invalidation
 * never misses a spelling.
 */
export const keys = {
  profile: (userId: string) => ['profile', userId] as const,
  mySettings: (userId: string) => ['settings', userId] as const,
  dogs: {
    all: ['dogs'] as const,
    radius: (params: { lat: number; lng: number; radiusM: number; filters: DogFilters }) =>
      ['dogs', 'radius', params] as const,
    bbox: (tileKey: string, filters: DogFilters) => ['dogs', 'bbox', tileKey, filters] as const,
    detail: (dogId: string) => ['dogs', 'detail', dogId] as const,
    photos: (dogId: string) => ['dogs', 'photos', dogId] as const,
    timeline: (dogId: string) => ['dogs', 'timeline', dogId] as const,
    feedings: (dogId: string) => ['dogs', 'feedings', dogId] as const,
    vaccinations: (dogId: string) => ['dogs', 'vaccinations', dogId] as const,
    medical: (dogId: string) => ['dogs', 'medical', dogId] as const,
    duplicates: (lat: number, lng: number) =>
      ['dogs', 'duplicates', Number(lat.toFixed(5)), Number(lng.toFixed(5))] as const,
  },
  emergencies: {
    open: ['emergencies', 'open'] as const,
    detail: (id: string) => ['emergencies', 'detail', id] as const,
    forDog: (dogId: string) => ['emergencies', 'dog', dogId] as const,
  },
  notifications: {
    list: (userId: string) => ['notifications', 'list', userId] as const,
    unreadCount: (userId: string) => ['notifications', 'unread', userId] as const,
  },
  follows: {
    mine: (userId: string) => ['follows', userId] as const,
  },
} as const;
