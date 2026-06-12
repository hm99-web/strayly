import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, Text, View } from 'react-native';

import { DogCard } from '@/components/dog/DogCard';
import { Screen } from '@/components/ui/Screen';
import { RADIUS_OPTIONS_M } from '@/constants/config';
import { useDogsInRadius } from '@/features/dogs/hooks';
import { useUserLocation } from '@/hooks/useUserLocation';
import { formatDistance } from '@/lib/format';
import { useMapStore } from '@/stores/mapStore';

export default function DogsTab() {
  const searchCenter = useMapStore((s) => s.searchCenter);
  const searchLabel = useMapStore((s) => s.searchLabel);
  const radiusM = useMapStore((s) => s.radiusM);
  const setRadiusM = useMapStore((s) => s.setRadiusM);
  const filters = useMapStore((s) => s.filters);
  const { locate, loading: locating, denied } = useUserLocation();

  const { data: dogs, isLoading, isRefetching, refetch } = useDogsInRadius({
    center: searchCenter,
    radiusM,
    filters,
  });

  return (
    <Screen>
      <View className="gap-3 px-4 pb-3 pt-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs uppercase tracking-wide text-stone-400">Dogs near</Text>
            <Text className="text-xl font-bold text-stone-900 dark:text-stone-100" numberOfLines={1}>
              {searchLabel}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Use my current location"
            onPress={() => void locate()}
            className="flex-row items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-2 active:opacity-80 dark:bg-brand-500"
          >
            <Ionicons name="locate" size={16} color="white" />
            <Text className="text-sm font-semibold text-white">
              {locating ? 'Locating…' : 'Near me'}
            </Text>
          </Pressable>
        </View>

        {denied ? (
          <Text className="text-xs text-stone-500 dark:text-stone-400">
            Location permission denied — showing {searchLabel}. Enable it in system settings.
          </Text>
        ) : null}

        <View className="flex-row gap-2">
          {RADIUS_OPTIONS_M.map((option) => {
            const selected = option === radiusM;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setRadiusM(option)}
                className={`rounded-full px-3 py-1.5 ${
                  selected ? 'bg-brand-600 dark:bg-brand-500' : 'bg-stone-200 dark:bg-stone-800'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    selected ? 'text-white' : 'text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {formatDistance(option)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={dogs ?? []}
        keyExtractor={(dog) => dog.id}
        renderItem={({ item }) => <DogCard dog={item} />}
        contentContainerClassName="gap-2.5 px-4 pb-6"
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        ListEmptyComponent={
          <View className="items-center gap-2 py-16">
            <Ionicons name="paw-outline" size={40} color="#A8A29E" />
            <Text className="text-center text-stone-500 dark:text-stone-400">
              {isLoading
                ? 'Finding dogs…'
                : `No dogs within ${formatDistance(radiusM)}. Try a bigger radius or add the first one!`}
            </Text>
          </View>
        }
      />
    </Screen>
  );
}
