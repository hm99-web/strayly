import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { EnumChips } from '@/components/forms/EnumChips';
import { FormInput } from '@/components/forms/FormInput';
import { PhotoField } from '@/components/forms/PhotoField';
import { Button } from '@/components/ui/Button';
import { useCreateEmergency } from '@/features/emergencies/hooks';
import {
  createEmergencySchema,
  emergencySeverityValues,
  emergencyTypeValues,
  type CreateEmergencyValues,
} from '@/features/emergencies/schemas';
import type { PickedImage } from '@/lib/images';

export default function ReportEmergencyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const createEmergency = useCreateEmergency();
  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<CreateEmergencyValues>({
    resolver: zodResolver(createEmergencySchema),
    defaultValues: { emergencyType: 'injury', severity: 'high', description: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const emergencyId = await createEmergency.mutateAsync({
        animalId: id,
        emergencyType: values.emergencyType,
        severity: values.severity,
        description: values.description,
        photos,
      });
      router.replace({ pathname: '/emergency/[id]', params: { id: emergencyId } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit the report');
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Report emergency' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-stone-50 dark:bg-stone-950"
      >
        <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
          <View className="rounded-xl border border-status-emergency/40 bg-red-50 p-3 dark:bg-red-950/30">
            <Text className="text-sm text-stone-700 dark:text-stone-300">
              Nearby volunteers will be alerted. Your current location is attached to the report so
              rescuers can find the animal.
            </Text>
          </View>

          <Controller
            control={control}
            name="emergencyType"
            render={({ field }) => (
              <EnumChips
                label="What happened?"
                options={emergencyTypeValues}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="severity"
            render={({ field }) => (
              <EnumChips
                label="How urgent is it?"
                options={emergencySeverityValues}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FormInput
            control={control}
            name="description"
            label="Describe the situation"
            placeholder="What you saw, the animal's condition, exact spot…"
            multiline
            numberOfLines={4}
          />
          <PhotoField label="Photos (help rescuers assess)" photos={photos} onChange={setPhotos} max={3} />

          {error ? <Text className="text-status-emergency text-sm">{error}</Text> : null}

          <Button size="lg" variant="danger" loading={formState.isSubmitting} onPress={onSubmit}>
            Send emergency alert
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
