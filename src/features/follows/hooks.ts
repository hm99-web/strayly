import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { keys } from '@/constants/queryKeys';
import { useAuth } from '@/hooks/useAuth';

import { fetchMyFollowedDogIds, followDog, unfollowDog } from './api';

export function useMyFollows() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: keys.follows.mine(userId ?? 'none'),
    queryFn: fetchMyFollowedDogIds,
    enabled: userId != null,
    select: (ids) => new Set(ids),
  });
}

/** Optimistic follow/unfollow — the heart flips instantly. */
export function useToggleFollow(dogId: string) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const followsKey = keys.follows.mine(userId ?? 'none');

  return useMutation({
    mutationFn: async (shouldFollow: boolean) => {
      if (!userId) throw new Error('Sign in to follow dogs');
      if (shouldFollow) {
        await followDog(userId, dogId);
      } else {
        await unfollowDog(userId, dogId);
      }
    },
    onMutate: async (shouldFollow) => {
      await queryClient.cancelQueries({ queryKey: followsKey });
      const previous = queryClient.getQueryData<string[]>(followsKey);
      queryClient.setQueryData<string[]>(followsKey, (ids = []) =>
        shouldFollow ? [...ids, dogId] : ids.filter((id) => id !== dogId),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(followsKey, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: followsKey });
      void queryClient.invalidateQueries({ queryKey: keys.dogs.detail(dogId) });
    },
  });
}
