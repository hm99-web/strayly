import { Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';

export default function MapTab() {
  return (
    <Screen edges={[]}>
      <View className="flex-1 items-center justify-center gap-2 px-8">
        <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">Map</Text>
        <Text className="text-center text-stone-500 dark:text-stone-400">
          The dog map arrives in Phase 4 — markers, clustering and filters.
        </Text>
      </View>
    </Screen>
  );
}
