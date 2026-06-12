import { Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';

export default function DogsTab() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2 px-8">
        <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">Dogs</Text>
        <Text className="text-center text-stone-500 dark:text-stone-400">
          Nearby dog list arrives in Phase 3.
        </Text>
      </View>
    </Screen>
  );
}
