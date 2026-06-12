import { compressAndUpload, type PickedImage } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import type { DogFilters } from '@/stores/mapStore';
import type { Database } from '@/types/database';
import { toWkt, type Dog, type DogPhoto, type DogSummary, type DuplicateMatch, type LatLng } from '@/types/domain';

type RadiusArgs = Database['public']['Functions']['dogs_within_radius']['Args'];
type BboxArgs = Database['public']['Functions']['dogs_in_bbox']['Args'];

function filterArgs(filters: DogFilters) {
  return {
    p_feeding_status: filters.feedingStatus ?? null,
    p_vaccinated: filters.vaccinated ?? null,
    p_sterilized: filters.sterilized ?? null,
    p_health: filters.health.length > 0 ? filters.health : null,
    p_has_emergency: filters.emergencyOnly ? true : null,
    p_puppies: filters.puppies ? true : null,
  };
}

export async function searchDogsByRadius(params: {
  center: LatLng;
  radiusM: number;
  filters: DogFilters;
  limit?: number;
  offset?: number;
}): Promise<DogSummary[]> {
  const args: RadiusArgs = {
    p_lat: params.center.latitude,
    p_lng: params.center.longitude,
    p_radius_m: params.radiusM,
    p_limit: params.limit ?? 100,
    p_offset: params.offset ?? 0,
    ...filterArgs(params.filters),
  };
  const { data, error } = await supabase.rpc('dogs_within_radius', args);
  if (error) throw error;
  return data;
}

export async function searchDogsInBbox(params: {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
  filters: DogFilters;
}): Promise<DogSummary[]> {
  const args: BboxArgs = {
    p_min_lng: params.minLng,
    p_min_lat: params.minLat,
    p_max_lng: params.maxLng,
    p_max_lat: params.maxLat,
    ...filterArgs(params.filters),
  };
  const { data, error } = await supabase.rpc('dogs_in_bbox', args);
  if (error) throw error;
  return data;
}

export async function fetchDog(dogId: string): Promise<Dog> {
  const { data, error } = await supabase.from('dogs').select('*').eq('id', dogId).single();
  if (error) throw error;
  return data;
}

export async function fetchDogPhotos(dogId: string): Promise<DogPhoto[]> {
  const { data, error } = await supabase
    .from('dog_photos')
    .select('*')
    .eq('dog_id', dogId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data;
}

export async function checkDuplicates(point: LatLng, gender?: string): Promise<DuplicateMatch[]> {
  const { data, error } = await supabase.rpc('nearby_duplicate_check', {
    p_lat: point.latitude,
    p_lng: point.longitude,
    p_gender: (gender as DuplicateMatch['gender']) ?? null,
  });
  if (error) throw error;
  return data;
}

export interface CreateDogInput {
  insert: Omit<Database['public']['Tables']['dogs']['Insert'], 'location' | 'created_by'>;
  point: LatLng;
  photos: PickedImage[];
}

export async function createDog(input: CreateDogInput): Promise<string> {
  const { data, error } = await supabase
    .from('dogs')
    .insert({ ...input.insert, location: toWkt(input.point) })
    .select('id')
    .single();
  if (error) throw error;

  // Photo failures must not lose the dog — upload best-effort after insert.
  for (const photo of input.photos) {
    try {
      await addDogPhoto(data.id, photo);
    } catch (e) {
      console.warn('[dogs] photo upload failed', e);
    }
  }
  return data.id;
}

export async function addDogPhoto(dogId: string, image: PickedImage, caption?: string): Promise<void> {
  const uploaded = await compressAndUpload('dog-media', `${dogId}/photos`, image);
  const { error } = await supabase.from('dog_photos').insert({
    dog_id: dogId,
    storage_path: uploaded.path,
    thumb_path: uploaded.thumbPath,
    width: uploaded.width,
    height: uploaded.height,
    caption: caption ?? null,
  });
  if (error) throw error;
}

export async function updateDog(
  dogId: string,
  patch: Database['public']['Tables']['dogs']['Update'],
): Promise<void> {
  const { error } = await supabase.from('dogs').update(patch).eq('id', dogId);
  if (error) throw error;
}

export const TIMELINE_PAGE_SIZE = 25;

export async function fetchDogTimeline(dogId: string, beforeId: number | null) {
  const { data, error } = await supabase.rpc('get_dog_timeline', {
    p_dog_id: dogId,
    p_before_id: beforeId,
    p_limit: TIMELINE_PAGE_SIZE,
  });
  if (error) throw error;
  return data;
}

/** Standalone "I saw this dog here" sighting. */
export async function reportSighting(dogId: string, point: LatLng, note?: string): Promise<void> {
  const { error } = await supabase.from('dog_locations').insert({
    dog_id: dogId,
    location: toWkt(point),
    source: 'sighting',
    note: note ?? null,
  });
  if (error) throw error;
}
