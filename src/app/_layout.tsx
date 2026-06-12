import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { darkNavTheme, lightNavTheme } from '@/constants/navTheme';
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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useAuthBootstrap();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? darkNavTheme : lightNavTheme}>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
