import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/config';
import type { Database } from '@/types/database';

import { authStorage } from './supabaseStorage';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail loudly in dev — a missing .env otherwise surfaces as opaque network errors.
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are not set. ' +
      'Copy .env.example to .env and fill in the values from `npx supabase status`.',
  );
}

// Placeholder fallbacks keep module evaluation (and static export) from
// crashing when .env is missing; real requests will fail with the warning above.
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  },
);

// Keep token refresh paused while the app is backgrounded (Supabase guidance).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

/** Public URL for a storage object path; '' for null paths. */
export function publicUrl(bucket: 'avatars' | 'animal-media', path: string | null | undefined): string {
  if (!path) return '';
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
