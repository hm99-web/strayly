import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { palette } from '@/constants/palette';
import { timeAgo } from '@/lib/format';
import { publicUrl } from '@/lib/supabase';
import type { TimelineItem as TimelineItemType } from '@/types/domain';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TYPE_PRESENTATION: Record<string, { icon: IoniconName; color: string }> = {
  animal_created: { icon: 'paw', color: palette.brand[600] },
  animal_updated: { icon: 'create-outline', color: '#78716C' },
  fed: { icon: 'restaurant', color: palette.status.fedRecently },
  medical: { icon: 'medkit', color: palette.status.injured },
  vaccination: { icon: 'shield-checkmark', color: palette.badge.vaccinated },
  sterilization: { icon: 'cut', color: palette.badge.sterilized },
  emergency_created: { icon: 'alert-circle', color: palette.status.emergency },
  emergency_resolved: { icon: 'checkmark-circle', color: palette.status.fedRecently },
  photo_added: { icon: 'image', color: '#78716C' },
  location_updated: { icon: 'location', color: palette.brand[500] },
  status_changed: { icon: 'swap-horizontal', color: '#78716C' },
  comment: { icon: 'chatbubble-outline', color: '#78716C' },
};

function metadataPhoto(item: TimelineItemType): string | null {
  const metadata = item.metadata as Record<string, unknown> | null;
  if (!metadata) return null;
  if (typeof metadata.thumb_path === 'string') return metadata.thumb_path;
  if (typeof metadata.photo_path === 'string') return metadata.photo_path;
  if (typeof metadata.proof_photo_path === 'string') return metadata.proof_photo_path;
  if (Array.isArray(metadata.photo_paths) && typeof metadata.photo_paths[0] === 'string') {
    return metadata.photo_paths[0];
  }
  return null;
}

export function TimelineItem({ item, isLast }: { item: TimelineItemType; isLast: boolean }) {
  const presentation = TYPE_PRESENTATION[item.activity_type] ?? TYPE_PRESENTATION.animal_updated;
  const photo = metadataPhoto(item);

  return (
    <View className="flex-row gap-3 px-4">
      <View className="items-center">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${presentation.color}22` }}
        >
          <Ionicons name={presentation.icon} size={17} color={presentation.color} />
        </View>
        {!isLast ? <View className="w-0.5 flex-1 bg-stone-200 dark:bg-stone-800" /> : null}
      </View>

      <View className="flex-1 gap-1 pb-5">
        <Text className="font-medium leading-5 text-stone-900 dark:text-stone-100">
          {item.summary ?? item.activity_type.replace(/_/g, ' ')}
        </Text>
        <Text className="text-xs text-stone-500 dark:text-stone-400">
          {item.actor_name ?? 'Someone'} · {timeAgo(item.created_at)}
        </Text>
        {photo ? (
          <Image
            source={{ uri: publicUrl('animal-media', photo) }}
            style={{ width: 120, height: 90, borderRadius: 10, marginTop: 4 }}
            contentFit="cover"
            cachePolicy="disk"
            accessibilityLabel="Attached photo"
          />
        ) : null}
      </View>
    </View>
  );
}
