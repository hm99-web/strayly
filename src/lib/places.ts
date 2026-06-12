import { GOOGLE_PLACES_KEY } from '@/constants/config';
import type { LatLng } from '@/types/domain';

/**
 * Google Places API (New) — REST with API-key headers, works from both
 * native fetch and browsers (CORS-enabled, unlike the legacy Places API).
 */
const PLACES_BASE = 'https://places.googleapis.com/v1';

export interface PlaceSuggestion {
  placeId: string;
  description: string;
}

export const placesConfigured = () => GOOGLE_PLACES_KEY.length > 0;

export async function autocompletePlaces(
  input: string,
  options: { sessionToken: string; near?: LatLng },
): Promise<PlaceSuggestion[]> {
  if (!placesConfigured() || input.trim().length < 3) return [];

  const body: Record<string, unknown> = {
    input,
    sessionToken: options.sessionToken,
  };
  if (options.near) {
    body.locationBias = {
      circle: {
        center: { latitude: options.near.latitude, longitude: options.near.longitude },
        radius: 50000,
      },
    };
  }

  const response = await fetch(`${PLACES_BASE}/places:autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Places autocomplete failed (${response.status})`);

  const json = (await response.json()) as {
    suggestions?: { placePrediction?: { placeId: string; text?: { text?: string } } }[];
  };
  return (json.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<typeof p> => p != null)
    .map((p) => ({ placeId: p.placeId, description: p.text?.text ?? '' }));
}

export async function fetchPlaceLocation(
  placeId: string,
  sessionToken: string,
): Promise<{ location: LatLng; name: string } | null> {
  if (!placesConfigured()) return null;
  const response = await fetch(
    `${PLACES_BASE}/places/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(sessionToken)}`,
    {
      headers: {
        'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
        'X-Goog-FieldMask': 'location,displayName,formattedAddress',
      },
    },
  );
  if (!response.ok) throw new Error(`Place details failed (${response.status})`);
  const json = (await response.json()) as {
    location?: { latitude: number; longitude: number };
    displayName?: { text?: string };
    formattedAddress?: string;
  };
  if (!json.location) return null;
  return {
    location: { latitude: json.location.latitude, longitude: json.location.longitude },
    name: json.displayName?.text ?? json.formattedAddress ?? 'Selected place',
  };
}

export function newSessionToken(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
