import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { keys } from '@/constants/queryKeys';
import { useAuth } from '@/hooks/useAuth';

import { fetchMyFollowedAnimalIds, followAnimal, unfollowAnimal } from './api';

export function useMyFollows() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: keys.follows.mine(userId ?? 'none'),
    queryFn: fetchMyFollowedAnimalIds,
    enabled: userId != null,
    select: (ids) => new Set(ids),
  });
}

/** Optimistic follow/unfollow — the heart flips instantly. */
export function useToggleFollow(animalId: string) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const followsKey = keys.follows.mine(userId ?? 'none');

  return useMutation({
    mutationFn: async (shouldFollow: boolean) => {
      if (!userId) throw new Error('Sign in to follow strays');
      if (shouldFollow) {
        await followAnimal(userId, animalId);
      } else {
        await unfollowAnimal(userId, animalId);
      }
    },
    onMutate: async (shouldFollow) => {
      await queryClient.cancelQueries({ queryKey: followsKey });
      const previous = queryClient.getQueryData<string[]>(followsKey);
      queryClient.setQueryData<string[]>(followsKey, (ids = []) =>
        shouldFollow ? [...ids, animalId] : ids.filter((id) => id !== animalId),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(followsKey, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: followsKey });
      void queryClient.invalidateQueries({ queryKey: keys.animals.detail(animalId) });
    },
  });
}
