import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';

import { EnumChips } from '@/components/forms/EnumChips';
import { FormInput } from '@/components/forms/FormInput';
import { PhotoField } from '@/components/forms/PhotoField';
import { Button } from '@/components/ui/Button';
import { useAddVaccination } from '@/features/medical/hooks';
import {
  addVaccinationSchema,
  todayIsoDate,
  vaccineTypeValues,
  type AddVaccinationValues,
} from '@/features/medical/schemas';
import type { PickedImage } from '@/lib/images';

export default function VaccinateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addVaccination = useAddVaccination(id);
  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<AddVaccinationValues>({
    resolver: zodResolver(addVaccinationSchema),
    defaultValues: {
      vaccineType: 'rabies',
      vaccineName: '',
      administeredAt: todayIsoDate(),
      nextDueAt: '',
      administeredByText: '',
      notes: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await addVaccination.mutateAsync({
        vaccineType: values.vaccineType,
        vaccineName: values.vaccineName,
        administeredAt: values.administeredAt,
        nextDueAt: values.nextDueAt || undefined,
        administeredByText: values.administeredByText,
        notes: values.notes,
        proofPhoto: photos[0],
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the vaccination');
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Record vaccination' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-stone-50 dark:bg-stone-950"
      >
        <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="vaccineType"
            render={({ field }) => (
              <EnumChips label="Vaccine" options={vaccineTypeValues} value={field.value} onChange={field.onChange} />
            )}
          />
          <FormInput control={control} name="vaccineName" label="Brand / name (optional)" placeholder="e.g. Raksharab" />
          <FormInput
            control={control}
            name="administeredAt"
            label="Given on"
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            hint="Format: YYYY-MM-DD"
          />
          <FormInput
            control={control}
            name="nextDueAt"
            label="Next due (optional)"
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
          />
          <FormInput
            control={control}
            name="administeredByText"
            label="Administered by (optional)"
            placeholder="Vet, NGO or camp name"
          />
          <FormInput control={control} name="notes" label="Notes (optional)" multiline numberOfLines={2} />
          <PhotoField label="Proof photo (optional)" photos={photos} onChange={setPhotos} max={1} />

          {error ? <Text className="text-status-emergency text-sm">{error}</Text> : null}

          <Button size="lg" loading={formState.isSubmitting} onPress={onSubmit}>
            Save vaccination
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
