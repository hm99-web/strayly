import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { keys } from '@/constants/queryKeys';
import type { Animal } from '@/types/domain';

import { fetchFeedingHistory, markFed, type MarkFedInput } from './api';

export function useFeedingHistory(animalId: string) {
  return useQuery({
    queryKey: keys.animals.feedings(animalId),
    queryFn: () => fetchFeedingHistory(animalId),
  });
}

/**
 * Mark-fed with an optimistic detail patch: the staleness dot flips to green
 * instantly, then server truth replaces it.
 */
export function useMarkFed(animalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<MarkFedInput, 'animalId'>) => markFed({ ...input, animalId }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: keys.animals.detail(animalId) });
      const previous = queryClient.getQueryData<Animal>(keys.animals.detail(animalId));
      if (previous) {
        queryClient.setQueryData<Animal>(keys.animals.detail(animalId), {
          ...previous,
          last_fed_at: new Date().toISOString(),
          feedings_count: previous.feedings_count + 1,
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(keys.animals.detail(animalId), context.previous);
      }
    },
    onSettled: () => {
      // Refresh everything that displays feeding state (lists, map, timeline).
      void queryClient.invalidateQueries({ queryKey: keys.animals.all });
    },
  });
}
