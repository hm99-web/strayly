import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';

// Filled in during Phase 6/7 (push notification preferences + radius).
export default function NotificationSettingsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <Screen edges={['left', 'right']}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-center text-stone-500 dark:text-stone-400">
            Notification preferences arrive with push support (Phase 6).
          </Text>
        </View>
      </Screen>
    </>
  );
}
