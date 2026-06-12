import { useCallback, useState } from 'react';

import { getCurrentPosition, reverseGeocode, type UserPosition } from '@/lib/location';
import { useMapStore } from '@/stores/mapStore';

/**
 * "Near me" control: fetches GPS once on demand and promotes it to the shared
 * search center used by the list + map queries.
 */
export function useUserLocation() {
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);
  const setSearchCenter = useMapStore((s) => s.setSearchCenter);

  const locate = useCallback(async (): Promise<UserPosition | null> => {
    setLoading(true);
    try {
      const current = await getCurrentPosition();
      if (!current) {
        setDenied(true);
        return null;
      }
      setDenied(false);
      setPosition(current);
      const label = (await reverseGeocode(current)) ?? 'Near you';
      setSearchCenter(current, label, true);
      return current;
    } finally {
      setLoading(false);
    }
  }, [setSearchCenter]);

  return { position, loading, denied, locate };
}
