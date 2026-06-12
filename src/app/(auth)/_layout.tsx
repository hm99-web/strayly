import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { isFullAccount } = useAuth();

  // Fully signed-in users have nothing to do here.
  if (isFullAccount) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Create account' }} />
      <Stack.Screen name="upgrade" options={{ title: 'Keep your contributions' }} />
    </Stack>
  );
}
