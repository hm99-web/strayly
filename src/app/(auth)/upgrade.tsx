import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { FormInput } from '@/components/forms/FormInput';
import { Button } from '@/components/ui/Button';
import { upgradeAnonymousAccount } from '@/features/auth/api';
import { upgradeSchema, type UpgradeValues } from '@/features/auth/schemas';
import { useAuth } from '@/hooks/useAuth';

export default function UpgradeScreen() {
  const router = useRouter();
  const { isAnonymous } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpgradeValues>({
    resolver: zodResolver(upgradeSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await upgradeAnonymousAccount(values.email, values.password);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not upgrade the account');
    }
  });

  if (!isAnonymous && !done) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-stone-50 p-6 dark:bg-stone-950">
        <Text className="text-center text-stone-500 dark:text-stone-400">
          This screen is for guest accounts.
        </Text>
        <Button variant="outline" onPress={() => router.back()}>
          Go back
        </Button>
      </View>
    );
  }

  if (done) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-stone-50 p-6 dark:bg-stone-950">
        <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">Almost there</Text>
        <Text className="text-center text-stone-500 dark:text-stone-400">
          If email confirmation is enabled you&apos;ll get a verification link. All your guest
          contributions stay with this account.
        </Text>
        <Button onPress={() => router.replace('/(tabs)/profile')}>Done</Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-stone-50 dark:bg-stone-950"
    >
      <ScrollView contentContainerClassName="flex-grow justify-center gap-4 p-6" keyboardShouldPersistTaps="handled">
        <View className="mb-2 items-center gap-1">
          <Text className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            Keep your contributions
          </Text>
          <Text className="text-center text-stone-500 dark:text-stone-400">
            Add an email and password — every animal you added or fed as a guest stays yours.
          </Text>
        </View>

        <FormInput
          control={control}
          name="email"
          label="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <FormInput
          control={control}
          name="password"
          label="Password"
          secureTextEntry
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />

        {error ? (
          <Text accessibilityLiveRegion="polite" className="text-status-emergency text-sm">
            {error}
          </Text>
        ) : null}

        <Button onPress={onSubmit} loading={isSubmitting}>
          Save my account
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
