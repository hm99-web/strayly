import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { regionToBbox, type MapRegion } from '@/components/map/DogMap.types';
import { keys } from '@/constants/queryKeys';
import type { DogFilters } from '@/stores/mapStore';
import type { LatLng } from '@/types/domain';

import {
  addDogPhoto,
  checkDuplicates,
  createDog,
  fetchDog,
  fetchDogPhotos,
  searchDogsByRadius,
  searchDogsInBbox,
  updateDog,
  type CreateDogInput,
} from './api';

export function useDogsInRadius(params: {
  center: LatLng;
  radiusM: number;
  filters: DogFilters;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: keys.dogs.radius({
      lat: Number(params.center.latitude.toFixed(4)),
      lng: Number(params.center.longitude.toFixed(4)),
      radiusM: params.radiusM,
      filters: params.filters,
    }),
    queryFn: () => searchDogsByRadius(params),
    placeholderData: keepPreviousData,
    enabled: params.enabled !== false,
  });
}

/** Viewport query for the map. Bbox snapped to 3 decimals for cache reuse. */
export function useDogsInBbox(region: MapRegion | null, filters: DogFilters) {
  const bbox = region ? regionToBbox(region) : null;
  const tileKey = bbox
    ? [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat].map((v) => v.toFixed(3)).join(',')
    : 'none';
  return useQuery({
    queryKey: keys.dogs.bbox(tileKey, filters),
    queryFn: () => searchDogsInBbox({ ...bbox!, filters }),
    enabled: bbox != null,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useDog(dogId: string) {
  return useQuery({
    queryKey: keys.dogs.detail(dogId),
    queryFn: () => fetchDog(dogId),
  });
}

export function useDogPhotos(dogId: string) {
  return useQuery({
    queryKey: keys.dogs.photos(dogId),
    queryFn: () => fetchDogPhotos(dogId),
  });
}

export function useDuplicateCheck(point: LatLng | null, gender?: string) {
  return useQuery({
    queryKey: point ? keys.dogs.duplicates(point.latitude, point.longitude) : ['dogs', 'duplicates', 'none'],
    queryFn: () => checkDuplicates(point!, gender),
    enabled: point != null,
    staleTime: 30_000,
  });
}

export function useCreateDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDogInput) => createDog(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.dogs.all });
    },
  });
}

export function useUpdateDog(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof updateDog>[1]) => updateDog(dogId, patch),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.dogs.detail(dogId) });
      void queryClient.invalidateQueries({ queryKey: keys.dogs.timeline(dogId) });
    },
  });
}

export function useAddDogPhoto(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ image, caption }: { image: Parameters<typeof addDogPhoto>[1]; caption?: string }) =>
      addDogPhoto(dogId, image, caption),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.dogs.photos(dogId) });
      void queryClient.invalidateQueries({ queryKey: keys.dogs.detail(dogId) });
      void queryClient.invalidateQueries({ queryKey: keys.dogs.timeline(dogId) });
    },
  });
}
