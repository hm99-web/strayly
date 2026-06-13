import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { darkNavTheme, lightNavTheme } from '@/constants/navTheme';
import { useAuth } from '@/hooks/useAuth';
import { registerForPushNotifications, useNotificationDeepLinks } from '@/lib/pushNotifications';
import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

function useAuthBootstrap() {
  useEffect(() => {
    const { setSession, setInitialized } = useAuthStore.getState();

    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setInitialized());

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
}

function PushNotificationsGate() {
  const { userId } = useAuth();
  useNotificationDeepLinks();

  useEffect(() => {
    if (userId) {
      void registerForPushNotifications(userId);
    }
  }, [userId]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useAuthBootstrap();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? darkNavTheme : lightNavTheme}>
        <StatusBar style="auto" />
        <PushNotificationsGate />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="animal/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="animal/[id]/feed" options={{ presentation: 'modal' }} />
          <Stack.Screen name="animal/[id]/medical" options={{ presentation: 'modal' }} />
          <Stack.Screen name="animal/[id]/vaccinate" options={{ presentation: 'modal' }} />
          <Stack.Screen name="animal/[id]/report" options={{ presentation: 'modal' }} />
          <Stack.Screen name="animal/[id]/edit" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
