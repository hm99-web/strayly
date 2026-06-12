import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { FormInput } from '@/components/forms/FormInput';
import { Button } from '@/components/ui/Button';
import { signInAnonymously, signInWithEmail } from '@/features/auth/api';
import { googleSignInAvailable, signInWithGoogle } from '@/features/auth/googleAuth';
import { signInSchema, type SignInValues } from '@/features/auth/schemas';

export default function SignInScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  function finish() {
    if (returnTo) {
      router.replace(returnTo as never);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await signInWithEmail(values.email, values.password);
      finish();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in');
    }
  });

  async function onGuest() {
    setError(null);
    setGuestLoading(true);
    try {
      await signInAnonymously();
      finish();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not continue as guest');
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-stone-50 dark:bg-stone-950"
    >
      <ScrollView contentContainerClassName="flex-grow justify-center gap-4 p-6" keyboardShouldPersistTaps="handled">
        <View className="mb-2 items-center gap-1">
          <Text className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            Welcome back
          </Text>
          <Text className="text-center text-stone-500 dark:text-stone-400">
            Sign in to feed, report and care for street dogs.
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
          autoComplete="current-password"
          placeholder="••••••••"
        />

        {error ? (
          <Text accessibilityLiveRegion="polite" className="text-status-emergency text-sm">
            {error}
          </Text>
        ) : null}

        <Button onPress={onSubmit} loading={isSubmitting}>
          Sign in
        </Button>
        {googleSignInAvailable() ? (
          <Button
            variant="outline"
            loading={googleLoading}
            onPress={async () => {
              setError(null);
              setGoogleLoading(true);
              try {
                const signedIn = await signInWithGoogle();
                if (signedIn) finish();
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Google sign-in failed');
              } finally {
                setGoogleLoading(false);
              }
            }}
          >
            <Ionicons name="logo-google" size={18} color="#EA580C" />
            <Text className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Continue with Google
            </Text>
          </Button>
        ) : null}
        <Button variant="outline" onPress={onGuest} loading={guestLoading}>
          Continue as guest
        </Button>

        <View className="flex-row justify-center gap-1 pt-2">
          <Text className="text-stone-500 dark:text-stone-400">New here?</Text>
          <Link
            href={{ pathname: '/(auth)/sign-up', params: returnTo ? { returnTo } : {} }}
            className="text-brand-600 dark:text-brand-400 font-semibold"
          >
            Create an account
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
