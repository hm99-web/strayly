import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { keys } from '@/constants/queryKeys';

import {
  addMedicalRecord,
  addVaccination,
  fetchMedicalRecords,
  fetchVaccinations,
  type AddMedicalRecordInput,
  type AddVaccinationInput,
} from './api';

export function useMedicalRecords(dogId: string) {
  return useQuery({
    queryKey: keys.dogs.medical(dogId),
    queryFn: () => fetchMedicalRecords(dogId),
  });
}

export function useVaccinations(dogId: string) {
  return useQuery({
    queryKey: keys.dogs.vaccinations(dogId),
    queryFn: () => fetchVaccinations(dogId),
  });
}

export function useAddMedicalRecord(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<AddMedicalRecordInput, 'dogId'>) =>
      addMedicalRecord({ ...input, dogId }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.dogs.all });
    },
  });
}

export function useAddVaccination(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<AddVaccinationInput, 'dogId'>) => addVaccination({ ...input, dogId }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.dogs.all });
    },
  });
}
