import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { DogStatusBadges } from '@/components/dog/DogStatusBadges';
import { FeedingStatusDot } from '@/components/dog/FeedingStatusDot';
import { PhotoCarousel } from '@/components/dog/PhotoCarousel';
import { TimelineItem } from '@/components/dog/TimelineItem';
import { Screen } from '@/components/ui/Screen';
import { keys } from '@/constants/queryKeys';
import { reportSighting } from '@/features/dogs/api';
import { useAddDogPhoto, useDog, useDogPhotos, useDogTimeline } from '@/features/dogs/hooks';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { formatAge, timeAgo } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { getCurrentPosition } from '@/lib/location';

type IoniconName = keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;

function ActionButton({
  icon,
  label,
  onPress,
  highlight = false,
}: {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`flex-1 items-center gap-1 rounded-2xl px-1 py-3 active:opacity-80 ${
        highlight ? 'bg-brand-600 dark:bg-brand-500' : 'bg-white dark:bg-stone-900'
      }`}
    >
      <Ionicons name={icon} size={20} color={highlight ? '#FFFFFF' : '#EA580C'} />
      <Text
        className={`text-[11px] font-semibold ${highlight ? 'text-white' : 'text-stone-700 dark:text-stone-300'}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

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
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const queryClient = useQueryClient();
  const { data: dog, isLoading, error } = useDog(id);
  const { data: photos } = useDogPhotos(id);
  const timeline = useDogTimeline(id);
  const addPhoto = useAddDogPhoto(id);
  const [sightingState, setSightingState] = useState<'idle' | 'saving' | 'done' | 'failed'>('idle');

  if (isLoading || error || !dog) {
    return (
      <Screen edges={['left', 'right']}>
        <Stack.Screen options={{ title: isLoading ? '…' : 'Not found' }} />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-center text-stone-500 dark:text-stone-400">
            {isLoading ? 'Loading…' : 'This dog could not be loaded.'}
          </Text>
        </View>
      </Screen>
    );
  }

  const timelineItems = timeline.data?.pages.flat() ?? [];

  async function onSpottedHere() {
    setSightingState('saving');
    try {
      const position = await getCurrentPosition();
      if (!position) {
        setSightingState('failed');
        return;
      }
      await reportSighting(id, position);
      void queryClient.invalidateQueries({ queryKey: keys.dogs.detail(id) });
      void queryClient.invalidateQueries({ queryKey: keys.dogs.timeline(id) });
      setSightingState('done');
    } catch {
      setSightingState('failed');
    }
  }

  async function onAddPhoto() {
    const picked = await pickImages(3);
    for (const image of picked) {
      await addPhoto.mutateAsync({ image }).catch(() => {});
    }
  }

  const header = (
    <View className="gap-5 pb-5">
      <View>
        <PhotoCarousel photos={photos ?? []} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a photo"
          onPress={() => requireAuth(() => void onAddPhoto())}
          className="absolute bottom-3 right-3 flex-row items-center gap-1.5 rounded-full bg-black/60 px-3 py-2"
        >
          <Ionicons name="camera" size={16} color="white" />
          <Text className="text-xs font-semibold text-white">Add photo</Text>
        </Pressable>
      </View>

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

      <View className="flex-row gap-2 px-4">
        <ActionButton
          icon="restaurant"
          label="Feed"
          highlight
          onPress={() => requireAuth(() => router.push({ pathname: '/dog/[id]/feed', params: { id } }))}
        />
        <ActionButton
          icon="medkit"
          label="Medical"
          onPress={() => requireAuth(() => router.push({ pathname: '/dog/[id]/medical', params: { id } }))}
        />
        <ActionButton
          icon="shield-checkmark"
          label="Vaccine"
          onPress={() => requireAuth(() => router.push({ pathname: '/dog/[id]/vaccinate', params: { id } }))}
        />
        <ActionButton
          icon="alert-circle"
          label="Emergency"
          onPress={() => requireAuth(() => router.push({ pathname: '/dog/[id]/report', params: { id } }))}
        />
        <ActionButton
          icon="create-outline"
          label="Edit"
          onPress={() => requireAuth(() => router.push({ pathname: '/dog/[id]/edit', params: { id } }))}
        />
      </View>

      <View className="px-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="I saw this dog here"
          disabled={sightingState === 'saving'}
          onPress={() => requireAuth(() => void onSpottedHere())}
          className="flex-row items-center justify-center gap-2 rounded-xl border border-stone-300 py-2.5 active:opacity-70 dark:border-stone-700"
        >
          <Ionicons name="eye-outline" size={16} color="#78716C" />
          <Text className="text-sm font-medium text-stone-600 dark:text-stone-300">
            {sightingState === 'saving'
              ? 'Recording sighting…'
              : sightingState === 'done'
                ? 'Sighting recorded ✓'
                : sightingState === 'failed'
                  ? 'Could not record — location needed'
                  : 'I saw this dog here'}
          </Text>
        </Pressable>
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

      <View className="px-4 pt-1">
        <Text className="text-sm font-semibold uppercase tracking-wide text-stone-400">
          Timeline
        </Text>
      </View>
    </View>
  );

  return (
    <Screen edges={['left', 'right']}>
      <Stack.Screen options={{ title: dog.name }} />
      <FlatList
        data={timelineItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <TimelineItem item={item} isLast={index === timelineItems.length - 1} />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text className="px-4 pb-8 text-sm text-stone-400">
            {timeline.isLoading ? 'Loading timeline…' : 'No activity yet.'}
          </Text>
        }
        ListFooterComponent={
          timeline.isFetchingNextPage ? (
            <Text className="px-4 pb-8 text-center text-sm text-stone-400">Loading more…</Text>
          ) : (
            <View className="h-8" />
          )
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (timeline.hasNextPage && !timeline.isFetchingNextPage) {
            void timeline.fetchNextPage();
          }
        }}
      />
    </Screen>
  );
}
