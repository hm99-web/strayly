import { create } from 'zustand';

import { DEFAULT_CENTER, DEFAULT_RADIUS_M } from '@/constants/config';
import type { FeedingStatus } from '@/constants/feeding';
import type { DogHealthStatus, LatLng, TriState } from '@/types/domain';

/** Shared by Map + Dogs tabs; maps 1:1 onto the RPC filter params. */
export interface DogFilters {
  feedingStatus?: FeedingStatus;
  vaccinated?: TriState;
  sterilized?: TriState;
  health: DogHealthStatus[];
  emergencyOnly?: boolean;
  puppies?: boolean;
}

export const EMPTY_FILTERS: DogFilters = { health: [] };

export function countActiveFilters(f: DogFilters): number {
  return (
    (f.feedingStatus ? 1 : 0) +
    (f.vaccinated ? 1 : 0) +
    (f.sterilized ? 1 : 0) +
    f.health.length +
    (f.emergencyOnly ? 1 : 0) +
    (f.puppies ? 1 : 0)
  );
}

interface MapState {
  /** Center used for discovery queries: user GPS, searched address, or manual pick. */
  searchCenter: LatLng;
  /** Human-readable label for the current searchCenter ('Near you', address, …). */
  searchLabel: string;
  /** True when searchCenter came from the device GPS. */
  followingUser: boolean;
  radiusM: number;
  filters: DogFilters;
  setSearchCenter: (center: LatLng, label: string, followingUser?: boolean) => void;
  setRadiusM: (radiusM: number) => void;
  setFilters: (filters: DogFilters) => void;
  resetFilters: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  searchCenter: DEFAULT_CENTER,
  searchLabel: 'Bengaluru',
  followingUser: false,
  radiusM: DEFAULT_RADIUS_M,
  filters: EMPTY_FILTERS,
  setSearchCenter: (searchCenter, searchLabel, followingUser = false) =>
    set({ searchCenter, searchLabel, followingUser }),
  setRadiusM: (radiusM) => set({ radiusM }),
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: EMPTY_FILTERS }),
}));
