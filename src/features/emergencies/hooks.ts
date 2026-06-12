import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { keys } from '@/constants/queryKeys';

import {
  createEmergency,
  fetchEmergenciesForDog,
  fetchEmergency,
  updateEmergencyStatus,
  type CreateEmergencyInput,
} from './api';

export function useEmergency(id: string) {
  return useQuery({
    queryKey: keys.emergencies.detail(id),
    queryFn: () => fetchEmergency(id),
  });
}

export function useEmergenciesForDog(dogId: string) {
  return useQuery({
    queryKey: keys.emergencies.forDog(dogId),
    queryFn: () => fetchEmergenciesForDog(dogId),
  });
}

export function useCreateEmergency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEmergencyInput) => createEmergency(input),
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      void queryClient.invalidateQueries({ queryKey: keys.dogs.all });
      if (input.dogId) {
        void queryClient.invalidateQueries({ queryKey: keys.dogs.detail(input.dogId) });
      }
    },
  });
}

export function useUpdateEmergencyStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      status,
      resolutionNotes,
    }: {
      status: 'in_progress' | 'resolved' | 'false_alarm';
      resolutionNotes?: string;
    }) => updateEmergencyStatus(id, status, resolutionNotes),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      void queryClient.invalidateQueries({ queryKey: keys.dogs.all });
    },
  });
}
