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

export function useMedicalRecords(animalId: string) {
  return useQuery({
    queryKey: keys.animals.medical(animalId),
    queryFn: () => fetchMedicalRecords(animalId),
  });
}

export function useVaccinations(animalId: string) {
  return useQuery({
    queryKey: keys.animals.vaccinations(animalId),
    queryFn: () => fetchVaccinations(animalId),
  });
}

export function useAddMedicalRecord(animalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<AddMedicalRecordInput, 'animalId'>) =>
      addMedicalRecord({ ...input, animalId }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.animals.all });
    },
  });
}

export function useAddVaccination(animalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<AddVaccinationInput, 'animalId'>) => addVaccination({ ...input, animalId }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.animals.all });
    },
  });
}
