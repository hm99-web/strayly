import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { publicUrl } from '@/lib/supabase';

interface AvatarProps {
  path?: string | null;
  name: string;
  size?: number;
}

export function Avatar({ path, name, size = 48 }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (path) {
    return (
      <Image
        source={{ uri: publicUrl('avatars', path) }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        cachePolicy="disk"
        accessibilityLabel={`${name}'s avatar`}
      />
    );
  }

  return (
    <View
      accessibilityLabel={`${name}'s avatar`}
      className="bg-brand-200 dark:bg-brand-800 items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      <Text
        className="text-brand-800 dark:text-brand-200 font-bold"
        style={{ fontSize: size * 0.4 }}
      >
        {initials || '?'}
      </Text>
    </View>
  );
}
