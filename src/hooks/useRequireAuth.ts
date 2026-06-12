import { usePathname, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useAuth } from './useAuth';

/**
 * Gate for write actions. Browsing never requires auth; tapping Feed/Report/
 * Follow/Add does. Returns a guard: runs the action when a session exists
 * (anonymous counts), otherwise routes to sign-in with a return path.
 */
export function useRequireAuth() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (action?: () => void): boolean => {
      if (isSignedIn) {
        action?.();
        return true;
      }
      router.push({ pathname: '/(auth)/sign-in', params: { returnTo: pathname } });
      return false;
    },
    [isSignedIn, router, pathname],
  );
}
