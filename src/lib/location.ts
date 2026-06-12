import * as Location from 'expo-location';

import type { LatLng } from '@/types/domain';

export interface UserPosition extends LatLng {
  accuracyM: number | null;
}

/**
 * One-shot position with permission handling.
 * Returns null when permission is denied or the lookup fails — callers fall
 * back to the manual/search location (DEFAULT_CENTER initially).
 */
export async function getCurrentPosition(): Promise<UserPosition | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracyM: position.coords.accuracy ?? null,
    };
  } catch {
    return null;
  }
}

/** Best-effort reverse geocode to a short human label. */
export async function reverseGeocode(point: LatLng): Promise<string | null> {
  try {
    const [first] = await Location.reverseGeocodeAsync(point);
    if (!first) return null;
    return [first.name ?? first.street, first.district ?? first.subregion, first.city]
      .filter(Boolean)
      .slice(0, 2)
      .join(', ');
  } catch {
    return null;
  }
}
