import { supabase } from '@/lib/supabase';
import type { AppNotification } from '@/types/domain';

export const NOTIFICATIONS_PAGE_SIZE = 30;

export async function fetchNotifications(beforeId: number | null): Promise<AppNotification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('id', { ascending: false })
    .limit(NOTIFICATIONS_PAGE_SIZE);
  if (beforeId != null) query = query.lt('id', beforeId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null);
  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(id: number): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase.rpc('mark_all_notifications_read');
  if (error) throw error;
}
