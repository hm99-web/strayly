import { supabase } from '@/lib/supabase';

/** Web uses Supabase's redirect OAuth flow — no client-side config needed. */
export const googleSignInAvailable = () => true;

export async function signInWithGoogle(): Promise<boolean> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
  return false; // page redirects; session arrives on return
}
