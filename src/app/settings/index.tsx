import { Stack, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <Screen edges={['left', 'right']}>
        <View className="gap-3 p-4">
          <Button variant="outline" onPress={() => router.push('/settings/notifications')}>
            Notification preferences
          </Button>
          <Text className="px-1 text-sm text-stone-500 dark:text-stone-400">
            Language and more options are coming soon.
          </Text>
        </View>
      </Screen>
    </>
  );
}
