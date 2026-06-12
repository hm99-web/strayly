import { supabase } from '@/lib/supabase';
import type { Profile, UserSettings } from '@/types/domain';

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  patch: { display_name?: string; username?: string | null; bio?: string | null; avatar_path?: string | null },
): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export async function fetchMySettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateMySettings(
  userId: string,
  patch: Partial<Omit<UserSettings, 'user_id' | 'updated_at'>>,
): Promise<void> {
  const { error } = await supabase.from('user_settings').update(patch).eq('user_id', userId);
  if (error) throw error;
}
