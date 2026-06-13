import type { LatLng } from '@/types/domain';

/** Region in react-native-maps shape — the lingua franca for both platforms. */
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/** A renderable point: an individual animal or a cluster of them. */
export interface AnimalMapPoint {
  id: string;
  latitude: number;
  longitude: number;
  /** Marker fill — derived via getMarkerColor (single source). */
  color: string;
  isCluster: boolean;
  /** Cluster size when isCluster. */
  count?: number;
  /** Supercluster id needed for expansion zoom. */
  clusterId?: number;
}

/** Raw input point (one animal). */
export interface AnimalPoint {
  id: string;
  latitude: number;
  longitude: number;
  color: string;
}

/**
 * The ONLY map contract in the app. react-native-maps never leaks outside
 * AnimalMap.tsx; Google Maps JS never leaks outside AnimalMap.web.tsx.
 */
export interface AnimalMapProps {
  points: AnimalPoint[];
  initialRegion: MapRegion;
  /** Fires (already debounced by the implementation) when the viewport settles. */
  onRegionChange?: (region: MapRegion) => void;
  onPointPress?: (animalId: string) => void;
  onLongPress?: (coordinate: LatLng) => void;
  showsUserLocation?: boolean;
  /** Imperative camera move: changes whenever centerKey changes. */
  center?: LatLng;
  centerKey?: number;
}

export const DEFAULT_DELTA = { latitudeDelta: 0.03, longitudeDelta: 0.03 };

export function regionToBbox(region: MapRegion, padFactor = 1.25): {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
} {
  const halfLat = (region.latitudeDelta / 2) * padFactor;
  const halfLng = (region.longitudeDelta / 2) * padFactor;
  return {
    minLng: region.longitude - halfLng,
    minLat: region.latitude - halfLat,
    maxLng: region.longitude + halfLng,
    maxLat: region.latitude + halfLat,
  };
}

/** Approximate slippy zoom from a region's longitude span. */
export function regionToZoom(region: MapRegion): number {
  return Math.round(Math.log2(360 / region.longitudeDelta));
}
