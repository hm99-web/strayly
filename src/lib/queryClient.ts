import { onlineManager, QueryClient } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

// Drive TanStack's online state from the device's real connectivity.
if (Platform.OS !== 'web') {
  onlineManager.setEventListener((setOnline) => {
    const subscription = Network.addNetworkStateListener((state) => {
      setOnline(state.isConnected === true);
    });
    return () => subscription.remove();
  });
}

/**
 * Defaults tuned for slow/flaky mobile networks: serve cache first, retry with
 * backoff, keep data warm for a minute.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});
