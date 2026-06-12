import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';

import { keys } from '@/constants/queryKeys';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_PAGE_SIZE,
} from './api';

export function useNotifications() {
  const { userId } = useAuth();
  return useInfiniteQuery({
    queryKey: keys.notifications.list(userId ?? 'none'),
    queryFn: ({ pageParam }) => fetchNotifications(pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.length === NOTIFICATIONS_PAGE_SIZE ? lastPage[lastPage.length - 1].id : undefined,
    enabled: userId != null,
  });
}

export function useUnreadCount() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: keys.notifications.unreadCount(userId ?? 'none'),
    queryFn: fetchUnreadCount,
    enabled: userId != null,
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSettled: () => {
      if (!userId) return;
      void queryClient.invalidateQueries({ queryKey: keys.notifications.list(userId) });
      void queryClient.invalidateQueries({ queryKey: keys.notifications.unreadCount(userId) });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSettled: () => {
      if (!userId) return;
      void queryClient.invalidateQueries({ queryKey: keys.notifications.list(userId) });
      void queryClient.invalidateQueries({ queryKey: keys.notifications.unreadCount(userId) });
    },
  });
}

/** Live inbox: refresh list + badge whenever a notification row arrives. */
export function useNotificationsRealtime() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: keys.notifications.list(userId) });
          void queryClient.invalidateQueries({ queryKey: keys.notifications.unreadCount(userId) });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
