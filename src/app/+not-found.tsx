import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen>
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            This screen does not exist.
          </Text>
          <Link href="/" className="text-brand-600 dark:text-brand-400 text-base font-semibold">
            Go to the map
          </Link>
        </View>
      </Screen>
    </>
  );
}
