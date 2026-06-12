import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { MAX_PHOTOS_PER_UPLOAD } from '@/constants/config';
import { pickImages, takePhoto, type PickedImage } from '@/lib/images';

interface PhotoFieldProps {
  label?: string;
  photos: PickedImage[];
  onChange: (photos: PickedImage[]) => void;
  max?: number;
}

export function PhotoField({ label = 'Photos', photos, onChange, max = MAX_PHOTOS_PER_UPLOAD }: PhotoFieldProps) {
  const remaining = max - photos.length;

  async function onPick() {
    if (remaining <= 0) return;
    const picked = await pickImages(remaining);
    if (picked.length > 0) onChange([...photos, ...picked].slice(0, max));
  }

  async function onCamera() {
    if (remaining <= 0) return;
    const shot = await takePhoto();
    if (shot) onChange([...photos, shot].slice(0, max));
  }

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">
        {label} ({photos.length}/{max})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        {photos.map((photo, index) => (
          <View key={`${photo.uri}-${index}`} className="relative">
            <Image
              source={{ uri: photo.uri }}
              style={{ width: 88, height: 88, borderRadius: 12 }}
              contentFit="cover"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              onPress={() => onChange(photos.filter((_, i) => i !== index))}
              className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-stone-900/80"
            >
              <Ionicons name="close" size={14} color="white" />
            </Pressable>
          </View>
        ))}
        {remaining > 0 ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pick photos from library"
              onPress={onPick}
              className="h-[88px] w-[88px] items-center justify-center rounded-xl border border-dashed border-stone-300 dark:border-stone-700"
            >
              <Ionicons name="images-outline" size={24} color="#A8A29E" />
            </Pressable>
            {Platform.OS !== 'web' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Take a photo"
                onPress={onCamera}
                className="h-[88px] w-[88px] items-center justify-center rounded-xl border border-dashed border-stone-300 dark:border-stone-700"
              >
                <Ionicons name="camera-outline" size={24} color="#A8A29E" />
              </Pressable>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
