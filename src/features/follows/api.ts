import { supabase } from '@/lib/supabase';

/** RLS scopes animal_follows reads to the signed-in user. */
export async function fetchMyFollowedAnimalIds(): Promise<string[]> {
  const { data, error } = await supabase.from('animal_follows').select('animal_id');
  if (error) throw error;
  return data.map((row) => row.animal_id);
}

export async function followAnimal(userId: string, animalId: string): Promise<void> {
  const { error } = await supabase.from('animal_follows').insert({ user_id: userId, animal_id: animalId });
  if (error && error.code !== '23505') throw error; // ignore double-follow
}

export async function unfollowAnimal(userId: string, animalId: string): Promise<void> {
  const { error } = await supabase.from('animal_follows').delete().match({ user_id: userId, animal_id: animalId });
  if (error) throw error;
}
