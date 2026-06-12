import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { DogStatusBadges } from '@/components/dog/DogStatusBadges';
import { FeedingStatusDot } from '@/components/dog/FeedingStatusDot';
import { formatAge, formatDistance, timeAgo } from '@/lib/format';
import { publicUrl } from '@/lib/supabase';
import type { DogSummary } from '@/types/domain';

export function DogCard({ dog }: { dog: DogSummary }) {
  return (
    <Link href={{ pathname: '/dog/[id]', params: { id: dog.id } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${dog.name}, ${formatAge(dog.estimated_age_months)}`}
        className="flex-row gap-3 rounded-2xl bg-white p-3 active:opacity-80 dark:bg-stone-900"
      >
        {dog.primary_thumb_path ? (
          <Image
            source={{ uri: publicUrl('dog-media', dog.primary_thumb_path) }}
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
              {dog.name}
            </Text>
            {dog.distance_m != null ? (
              <Text className="text-xs text-stone-500 dark:text-stone-400">
                {formatDistance(dog.distance_m)}
              </Text>
            ) : null}
          </View>
          <Text className="text-xs capitalize text-stone-500 dark:text-stone-400" numberOfLines={1}>
            {dog.gender !== 'unknown' ? `${dog.gender} · ` : ''}
            {formatAge(dog.estimated_age_months)} · seen {timeAgo(dog.last_seen_at)}
          </Text>
          <FeedingStatusDot lastFedAt={dog.last_fed_at} />
          <DogStatusBadges dog={dog} max={3} />
        </View>
      </Pressable>
    </Link>
  );
}
