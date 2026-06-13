import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, View } from 'react-native';

import { DuplicateMatchList } from '@/components/animal/DuplicateMatchList';
import { EnumChips } from '@/components/forms/EnumChips';
import { FormInput } from '@/components/forms/FormInput';
import { PhotoField } from '@/components/forms/PhotoField';
import { Button } from '@/components/ui/Button';
import { useCreateAnimal, useDuplicateCheck } from '@/features/animals/hooks';
import {
  createAnimalSchema,
  speciesValues,
  animalGenderValues,
  animalHealthValues,
  animalTemperamentValues,
  toEstimatedAgeMonths,
  triStateValues,
  type CreateAnimalValues,
} from '@/features/animals/schemas';
import { getCurrentPosition, reverseGeocode } from '@/lib/location';
import type { PickedImage } from '@/lib/images';
import type { LatLng, Species } from '@/types/domain';

type Step = 'location' | 'duplicates' | 'details';

export default function NewDogScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('location');
  const [point, setPoint] = useState<LatLng | null>(null);
  const [addressText, setAddressText] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [species, setSpecies] = useState<Species>('dog');
  const duplicates = useDuplicateCheck(
    step === 'duplicates' || step === 'details' ? point : null,
    species,
  );
  const createAnimal = useCreateAnimal();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateAnimalValues>({
    resolver: zodResolver(createAnimalSchema),
    defaultValues: {
      species: 'dog',
      name: '',
      gender: 'unknown',
      ageYears: '',
      ageMonths: '',
      temperament: 'unknown',
      healthStatus: 'healthy',
      hasPuppies: false,
      vaccinationStatus: 'unknown',
      sterilizationStatus: 'unknown',
    },
  });

  async function captureLocation() {
    setLocating(true);
    setLocationError(null);
    try {
      const position = await getCurrentPosition();
      if (!position) {
        setLocationError(
          'Location permission is needed to place the animal on the map. Allow it in system settings, or try again.',
        );
        return;
      }
      setPoint(position);
      setAddressText(await reverseGeocode(position));
      setStep('duplicates');
    } finally {
      setLocating(false);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!point) return;
    setSubmitError(null);
    try {
      const animalId = await createAnimal.mutateAsync({
        insert: {
          name: values.name,
          species,
          description: values.description || null,
          gender: values.gender,
          estimated_age_months: toEstimatedAgeMonths(values),
          temperament: values.temperament,
          color_markings: values.colorMarkings || null,
          health_status: values.healthStatus,
          has_babies: values.hasPuppies,
          vaccination_status: values.vaccinationStatus,
          sterilization_status: values.sterilizationStatus,
          medical_notes: values.medicalNotes || null,
          address_text: addressText,
        },
        point,
        photos,
      });
      router.replace({ pathname: '/animal/[id]', params: { id: animalId } });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not save the animal');
    }
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Add a stray' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-stone-50 dark:bg-stone-950"
      >
        <ScrollView contentContainerClassName="gap-5 p-4 pb-12" keyboardShouldPersistTaps="handled">
          {step === 'location' ? (
            <View className="gap-4 pt-6">
              <View className="items-center gap-2">
                <Ionicons name="location" size={40} color="#EA580C" />
                <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Where is the animal?
                </Text>
              </View>
              <EnumChips
                label="What did you spot?"
                options={speciesValues}
                value={species}
                onChange={setSpecies}
              />
              <View className="items-center gap-2">
                <Text className="text-center text-stone-500 dark:text-stone-400">
                  Stand near the animal and use your location — that&apos;s where it will appear on
                  the map for feeders nearby.
                </Text>
              </View>
              {locationError ? (
                <Text className="text-status-emergency text-center text-sm">{locationError}</Text>
              ) : null}
              <Button size="lg" loading={locating} onPress={() => void captureLocation()}>
                Use my current location
              </Button>
            </View>
          ) : null}

          {step === 'duplicates' ? (
            <View className="gap-4">
              <View className="gap-1">
                <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Is it one of these?
                </Text>
                <Text className="text-stone-500 dark:text-stone-400">
                  {addressText ? `Near ${addressText}. ` : ''}
                  These strays were already added close by — tap one if it&apos;s a match.
                </Text>
              </View>

              {duplicates.isLoading ? (
                <Text className="text-stone-500 dark:text-stone-400">Checking nearby strays…</Text>
              ) : duplicates.data && duplicates.data.length > 0 ? (
                <DuplicateMatchList
                  matches={duplicates.data}
                  onSelectExisting={(animalId) =>
                    router.replace({ pathname: '/animal/[id]', params: { id: animalId } })
                  }
                />
              ) : (
                <Text className="text-stone-500 dark:text-stone-400">
                  No strays recorded nearby — looks like a new friend.
                </Text>
              )}

              <Button size="lg" onPress={() => setStep('details')}>
                {duplicates.data && duplicates.data.length > 0 ? "No, it's a new animal" : 'Continue'}
              </Button>
            </View>
          ) : null}

          {step === 'details' ? (
            <View className="gap-4">
              <View className="rounded-xl bg-stone-100 px-3 py-2 dark:bg-stone-900">
                <Text className="text-xs text-stone-500 dark:text-stone-400">
                  📍 {addressText ?? `${point?.latitude.toFixed(5)}, ${point?.longitude.toFixed(5)}`}
                </Text>
              </View>

              <FormInput control={control} name="name" label="Nickname" placeholder="e.g. Sheru" />
              <FormInput
                control={control}
                name="description"
                label="Description"
                placeholder="Where does it hang out? How does it behave?"
                multiline
                numberOfLines={3}
              />

              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <EnumChips label="Gender" options={animalGenderValues} value={field.value} onChange={field.onChange} />
                )}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormInput
                    control={control}
                    name="ageYears"
                    label="Age (years)"
                    keyboardType="number-pad"
                    placeholder="~"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    control={control}
                    name="ageMonths"
                    label="+ months"
                    keyboardType="number-pad"
                    placeholder="0–11"
                  />
                </View>
              </View>

              <Controller
                control={control}
                name="temperament"
                render={({ field }) => (
                  <EnumChips
                    label="Temperament"
                    options={animalTemperamentValues}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FormInput
                control={control}
                name="colorMarkings"
                label="Color / markings"
                placeholder="e.g. brown, white chest, torn ear"
              />
              <Controller
                control={control}
                name="healthStatus"
                render={({ field }) => (
                  <EnumChips
                    label="Health right now"
                    options={animalHealthValues}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="hasPuppies"
                render={({ field }) => (
                  <View className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3 dark:bg-stone-900">
                    <Text className="font-medium text-stone-700 dark:text-stone-300">
                      Puppies / kittens present
                    </Text>
                    <Switch value={field.value} onValueChange={field.onChange} />
                  </View>
                )}
              />

              <Controller
                control={control}
                name="vaccinationStatus"
                render={({ field }) => (
                  <EnumChips label="Vaccinated?" options={triStateValues} value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                control={control}
                name="sterilizationStatus"
                render={({ field }) => (
                  <EnumChips
                    label="Sterilized? (ear notch usually means yes)"
                    options={triStateValues}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FormInput
                control={control}
                name="medicalNotes"
                label="Medical notes"
                placeholder="Anything a vet or feeder should know"
                multiline
                numberOfLines={2}
              />

              <PhotoField photos={photos} onChange={setPhotos} />

              {submitError ? (
                <Text className="text-status-emergency text-sm">{submitError}</Text>
              ) : null}

              <Button size="lg" loading={isSubmitting} onPress={onSubmit}>
                Add animal
              </Button>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
