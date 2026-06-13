import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { signInAnonymously, signOut } from '@/features/auth/api';
import { useMyProfile } from '@/features/profile/hooks';
import { useAuth } from '@/hooks/useAuth';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center gap-0.5 rounded-2xl bg-white py-4 dark:bg-stone-900">
      <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</Text>
      <Text className="text-xs text-stone-500 dark:text-stone-400">{label}</Text>
    </View>
  );
}

export default function ProfileTab() {
  const router = useRouter();
  const { isSignedIn, isAnonymous } = useAuth();
  const { data: profile } = useMyProfile();
  const [busy, setBusy] = useState(false);

  if (!isSignedIn) {
    return (
      <Screen>
        <View className="flex-1 justify-center gap-4 px-6">
          <View className="items-center gap-2">
            <Ionicons name="paw" size={48} color="#EA580C" />
            <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Paw Guardians
            </Text>
            <Text className="text-center text-stone-500 dark:text-stone-400">
              Sign in to feed strays, report emergencies and follow the animals you care about.
            </Text>
          </View>
          <Button onPress={() => router.push('/(auth)/sign-in')}>Sign in</Button>
          <Button variant="outline" onPress={() => router.push('/(auth)/sign-up')}>
            Create account
          </Button>
          <Button
            variant="ghost"
            loading={busy}
            onPress={async () => {
              setBusy(true);
              try {
                await signInAnonymously();
              } finally {
                setBusy(false);
              }
            }}
          >
            Continue as guest
          </Button>
        </View>
      </Screen>
    );
  }

  const isModerator = profile?.role === 'moderator' || profile?.role === 'admin';

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 p-4">
        <View className="flex-row items-center gap-4 rounded-2xl bg-white p-4 dark:bg-stone-900">
          <Avatar path={profile?.avatar_path} name={profile?.display_name ?? 'You'} size={64} />
          <View className="flex-1">
            <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {profile?.display_name ?? '…'}
            </Text>
            {profile?.username ? (
              <Text className="text-stone-500 dark:text-stone-400">@{profile.username}</Text>
            ) : null}
            <View className="mt-1 flex-row items-center gap-2">
              <View className="rounded-full bg-stone-100 px-2 py-0.5 dark:bg-stone-800">
                <Text className="text-xs font-medium capitalize text-stone-600 dark:text-stone-300">
                  {isAnonymous ? 'guest' : (profile?.role ?? 'user')}
                </Text>
              </View>
              {profile != null && profile.trust_score > 0 ? (
                <Text className="text-xs text-stone-500 dark:text-stone-400">
                  ★ {profile.trust_score} trust
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {isAnonymous ? (
          <View className="gap-3 rounded-2xl border border-brand-300 bg-brand-50 p-4 dark:border-brand-800 dark:bg-stone-900">
            <Text className="font-semibold text-stone-900 dark:text-stone-100">
              You&apos;re browsing as a guest
            </Text>
            <Text className="text-sm text-stone-600 dark:text-stone-400">
              Add an email to keep your contributions if you change phones.
            </Text>
            <Button size="sm" onPress={() => router.push('/(auth)/upgrade')}>
              Keep my contributions
            </Button>
          </View>
        ) : null}

        <View className="flex-row gap-3">
          <Stat label="Strays added" value={profile?.animals_added_count ?? 0} />
          <Stat label="Feedings" value={profile?.feedings_count ?? 0} />
        </View>

        <View className="gap-2">
          <Button variant="outline" onPress={() => router.push('/settings')}>
            Settings
          </Button>
          {isModerator ? (
            <Button variant="outline" onPress={() => router.push('/admin')}>
              Admin dashboard
            </Button>
          ) : null}
          <Button
            variant="ghost"
            loading={busy}
            onPress={async () => {
              setBusy(true);
              try {
                await signOut();
              } finally {
                setBusy(false);
              }
            }}
          >
            Sign out
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
