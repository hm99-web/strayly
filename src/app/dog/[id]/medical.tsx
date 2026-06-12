import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';

import { EnumChips } from '@/components/forms/EnumChips';
import { FormInput } from '@/components/forms/FormInput';
import { PhotoField } from '@/components/forms/PhotoField';
import { Button } from '@/components/ui/Button';
import { dogHealthValues } from '@/features/dogs/schemas';
import { useAddMedicalRecord } from '@/features/medical/hooks';
import {
  addMedicalSchema,
  medicalRecordTypeValues,
  severityValues,
  type AddMedicalValues,
} from '@/features/medical/schemas';
import type { PickedImage } from '@/lib/images';

export default function MedicalRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addRecord = useAddMedicalRecord(id);
  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<AddMedicalValues>({
    resolver: zodResolver(addMedicalSchema),
    defaultValues: { recordType: 'treatment', title: '', description: '', treatedByText: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await addRecord.mutateAsync({
        recordType: values.recordType,
        title: values.title,
        description: values.description,
        observedHealthStatus: values.observedHealthStatus,
        severity: values.severity,
        treatedByText: values.treatedByText,
        photos,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the record');
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Medical update' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-stone-50 dark:bg-stone-950"
      >
        <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="recordType"
            render={({ field }) => (
              <EnumChips label="Type" options={medicalRecordTypeValues} value={field.value} onChange={field.onChange} />
            )}
          />
          <FormInput control={control} name="title" label="Title" placeholder="e.g. Wound cleaned and dressed" />
          <FormInput
            control={control}
            name="description"
            label="Details (optional)"
            multiline
            numberOfLines={3}
            placeholder="What was done, medicines given, follow-up needed…"
          />
          <Controller
            control={control}
            name="observedHealthStatus"
            render={({ field }) => (
              <EnumChips
                label="Dog's condition now (optional)"
                options={dogHealthValues}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="severity"
            render={({ field }) => (
              <EnumChips label="Severity (optional)" options={severityValues} value={field.value} onChange={field.onChange} />
            )}
          />
          <FormInput
            control={control}
            name="treatedByText"
            label="Treated by (optional)"
            placeholder="Vet, NGO or volunteer"
          />
          <PhotoField label="Photos (optional)" photos={photos} onChange={setPhotos} max={3} />

          {error ? <Text className="text-status-emergency text-sm">{error}</Text> : null}

          <Button size="lg" loading={formState.isSubmitting} onPress={onSubmit}>
            Save medical update
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
