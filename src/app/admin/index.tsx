import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';

// Post-MVP: merge duplicates, moderate users, manage emergencies.
export default function AdminHome() {
  const router = useRouter();
  return (
    <Screen edges={['left', 'right']}>
      <View className="gap-3 p-4">
        <Button variant="outline" onPress={() => router.push('/admin/reports')}>
          Review flagged content
        </Button>
        <Text className="px-1 text-sm text-stone-500 dark:text-stone-400">
          Duplicate merging, user moderation and emergency management land post-MVP.
        </Text>
      </View>
    </Screen>
  );
}
