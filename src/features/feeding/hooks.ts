import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { keys } from '@/constants/queryKeys';
import type { Dog } from '@/types/domain';

import { fetchFeedingHistory, markFed, type MarkFedInput } from './api';

export function useFeedingHistory(dogId: string) {
  return useQuery({
    queryKey: keys.dogs.feedings(dogId),
    queryFn: () => fetchFeedingHistory(dogId),
  });
}

/**
 * Mark-fed with an optimistic detail patch: the staleness dot flips to green
 * instantly, then server truth replaces it.
 */
export function useMarkFed(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<MarkFedInput, 'dogId'>) => markFed({ ...input, dogId }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: keys.dogs.detail(dogId) });
      const previous = queryClient.getQueryData<Dog>(keys.dogs.detail(dogId));
      if (previous) {
        queryClient.setQueryData<Dog>(keys.dogs.detail(dogId), {
          ...previous,
          last_fed_at: new Date().toISOString(),
          feedings_count: previous.feedings_count + 1,
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(keys.dogs.detail(dogId), context.previous);
      }
    },
    onSettled: () => {
      // Refresh everything that displays feeding state (lists, map, timeline).
      void queryClient.invalidateQueries({ queryKey: keys.dogs.all });
    },
  });
}
