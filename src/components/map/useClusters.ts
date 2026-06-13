import { useMemo } from 'react';
import Supercluster from 'supercluster';

import { palette } from '@/constants/palette';

import { regionToBbox, regionToZoom, type AnimalMapPoint, type AnimalPoint, type MapRegion } from './AnimalMap.types';

interface DogProperties {
  animalId: string;
  color: string;
}

/**
 * Shared client-side clustering (identical behaviour on native and web).
 * The index rebuilds only when the point set changes.
 */
export function useClusters(points: AnimalPoint[], region: MapRegion): AnimalMapPoint[] {
  const index = useMemo(() => {
    const supercluster = new Supercluster<DogProperties>({ radius: 56, maxZoom: 17 });
    supercluster.load(
      points.map((point) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [point.longitude, point.latitude] },
        properties: { animalId: point.id, color: point.color },
      })),
    );
    return supercluster;
  }, [points]);

  return useMemo(() => {
    const bbox = regionToBbox(region, 1.5);
    const clusters = index.getClusters(
      [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
      Math.min(regionToZoom(region), 20),
    );
    return clusters.map((feature): AnimalMapPoint => {
      const [longitude, latitude] = feature.geometry.coordinates;
      if ('cluster' in feature.properties && feature.properties.cluster) {
        return {
          id: `cluster-${feature.properties.cluster_id}`,
          latitude,
          longitude,
          color: palette.brand[600],
          isCluster: true,
          count: feature.properties.point_count,
          clusterId: feature.properties.cluster_id,
        };
      }
      const props = feature.properties as DogProperties;
      return {
        id: props.animalId,
        latitude,
        longitude,
        color: props.color,
        isCluster: false,
      };
    });
  }, [index, region]);
}

/** Region that zooms into a cluster's children (shared tap behaviour). */
export function clusterExpansionRegion(
  points: AnimalPoint[],
  point: AnimalMapPoint,
  region: MapRegion,
): MapRegion {
  // Halve deltas relative to current view, centered on the cluster.
  return {
    latitude: point.latitude,
    longitude: point.longitude,
    latitudeDelta: Math.max(region.latitudeDelta / 3, 0.002),
    longitudeDelta: Math.max(region.longitudeDelta / 3, 0.002),
  };
}
