import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { FormInput } from '@/components/forms/FormInput';
import { Button } from '@/components/ui/Button';
import { signUpWithEmail } from '@/features/auth/api';
import { signUpSchema, type SignUpValues } from '@/features/auth/schemas';

export default function SignUpScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const { session } = await signUpWithEmail(values.email, values.password, values.displayName);
      if (!session) {
        // Email confirmation is enabled (production) — session arrives after verify.
        setNeedsConfirmation(true);
        return;
      }
      if (returnTo) {
        router.replace(returnTo as never);
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the account');
    }
  });

  if (needsConfirmation) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-stone-50 p-6 dark:bg-stone-950">
        <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Check your email
        </Text>
        <Text className="text-center text-stone-500 dark:text-stone-400">
          We sent a confirmation link. Open it, then come back and sign in.
        </Text>
        <Button variant="outline" onPress={() => router.replace('/(auth)/sign-in')}>
          Back to sign in
        </Button>
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
            Join Paw Guardians
          </Text>
          <Text className="text-center text-stone-500 dark:text-stone-400">
            Help your neighbourhood look after its dogs.
          </Text>
        </View>

        <FormInput control={control} name="displayName" label="Your name" placeholder="Asha Verma" />
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
        <FormInput
          control={control}
          name="confirmPassword"
          label="Confirm password"
          secureTextEntry
          autoComplete="new-password"
          placeholder="••••••••"
        />

        {error ? (
          <Text accessibilityLiveRegion="polite" className="text-status-emergency text-sm">
            {error}
          </Text>
        ) : null}

        <Button onPress={onSubmit} loading={isSubmitting}>
          Create account
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
