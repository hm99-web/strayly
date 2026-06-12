export const APP_NAME = 'Paw Guardians';

/** Fallback map center when location permission is denied: Bengaluru. */
export const DEFAULT_CENTER = { latitude: 12.9716, longitude: 77.5946 };

export const DEFAULT_RADIUS_M = 2000;
export const RADIUS_OPTIONS_M = [500, 1000, 2000, 5000, 10000] as const;

/** Radius used by the pre-create duplicate check. */
export const DUPLICATE_CHECK_RADIUS_M = 150;

/** Max photos per upload action. */
export const MAX_PHOTOS_PER_UPLOAD = 5;

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const GOOGLE_MAPS_WEB_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY ?? '';
export const GOOGLE_PLACES_KEY = process.env.EXPO_PUBLIC_PLACES_KEY ?? '';
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
