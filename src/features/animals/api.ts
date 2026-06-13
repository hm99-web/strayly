import { compressAndUpload, type PickedImage } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import type { AnimalFilters } from '@/stores/mapStore';
import type { Database } from '@/types/database';
import { toWkt, type Animal, type AnimalPhoto, type AnimalSummary, type DuplicateMatch, type LatLng, type Species } from '@/types/domain';

type RadiusArgs = Database['public']['Functions']['animals_within_radius']['Args'];
type BboxArgs = Database['public']['Functions']['animals_in_bbox']['Args'];

function filterArgs(filters: AnimalFilters) {
  return {
    p_species: filters.species ?? undefined,
    p_feeding_status: filters.feedingStatus ?? undefined,
    p_vaccinated: filters.vaccinated ?? undefined,
    p_sterilized: filters.sterilized ?? undefined,
    p_health: filters.health.length > 0 ? filters.health : undefined,
    p_has_emergency: filters.emergencyOnly ? true : undefined,
    p_puppies: filters.puppies ? true : undefined,
  };
}

export async function searchAnimalsByRadius(params: {
  center: LatLng;
  radiusM: number;
  filters: AnimalFilters;
  limit?: number;
  offset?: number;
}): Promise<AnimalSummary[]> {
  const args: RadiusArgs = {
    p_lat: params.center.latitude,
    p_lng: params.center.longitude,
    p_radius_m: params.radiusM,
    p_limit: params.limit ?? 100,
    p_offset: params.offset ?? 0,
    ...filterArgs(params.filters),
  };
  const { data, error } = await supabase.rpc('animals_within_radius', args);
  if (error) throw error;
  return data;
}

export async function searchAnimalsInBbox(params: {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
  filters: AnimalFilters;
}): Promise<AnimalSummary[]> {
  const args: BboxArgs = {
    p_min_lng: params.minLng,
    p_min_lat: params.minLat,
    p_max_lng: params.maxLng,
    p_max_lat: params.maxLat,
    ...filterArgs(params.filters),
  };
  const { data, error } = await supabase.rpc('animals_in_bbox', args);
  if (error) throw error;
  return data;
}

export async function fetchAnimal(animalId: string): Promise<Animal> {
  const { data, error } = await supabase.from('animals').select('*').eq('id', animalId).single();
  if (error) throw error;
  return data;
}

export async function fetchAnimalPhotos(animalId: string): Promise<AnimalPhoto[]> {
  const { data, error } = await supabase
    .from('animal_photos')
    .select('*')
    .eq('animal_id', animalId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data;
}

export async function checkDuplicates(point: LatLng, species?: Species, gender?: string): Promise<DuplicateMatch[]> {
  const { data, error } = await supabase.rpc('nearby_duplicate_check', {
    p_lat: point.latitude,
    p_lng: point.longitude,
    p_species: species ?? undefined,
    p_gender: (gender as DuplicateMatch['gender']) ?? undefined,
  });
  if (error) throw error;
  return data;
}

export interface CreateAnimalInput {
  insert: Omit<Database['public']['Tables']['animals']['Insert'], 'location' | 'created_by'>;
  point: LatLng;
  photos: PickedImage[];
}

export async function createAnimal(input: CreateAnimalInput): Promise<string> {
  const { data, error } = await supabase
    .from('animals')
    .insert({ ...input.insert, location: toWkt(input.point) })
    .select('id')
    .single();
  if (error) throw error;

  // Photo failures must not lose the animal — upload best-effort after insert.
  for (const photo of input.photos) {
    try {
      await addAnimalPhoto(data.id, photo);
    } catch (e) {
      console.warn('[animals] photo upload failed', e);
    }
  }
  return data.id;
}

export async function addAnimalPhoto(animalId: string, image: PickedImage, caption?: string): Promise<void> {
  const uploaded = await compressAndUpload('animal-media', `${animalId}/photos`, image);
  const { error } = await supabase.from('animal_photos').insert({
    animal_id: animalId,
    storage_path: uploaded.path,
    thumb_path: uploaded.thumbPath,
    width: uploaded.width,
    height: uploaded.height,
    caption: caption ?? null,
  });
  if (error) throw error;
}

export async function updateAnimal(
  animalId: string,
  patch: Database['public']['Tables']['animals']['Update'],
): Promise<void> {
  const { error } = await supabase.from('animals').update(patch).eq('id', animalId);
  if (error) throw error;
}

export const TIMELINE_PAGE_SIZE = 25;

export async function fetchAnimalTimeline(animalId: string, beforeId: number | null) {
  const { data, error } = await supabase.rpc('get_animal_timeline', {
    p_animal_id: animalId,
    p_before_id: beforeId ?? undefined,
    p_limit: TIMELINE_PAGE_SIZE,
  });
  if (error) throw error;
  return data;
}

/** Standalone "I saw them here" sighting. */
export async function reportSighting(animalId: string, point: LatLng, note?: string): Promise<void> {
  const { error } = await supabase.from('animal_locations').insert({
    animal_id: animalId,
    location: toWkt(point),
    source: 'sighting',
    note: note ?? null,
  });
  if (error) throw error;
}
