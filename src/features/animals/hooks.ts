import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { regionToBbox, type MapRegion } from '@/components/map/AnimalMap.types';
import { keys } from '@/constants/queryKeys';
import type { AnimalFilters } from '@/stores/mapStore';
import type { LatLng, Species } from '@/types/domain';

import {
  addAnimalPhoto,
  checkDuplicates,
  createAnimal,
  fetchAnimal,
  fetchAnimalPhotos,
  fetchAnimalTimeline,
  searchAnimalsByRadius,
  searchAnimalsInBbox,
  TIMELINE_PAGE_SIZE,
  updateAnimal,
  type CreateAnimalInput,
} from './api';

/** Keyset-paginated merged timeline (activity_logs via get_animal_timeline). */
export function useAnimalTimeline(animalId: string) {
  return useInfiniteQuery({
    queryKey: keys.animals.timeline(animalId),
    queryFn: ({ pageParam }) => fetchAnimalTimeline(animalId, pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.length === TIMELINE_PAGE_SIZE ? lastPage[lastPage.length - 1].id : undefined,
  });
}

export function useAnimalsInRadius(params: {
  center: LatLng;
  radiusM: number;
  filters: AnimalFilters;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: keys.animals.radius({
      lat: Number(params.center.latitude.toFixed(4)),
      lng: Number(params.center.longitude.toFixed(4)),
      radiusM: params.radiusM,
      filters: params.filters,
    }),
    queryFn: () => searchAnimalsByRadius(params),
    placeholderData: keepPreviousData,
    enabled: params.enabled !== false,
  });
}

/** Viewport query for the map. Bbox snapped to 3 decimals for cache reuse. */
export function useAnimalsInBbox(region: MapRegion | null, filters: AnimalFilters) {
  const bbox = region ? regionToBbox(region) : null;
  const tileKey = bbox
    ? [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat].map((v) => v.toFixed(3)).join(',')
    : 'none';
  return useQuery({
    queryKey: keys.animals.bbox(tileKey, filters),
    queryFn: () => searchAnimalsInBbox({ ...bbox!, filters }),
    enabled: bbox != null,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useDog(animalId: string) {
  return useQuery({
    queryKey: keys.animals.detail(animalId),
    queryFn: () => fetchAnimal(animalId),
  });
}

export function useAnimalPhotos(animalId: string) {
  return useQuery({
    queryKey: keys.animals.photos(animalId),
    queryFn: () => fetchAnimalPhotos(animalId),
  });
}

export function useDuplicateCheck(point: LatLng | null, species?: Species, gender?: string) {
  return useQuery({
    queryKey: point
      ? [...keys.animals.duplicates(point.latitude, point.longitude), species ?? 'any']
      : ['animals', 'duplicates', 'none'],
    queryFn: () => checkDuplicates(point!, species, gender),
    enabled: point != null,
    staleTime: 30_000,
  });
}

export function useCreateAnimal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnimalInput) => createAnimal(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.animals.all });
    },
  });
}

export function useUpdateAnimal(animalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof updateAnimal>[1]) => updateAnimal(animalId, patch),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.animals.detail(animalId) });
      void queryClient.invalidateQueries({ queryKey: keys.animals.timeline(animalId) });
    },
  });
}

export function useAddAnimalPhoto(animalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ image, caption }: { image: Parameters<typeof addAnimalPhoto>[1]; caption?: string }) =>
      addAnimalPhoto(animalId, image, caption),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.animals.photos(animalId) });
      void queryClient.invalidateQueries({ queryKey: keys.animals.detail(animalId) });
      void queryClient.invalidateQueries({ queryKey: keys.animals.timeline(animalId) });
    },
  });
}
