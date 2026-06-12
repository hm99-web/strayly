import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';

import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@/constants/config';
import { supabase } from '@/lib/supabase';

/**
 * Native Google sign-in → Supabase signInWithIdToken.
 * Gotcha: Supabase's Google provider must list the WEB client id as an
 * authorized audience, and GoogleSignin must be configured with it too.
 */
export const googleSignInAvailable = () => GOOGLE_WEB_CLIENT_ID.length > 0;

let configured = false;

export async function signInWithGoogle(): Promise<boolean> {
  if (!googleSignInAvailable()) {
    throw new Error('Google sign-in is not configured (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).');
  }

  if (!configured) {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    });
    configured = true;
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    return false; // user cancelled
  }
  const idToken = response.data.idToken;
  if (!idToken) throw new Error('Google did not return an ID token.');

  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
  if (error) throw error;
  return true;
}
