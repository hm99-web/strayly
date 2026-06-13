import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AnimalStatusBadges } from '@/components/animal/AnimalStatusBadges';
import { FeedingStatusDot } from '@/components/animal/FeedingStatusDot';
import { formatAge, formatDistance, timeAgo } from '@/lib/format';
import { publicUrl } from '@/lib/supabase';
import type { AnimalSummary } from '@/types/domain';

export function AnimalCard({ animal }: { animal: AnimalSummary }) {
  return (
    <Link href={{ pathname: '/animal/[id]', params: { id: animal.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${animal.name}, ${formatAge(animal.estimated_age_months)}`}
        className="flex-row gap-3 rounded-2xl bg-white p-3 active:opacity-80 dark:bg-stone-900"
      >
        {animal.primary_thumb_path ? (
          <Image
            source={{ uri: publicUrl('animal-media', animal.primary_thumb_path) }}
            style={{ width: 84, height: 84, borderRadius: 14 }}
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
          />
        ) : (
          <View className="h-[84px] w-[84px] items-center justify-center rounded-[14px] bg-stone-100 dark:bg-stone-800">
            <Ionicons name="paw" size={28} color="#A8A29E" />
          </View>
        )}

        <View className="flex-1 justify-between py-0.5">
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-base font-bold text-stone-900 dark:text-stone-100" numberOfLines={1}>
              {animal.name}
            </Text>
            {animal.distance_m != null ? (
              <Text className="text-xs text-stone-500 dark:text-stone-400">
                {formatDistance(animal.distance_m)}
              </Text>
            ) : null}
          </View>
          <Text className="text-xs capitalize text-stone-500 dark:text-stone-400" numberOfLines={1}>
            {animal.species === 'cat' ? 'Cat' : 'Dog'}
            {animal.gender !== 'unknown' ? ` · ${animal.gender}` : ''} ·{' '}
            {formatAge(animal.estimated_age_months)} · seen {timeAgo(animal.last_seen_at)}
          </Text>
          <FeedingStatusDot lastFedAt={animal.last_fed_at} />
          <AnimalStatusBadges animal={animal} max={3} />
        </View>
      </Pressable>
    </Link>
  );
}
