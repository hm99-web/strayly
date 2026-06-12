import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { useMyProfile } from '@/features/profile/hooks';

/** Role gate: everything under /admin requires moderator or admin. */
export default function AdminLayout() {
  const { data: profile, isLoading } = useMyProfile();
  const allowed = profile?.role === 'moderator' || profile?.role === 'admin';

  if (isLoading) {
    return null;
  }

  if (!allowed) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 p-6 dark:bg-stone-950">
        <Text className="text-center text-stone-500 dark:text-stone-400">
          This area is for moderators.
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="reports" options={{ title: 'Flagged content' }} />
    </Stack>
  );
}
