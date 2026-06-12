import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const initialized = useAuthStore((s) => s.initialized);

  const isAnonymous = session?.user.is_anonymous ?? false;

  return {
    session,
    user: session?.user ?? null,
    userId: session?.user.id ?? null,
    initialized,
    isSignedIn: session != null,
    isAnonymous,
    isFullAccount: session != null && !isAnonymous,
  };
}
