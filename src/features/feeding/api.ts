import { compressAndUpload, type PickedImage } from '@/lib/images';
import { getCurrentPosition } from '@/lib/location';
import { supabase } from '@/lib/supabase';
import { toWkt, type FeedingRecord, type FoodType } from '@/types/domain';

export interface MarkFedInput {
  animalId: string;
  foodType: FoodType;
  foodTypeOther?: string;
  notes?: string;
  photo?: PickedImage;
}

export async function markFed(input: MarkFedInput): Promise<void> {
  let photoPath: string | null = null;
  if (input.photo) {
    const uploaded = await compressAndUpload('animal-media', `${input.animalId}/feedings`, input.photo);
    photoPath = uploaded.path;
  }

  // Feeding position doubles as a sighting (trigger records animal_locations).
  const position = await getCurrentPosition();

  const { error } = await supabase.from('feeding_records').insert({
    animal_id: input.animalId,
    food_type: input.foodType,
    food_type_other: input.foodTypeOther || null,
    notes: input.notes || null,
    photo_path: photoPath,
    location: position ? toWkt(position) : null,
  });
  if (error) throw error;
}

export async function fetchFeedingHistory(animalId: string, limit = 30): Promise<FeedingRecord[]> {
  const { data, error } = await supabase
    .from('feeding_records')
    .select('*')
    .eq('animal_id', animalId)
    .order('fed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
