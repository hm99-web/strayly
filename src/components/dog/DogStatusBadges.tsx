import { Text, View } from 'react-native';

import { getBadges, type DogBadgeLike } from '@/lib/dogStatus';

export function DogStatusBadges({ dog, max }: { dog: DogBadgeLike; max?: number }) {
  const badges = getBadges(dog);
  const visible = max ? badges.slice(0, max) : badges;
  if (visible.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-1.5">
      {visible.map((badge) => (
        <View
          key={badge.key}
          accessibilityLabel={badge.label}
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: badge.color }}
        >
          <Text className="text-xs font-semibold text-white">{badge.label}</Text>
        </View>
      ))}
    </View>
  );
}
