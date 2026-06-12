import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { DogStatusBadges } from '@/components/dog/DogStatusBadges';
import { FeedingStatusDot } from '@/components/dog/FeedingStatusDot';
import { PhotoCarousel } from '@/components/dog/PhotoCarousel';
import { Screen } from '@/components/ui/Screen';
import { useDog, useDogPhotos } from '@/features/dogs/hooks';
import { formatAge, timeAgo } from '@/lib/format';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-1.5 px-4">
      <Text className="text-sm font-semibold uppercase tracking-wide text-stone-400">{title}</Text>
      {children}
    </View>
  );
}

export default function DogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dog, isLoading, error } = useDog(id);
  const { data: photos } = useDogPhotos(id);

  if (isLoading) {
    return (
      <Screen edges={['left', 'right']}>
        <Stack.Screen options={{ title: '…' }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-stone-500 dark:text-stone-400">Loading…</Text>
        </View>
      </Screen>
    );
  }

  if (error || !dog) {
    return (
      <Screen edges={['left', 'right']}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-center text-stone-500 dark:text-stone-400">
            This dog could not be loaded.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['left', 'right']}>
      <Stack.Screen options={{ title: dog.name }} />
      <ScrollView contentContainerClassName="gap-5 pb-10">
        <PhotoCarousel photos={photos ?? []} />

        <View className="gap-2 px-4">
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
              {dog.name}
            </Text>
            <Text className="pt-1 text-sm capitalize text-stone-500 dark:text-stone-400">
              {dog.temperament !== 'unknown' ? dog.temperament : ''}
            </Text>
          </View>
          <Text className="capitalize text-stone-500 dark:text-stone-400">
            {dog.gender !== 'unknown' ? `${dog.gender} · ` : ''}
            {formatAge(dog.estimated_age_months)}
          </Text>
          <DogStatusBadges dog={dog} />
          <View className="mt-1 rounded-xl bg-white px-3 py-2.5 dark:bg-stone-900">
            <FeedingStatusDot lastFedAt={dog.last_fed_at} />
            <Text className="mt-0.5 text-xs text-stone-400">
              Fed {dog.feedings_count} {dog.feedings_count === 1 ? 'time' : 'times'} in total
            </Text>
          </View>
        </View>

        {dog.description ? (
          <Section title="About">
            <Text className="leading-5 text-stone-700 dark:text-stone-300">{dog.description}</Text>
          </Section>
        ) : null}

        {dog.color_markings ? (
          <Section title="Color & markings">
            <Text className="text-stone-700 dark:text-stone-300">{dog.color_markings}</Text>
          </Section>
        ) : null}

        <Section title="Last seen">
          <Text className="text-stone-700 dark:text-stone-300">
            {timeAgo(dog.last_seen_at)}
            {dog.address_text ? ` · ${dog.address_text}` : ''}
            {dog.city ? `, ${dog.city}` : ''}
          </Text>
        </Section>

        {dog.medical_notes ? (
          <Section title="Medical notes">
            <Text className="leading-5 text-stone-700 dark:text-stone-300">{dog.medical_notes}</Text>
          </Section>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
