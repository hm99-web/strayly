import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimalCard } from '@/components/animal/AnimalCard';
import { FilterSheet } from '@/components/animal/FilterSheet';
import { AddressSearchModal } from '@/components/map/AddressSearchModal';
import { AnimalMap } from '@/components/map/AnimalMap';
import { DEFAULT_DELTA, type MapRegion } from '@/components/map/AnimalMap.types';
import { updateMySettings } from '@/features/profile/api';
import { useAnimalsInBbox } from '@/features/animals/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getMarkerColor } from '@/lib/animalStatus';
import { countActiveFilters, useMapStore } from '@/stores/mapStore';
import { toWkt } from '@/types/domain';

export default function MapTab() {
  const insets = useSafeAreaInsets();
  const searchCenter = useMapStore((s) => s.searchCenter);
  const searchLabel = useMapStore((s) => s.searchLabel);
  const filters = useMapStore((s) => s.filters);
  const { userId } = useAuth();
  const { locate, loading: locating } = useUserLocation();

  const initialRegion = useMemo<MapRegion>(
    () => ({ ...searchCenter, ...DEFAULT_DELTA }),
    // The map manages its own camera after mount; searchCenter moves use center/centerKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [queryRegion, setQueryRegion] = useState<MapRegion>(initialRegion);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [centerKey, setCenterKey] = useState(0);
  const lastCenterRef = useRef(searchCenter);

  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: animals } = useAnimalsInBbox(queryRegion, filters);

  const points = useMemo(
    () =>
      (animals ?? []).map((animal) => ({
        id: animal.id,
        latitude: animal.lat,
        longitude: animal.lng,
        color: getMarkerColor(animal),
      })),
    [animals],
  );

  const selectedAnimal = useMemo(
    () => (selectedAnimalId ? (animals ?? []).find((d) => d.id === selectedAnimalId) : undefined),
    [animals, selectedAnimalId],
  );

  // Camera follows the shared search center (address search / near-me).
  useEffect(() => {
    if (
      searchCenter.latitude !== lastCenterRef.current.latitude ||
      searchCenter.longitude !== lastCenterRef.current.longitude
    ) {
      lastCenterRef.current = searchCenter;
      setCenterKey((k) => k + 1);
      setQueryRegion({ ...searchCenter, ...DEFAULT_DELTA });
    }
  }, [searchCenter]);

  function onRegionChange(region: MapRegion) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQueryRegion(region), 400);
  }

  async function onLocate() {
    const position = await locate();
    // Opportunistically refresh the fan-out location for nearby push alerts.
    if (position && userId) {
      void updateMySettings(userId, { last_known_location: toWkt(position) }).catch(() => {});
    }
  }

  const activeFilters = countActiveFilters(filters);

  return (
    <View className="flex-1">
      <AnimalMap
        points={points}
        initialRegion={initialRegion}
        onRegionChange={onRegionChange}
        onPointPress={(animalId) => setSelectedAnimalId(animalId)}
        showsUserLocation
        center={searchCenter}
        centerKey={centerKey}
      />

      {/* Top overlay: search pill + filter button */}
      <View
        className="absolute left-4 right-4 flex-row items-center gap-2"
        style={{ top: insets.top + 8 }}
      >
        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Search a place"
          onPress={() => setSearchOpen(true)}
          className="flex-1 flex-row items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm dark:bg-stone-900"
        >
          <Ionicons name="search" size={18} color="#A8A29E" />
          <Text className="flex-1 text-stone-600 dark:text-stone-300" numberOfLines={1}>
            {searchLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Filters${activeFilters > 0 ? `, ${activeFilters} active` : ''}`}
          onPress={() => setFiltersOpen(true)}
          className="h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-stone-900"
        >
          <Ionicons name="options" size={20} color={activeFilters > 0 ? '#EA580C' : '#78716C'} />
          {activeFilters > 0 ? (
            <View className="absolute -right-0.5 -top-0.5 h-5 w-5 items-center justify-center rounded-full bg-brand-600">
              <Text className="text-[10px] font-bold text-white">{activeFilters}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* Locate FAB */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go to my location"
        onPress={() => void onLocate()}
        className="absolute right-4 h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm active:opacity-80 dark:bg-stone-900"
        style={{ bottom: (selectedAnimal ? 140 : 24) + insets.bottom }}
      >
        <Ionicons name={locating ? 'navigate' : 'locate'} size={20} color="#EA580C" />
      </Pressable>

      {/* Marker preview card */}
      {selectedAnimal ? (
        <View className="absolute left-3 right-3" style={{ bottom: 12 + insets.bottom }}>
          <View className="shadow-lg">
            <AnimalCard animal={selectedAnimal} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close preview"
              onPress={() => setSelectedAnimalId(null)}
              className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800"
            >
              <Ionicons name="close" size={16} color="#78716C" />
            </Pressable>
          </View>
        </View>
      ) : null}

      <AddressSearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
      <FilterSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </View>
  );
}
