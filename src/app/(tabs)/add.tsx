import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function AddTab() {
  const router = useRouter();
  const requireAuth = useRequireAuth();

  return (
    <Screen>
      <View className="flex-1 justify-center gap-5 px-6">
        <View className="items-center gap-2">
          <View className="bg-brand-100 dark:bg-brand-900 h-20 w-20 items-center justify-center rounded-full">
            <Ionicons name="add" size={40} color="#EA580C" />
          </View>
          <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Spotted a street dog?
          </Text>
          <Text className="text-center text-stone-500 dark:text-stone-400">
            Add it to the map so your neighbourhood can feed and look after it. We&apos;ll check
            nearby dogs first to avoid duplicates.
          </Text>
        </View>
        <Button size="lg" onPress={() => requireAuth(() => router.push('/dog/new'))}>
          Add a dog
        </Button>
      </View>
    </Screen>
  );
}
