import { supabase } from '@/lib/supabase';

/** RLS scopes dog_follows reads to the signed-in user. */
export async function fetchMyFollowedDogIds(): Promise<string[]> {
  const { data, error } = await supabase.from('dog_follows').select('dog_id');
  if (error) throw error;
  return data.map((row) => row.dog_id);
}

export async function followDog(userId: string, dogId: string): Promise<void> {
  const { error } = await supabase.from('dog_follows').insert({ user_id: userId, dog_id: dogId });
  if (error && error.code !== '23505') throw error; // ignore double-follow
}

export async function unfollowDog(userId: string, dogId: string): Promise<void> {
  const { error } = await supabase.from('dog_follows').delete().match({ user_id: userId, dog_id: dogId });
  if (error) throw error;
}
