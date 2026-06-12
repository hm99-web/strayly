import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { keys } from '@/constants/queryKeys';
import { useAuth } from '@/hooks/useAuth';

import { fetchMySettings, fetchProfile, updateMySettings, updateProfile } from './api';

export function useMyProfile() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: keys.profile(userId ?? 'none'),
    queryFn: () => fetchProfile(userId!),
    enabled: userId != null,
  });
}

export function useUpdateMyProfile() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof updateProfile>[1]) => updateProfile(userId!, patch),
    onSettled: () => {
      if (userId) void queryClient.invalidateQueries({ queryKey: keys.profile(userId) });
    },
  });
}

export function useMySettings() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: keys.mySettings(userId ?? 'none'),
    queryFn: () => fetchMySettings(userId!),
    enabled: userId != null,
  });
}

export function useUpdateMySettings() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof updateMySettings>[1]) => updateMySettings(userId!, patch),
    onSettled: () => {
      if (userId) void queryClient.invalidateQueries({ queryKey: keys.mySettings(userId) });
    },
  });
}
