import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FlatList, useWindowDimensions, View } from 'react-native';

import { publicUrl } from '@/lib/supabase';
import type { DogPhoto } from '@/types/domain';

export function PhotoCarousel({ photos }: { photos: DogPhoto[] }) {
  const { width } = useWindowDimensions();
  const itemWidth = Math.min(width, 720);

  if (photos.length === 0) {
    return (
      <View
        className="items-center justify-center bg-stone-100 dark:bg-stone-900"
        style={{ width: '100%', height: 260 }}
      >
        <Ionicons name="paw" size={56} color="#D6D3D1" />
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      keyExtractor={(photo) => photo.id}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      renderItem={({ item }) => (
        <Image
          source={{ uri: publicUrl('dog-media', item.storage_path) }}
          style={{ width: itemWidth, height: 280 }}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
          accessibilityLabel={item.caption ?? 'Dog photo'}
        />
      )}
    />
  );
}
