import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';

import { EnumChips } from '@/components/forms/EnumChips';
import { FormInput } from '@/components/forms/FormInput';
import { PhotoField } from '@/components/forms/PhotoField';
import { Button } from '@/components/ui/Button';
import { useMarkFed } from '@/features/feeding/hooks';
import { foodTypeValues, markFedSchema, type MarkFedValues } from '@/features/feeding/schemas';
import type { PickedImage } from '@/lib/images';

export default function FeedDogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const markFed = useMarkFed(id);
  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, watch, formState } = useForm<MarkFedValues>({
    resolver: zodResolver(markFedSchema),
    defaultValues: { foodType: 'dog_food', foodTypeOther: '', notes: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await markFed.mutateAsync({
        foodType: values.foodType,
        foodTypeOther: values.foodTypeOther,
        notes: values.notes,
        photo: photos[0],
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record the feeding');
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Mark as fed' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-stone-50 dark:bg-stone-950"
      >
        <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="foodType"
            render={({ field }) => (
              <EnumChips label="What did it eat?" options={foodTypeValues} value={field.value} onChange={field.onChange} />
            )}
          />
          {watch('foodType') === 'other' ? (
            <FormInput control={control} name="foodTypeOther" label="What food?" placeholder="e.g. chapati" />
          ) : null}
          <FormInput
            control={control}
            name="notes"
            label="Notes (optional)"
            placeholder="Appetite, behaviour, anything notable"
            multiline
            numberOfLines={2}
          />
          <PhotoField label="Photo proof (optional)" photos={photos} onChange={setPhotos} max={1} />

          {error ? <Text className="text-status-emergency text-sm">{error}</Text> : null}

          <Button size="lg" loading={formState.isSubmitting} onPress={onSubmit}>
            Mark as fed
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
