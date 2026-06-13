import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { formatDistance, timeAgo } from '@/lib/format';
import { publicUrl } from '@/lib/supabase';
import type { DuplicateMatch } from '@/types/domain';

interface DuplicateMatchListProps {
  matches: DuplicateMatch[];
  onSelectExisting: (animalId: string) => void;
}

/** "This might be Sheru — 40 m away": shown before creating a new animal. */
export function DuplicateMatchList({ matches, onSelectExisting }: DuplicateMatchListProps) {
  return (
    <View className="gap-2">
      {matches.map((match) => (
        <Pressable
          key={match.id}
          accessibilityRole="button"
          accessibilityLabel={`This might be ${match.name}, ${formatDistance(match.distance_m)} away`}
          onPress={() => onSelectExisting(match.id)}
          className="flex-row items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 active:opacity-80 dark:border-stone-800 dark:bg-stone-900"
        >
          {match.primary_thumb_path ? (
            <Image
              source={{ uri: publicUrl('animal-media', match.primary_thumb_path) }}
              style={{ width: 56, height: 56, borderRadius: 12 }}
              contentFit="cover"
              cachePolicy="disk"
            />
          ) : (
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
              <Ionicons name="paw" size={22} color="#A8A29E" />
            </View>
          )}
          <View className="flex-1">
            <Text className="font-semibold text-stone-900 dark:text-stone-100">
              This might be {match.name}
            </Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              {formatDistance(match.distance_m)} away · seen {timeAgo(match.last_seen_at)}
              {match.gender_match ? ' · same gender' : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#A8A29E" />
        </Pressable>
      ))}
    </View>
  );
}
