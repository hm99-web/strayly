import { Stack } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { useMySettings, useUpdateMySettings } from '@/features/profile/hooks';
import { useAuth } from '@/hooks/useAuth';
import { formatDistance } from '@/lib/format';

const RADIUS_CHOICES_M = [1000, 2000, 5000, 10000] as const;

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-2xl bg-white p-4 dark:bg-stone-900">
      <View className="flex-1">
        <Text className="font-semibold text-stone-900 dark:text-stone-100">{label}</Text>
        <Text className="text-sm text-stone-500 dark:text-stone-400">{description}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={label} />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const { isSignedIn } = useAuth();
  const { data: settings } = useMySettings();
  const updateSettings = useUpdateMySettings();

  if (!isSignedIn || !settings) {
    return (
      <>
        <Stack.Screen options={{ title: 'Notifications' }} />
        <Screen edges={['left', 'right']}>
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-center text-stone-500 dark:text-stone-400">
              {isSignedIn ? 'Loading…' : 'Sign in to manage notification preferences.'}
            </Text>
          </View>
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <Screen edges={['left', 'right']}>
        <ScrollView contentContainerClassName="gap-3 p-4">
          <ToggleRow
            label="Emergencies nearby"
            description="An animal near you is hurt or needs urgent help"
            value={settings.notify_emergency_nearby}
            onChange={(value) => updateSettings.mutate({ notify_emergency_nearby: value })}
          />
          <ToggleRow
            label="New strays nearby"
            description="A new animal or cat was added in your area"
            value={settings.notify_new_animal_nearby}
            onChange={(value) => updateSettings.mutate({ notify_new_animal_nearby: value })}
          />
          <ToggleRow
            label="Strays you follow"
            description="Feedings, medical updates and emergencies for followed strays"
            value={settings.notify_followed_animals}
            onChange={(value) => updateSettings.mutate({ notify_followed_animals: value })}
          />

          <View className="gap-2 rounded-2xl bg-white p-4 dark:bg-stone-900">
            <Text className="font-semibold text-stone-900 dark:text-stone-100">Alert radius</Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              How far around your last known location should nearby alerts reach?
            </Text>
            <View className="mt-1 flex-row gap-2">
              {RADIUS_CHOICES_M.map((radius) => {
                const selected = settings.notification_radius_m === radius;
                return (
                  <Pressable
                    key={radius}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => updateSettings.mutate({ notification_radius_m: radius })}
                    className={`rounded-full px-3.5 py-2 ${
                      selected ? 'bg-brand-600 dark:bg-brand-500' : 'bg-stone-200 dark:bg-stone-800'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${selected ? 'text-white' : 'text-stone-600 dark:text-stone-300'}`}
                    >
                      {formatDistance(radius)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text className="px-1 text-xs text-stone-400">
            Nearby alerts use the location recorded when you last opened the map. Push delivery
            requires notification permission on your device.
          </Text>
        </ScrollView>
      </Screen>
    </>
  );
}
