import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

import { Input } from '@/components/ui/Input';
import {
  autocompletePlaces,
  fetchPlaceLocation,
  newSessionToken,
  placesConfigured,
  type PlaceSuggestion,
} from '@/lib/places';
import { useMapStore } from '@/stores/mapStore';
import type { LatLng } from '@/types/domain';

interface AddressSearchModalProps {
  visible: boolean;
  onClose: () => void;
  /** Called after the search center has been moved. */
  onPicked?: (center: LatLng) => void;
}

export function AddressSearchModal({ visible, onClose, onPicked }: AddressSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(newSessionToken);
  const searchCenter = useMapStore((s) => s.searchCenter);
  const setSearchCenter = useMapStore((s) => s.setSearchCenter);

  // Reset on open/close without an effect (render-time adjustment pattern).
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    setQuery('');
    setResults([]);
    setSessionToken(newSessionToken());
  }

  useEffect(() => {
    if (query.trim().length < 3) return;
    const handle = setTimeout(() => {
      setLoading(true);
      autocompletePlaces(query, { sessionToken, near: searchCenter })
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [query, searchCenter, sessionToken]);

  const displayResults = query.trim().length >= 3 ? results : [];

  async function onSelect(suggestion: PlaceSuggestion) {
    const place = await fetchPlaceLocation(suggestion.placeId, sessionToken).catch(() => null);
    setSessionToken(newSessionToken());
    if (place) {
      setSearchCenter(place.location, place.name, false);
      onPicked?.(place.location);
    }
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View className="flex-1 bg-stone-50 p-4 dark:bg-stone-950">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Search a place
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close search" onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color="#A8A29E" />
          </Pressable>
        </View>

        {placesConfigured() ? (
          <>
            <Input
              autoFocus
              placeholder="Area, landmark or city…"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
            <FlatList
              data={displayResults}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="py-2"
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void onSelect(item)}
                  className="flex-row items-center gap-3 border-b border-stone-100 px-1 py-3 active:opacity-70 dark:border-stone-900"
                >
                  <Ionicons name="location-outline" size={18} color="#A8A29E" />
                  <Text className="flex-1 text-stone-800 dark:text-stone-200" numberOfLines={2}>
                    {item.description}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text className="px-1 py-6 text-center text-sm text-stone-400">
                  {loading ? 'Searching…' : query.trim().length >= 3 ? 'No places found' : 'Type at least 3 characters'}
                </Text>
              }
            />
          </>
        ) : (
          <Text className="py-6 text-center text-sm text-stone-500 dark:text-stone-400">
            Address search needs a Google Places key. Set EXPO_PUBLIC_PLACES_KEY in .env.
          </Text>
        )}
      </View>
    </Modal>
  );
}
