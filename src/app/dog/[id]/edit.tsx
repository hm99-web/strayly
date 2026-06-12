import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, View } from 'react-native';
import { z } from 'zod';

import { EnumChips } from '@/components/forms/EnumChips';
import { FormInput } from '@/components/forms/FormInput';
import { Button } from '@/components/ui/Button';
import { useDog, useUpdateDog } from '@/features/dogs/hooks';
import {
  createDogSchema,
  dogGenderValues,
  dogHealthValues,
  dogTemperamentValues,
  toEstimatedAgeMonths,
} from '@/features/dogs/schemas';

const dogStatusValues = ['active', 'missing', 'adopted', 'deceased', 'relocated'] as const;

const editDogSchema = createDogSchema
  .omit({ vaccinationStatus: true, sterilizationStatus: true })
  .extend({ status: z.enum(dogStatusValues) });
type EditDogValues = z.infer<typeof editDogSchema>;

export default function EditDogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: dog } = useDog(id);
  const updateDog = useUpdateDog(id);
  const [error, setError] = useState<string | null>(null);

  if (!dog) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit dog' }} />
        <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
          <Text className="text-stone-500 dark:text-stone-400">Loading…</Text>
        </View>
      </>
    );
  }

  return <EditDogForm key={dog.id} dog={dog} onError={setError} error={error} onDone={() => router.back()} updateDog={updateDog} />;
}

function EditDogForm({
  dog,
  updateDog,
  error,
  onError,
  onDone,
}: {
  dog: NonNullable<ReturnType<typeof useDog>['data']>;
  updateDog: ReturnType<typeof useUpdateDog>;
  error: string | null;
  onError: (message: string | null) => void;
  onDone: () => void;
}) {
  const { control, handleSubmit, formState } = useForm<EditDogValues>({
    resolver: zodResolver(editDogSchema),
    defaultValues: {
      name: dog.name,
      description: dog.description ?? '',
      gender: dog.gender,
      ageYears: dog.estimated_age_months != null ? String(Math.floor(dog.estimated_age_months / 12)) : '',
      ageMonths: dog.estimated_age_months != null ? String(dog.estimated_age_months % 12) : '',
      temperament: dog.temperament,
      colorMarkings: dog.color_markings ?? '',
      healthStatus: dog.health_status,
      hasPuppies: dog.has_puppies,
      medicalNotes: dog.medical_notes ?? '',
      status: dog.status,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    onError(null);
    try {
      await updateDog.mutateAsync({
        name: values.name,
        description: values.description || null,
        gender: values.gender,
        estimated_age_months: toEstimatedAgeMonths(values),
        temperament: values.temperament,
        color_markings: values.colorMarkings || null,
        health_status: values.healthStatus,
        has_puppies: values.hasPuppies,
        medical_notes: values.medicalNotes || null,
        status: values.status,
      });
      onDone();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Could not save changes');
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: `Edit ${dog.name}` }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-stone-50 dark:bg-stone-950"
      >
        <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
          <FormInput control={control} name="name" label="Nickname" />
          <FormInput control={control} name="description" label="Description" multiline numberOfLines={3} />
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <EnumChips label="Gender" options={dogGenderValues} value={field.value} onChange={field.onChange} />
            )}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <FormInput control={control} name="ageYears" label="Age (years)" keyboardType="number-pad" />
            </View>
            <View className="flex-1">
              <FormInput control={control} name="ageMonths" label="+ months" keyboardType="number-pad" />
            </View>
          </View>
          <Controller
            control={control}
            name="temperament"
            render={({ field }) => (
              <EnumChips label="Temperament" options={dogTemperamentValues} value={field.value} onChange={field.onChange} />
            )}
          />
          <FormInput control={control} name="colorMarkings" label="Color / markings" />
          <Controller
            control={control}
            name="healthStatus"
            render={({ field }) => (
              <EnumChips label="Health" options={dogHealthValues} value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <EnumChips label="Status" options={dogStatusValues} value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="hasPuppies"
            render={({ field }) => (
              <View className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3 dark:bg-stone-900">
                <Text className="font-medium text-stone-700 dark:text-stone-300">Puppies present</Text>
                <Switch value={field.value} onValueChange={field.onChange} />
              </View>
            )}
          />
          <FormInput control={control} name="medicalNotes" label="Medical notes" multiline numberOfLines={2} />

          {error ? <Text className="text-status-emergency text-sm">{error}</Text> : null}

          <Button size="lg" loading={formState.isSubmitting} onPress={onSubmit}>
            Save changes
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
